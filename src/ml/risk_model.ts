/**
 * NETHRA Risk Model — Real Gradient Boosting Machine (GBM)
 *
 * True GBM implementation:
 *   - Target variable: priority score (High=1, Medium=0.5, Low=0) × closure bonus
 *   - Weak learners: axis-aligned decision stumps (depth-1 trees)
 *   - Loss function: mean squared error (MSE)
 *   - Each round fits a stump on the NEGATIVE GRADIENT of the current residuals
 *   - Learning rate η=0.1, T=25 boosting rounds
 *   - Feature vector: [lat_norm, lng_norm, hour_norm, dow_norm, closure_flag,
 *                      cause_encoded, corridor_density_norm]
 *
 * The trained ensemble is then used to predict risk for new events by
 * constructing a compatible feature vector from event inputs.
 *
 * All training is in-process from incidents.json — no external libraries.
 */

import type { Incident } from "@/lib/intel";
import raw from "@/data/incidents.json";

const INCIDENTS = raw as Incident[];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type RiskFeatures = {
  lat: number;
  lng: number;
  crowdSize: number;
  durationHours: number;
  eventKindBase: number;      // 0–100 base risk for the event kind
  crowdMultiplier: number;    // kind-specific crowd pressure multiplier
  hourOfDay: number;          // 0–23
  dayOfWeek: number;          // 0–6
};

export type RiskPrediction = {
  riskScore: number;          // 0–100
  confidence: number;         // 0–100
  mlContribution: number;     // delta vs rule baseline
  featureImportance: {
    locationHotspot: number;
    crowdPressure: number;
    temporalRisk: number;
    causePattern: number;
  };
  reasoning: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Feature engineering
// ─────────────────────────────────────────────────────────────────────────────

// Feature indices
const F_LAT = 0;
const F_LNG = 1;
const F_HOUR = 2;
const F_DOW = 3;
const F_CLOSURE = 4;
const F_PRIORITY = 5;
const F_CORR_FREQ = 6;
const N_FEATURES = 7;

// Normalization ranges (Bengaluru bbox + time ranges)
const LAT_MIN = 12.82, LAT_MAX = 13.10;
const LNG_MIN = 77.46, LNG_MAX = 77.76;

function normalize(v: number, lo: number, hi: number): number {
  return hi === lo ? 0 : (v - lo) / (hi - lo);
}

// Target: severity score 0–1 derived from priority + closure
function incidentTarget(inc: Incident): number {
  const priorityScore = inc.priority === "High" ? 1.0
    : inc.priority === "Medium" ? 0.5 : 0.2;
  const closureBonus = inc.closure ? 0.25 : 0.0;
  return Math.min(1.0, priorityScore + closureBonus);
}

// ─────────────────────────────────────────────────────────────────────────────
// Decision stump (depth-1 tree) — the GBM weak learner
// ─────────────────────────────────────────────────────────────────────────────

type Stump = {
  featureIdx: number;
  threshold: number;
  leftValue: number;   // prediction for feature <= threshold
  rightValue: number;  // prediction for feature >  threshold
  featureName: string;
};

function fitStump(
  X: Float64Array[],
  residuals: Float64Array,
): Stump {
  const n = X.length;
  let bestSSR = Infinity;
  let best: Stump = { featureIdx: 0, threshold: 0, leftValue: 0, rightValue: 0, featureName: "lat" };

  const featureNames = ["lat", "lng", "hour", "dow", "closure", "priority", "corridor_freq"];

  for (let f = 0; f < N_FEATURES; f++) {
    // Collect unique thresholds (midpoints between consecutive sorted values)
    const vals = Array.from({ length: n }, (_, i) => X[i][f]).sort((a, b) => a - b);
    const thresholds = new Set<number>();
    for (let i = 0; i < vals.length - 1; i++) {
      thresholds.add((vals[i] + vals[i + 1]) / 2);
    }
    // Limit candidate thresholds for performance
    const candidates = [...thresholds].filter((_, i) => i % Math.max(1, Math.floor(thresholds.size / 20)) === 0);

    for (const thresh of candidates) {
      let leftSum = 0, leftCount = 0;
      let rightSum = 0, rightCount = 0;

      for (let i = 0; i < n; i++) {
        if (X[i][f] <= thresh) {
          leftSum += residuals[i];
          leftCount++;
        } else {
          rightSum += residuals[i];
          rightCount++;
        }
      }

      if (leftCount === 0 || rightCount === 0) continue;

      const leftVal = leftSum / leftCount;
      const rightVal = rightSum / rightCount;

      // SSR = sum of squared residuals after this split
      let ssr = 0;
      for (let i = 0; i < n; i++) {
        const pred = X[i][f] <= thresh ? leftVal : rightVal;
        ssr += (residuals[i] - pred) ** 2;
      }

      if (ssr < bestSSR) {
        bestSSR = ssr;
        best = { featureIdx: f, threshold: thresh, leftValue: leftVal, rightValue: rightVal, featureName: featureNames[f] };
      }
    }
  }

  return best;
}

function predictStump(stump: Stump, x: Float64Array): number {
  return x[stump.featureIdx] <= stump.threshold ? stump.leftValue : stump.rightValue;
}

// ─────────────────────────────────────────────────────────────────────────────
// GBM training
// ─────────────────────────────────────────────────────────────────────────────

const ETA = 0.1;     // learning rate
const T = 25;      // boosting rounds

type GBMModel = {
  baseMean: number;
  stumps: Stump[];
  // Feature importance: total squared gain per feature index
  importance: Float64Array;
  // Normalization stats for inference
  corrFreqMax: number;
  trainingMSE: number;
};

let _model: GBMModel | null = null;
// Mutable weights that can be updated by the feedback loop (see intel.ts)
export let _featureWeightOverrides: Float64Array | null = null;

function buildFeatureVector(
  inc: Incident,
  corrFreqMax: number,
  corrFreqMap: Map<string, number>,
): Float64Array {
  const x = new Float64Array(N_FEATURES);
  x[F_LAT] = normalize(inc.lat, LAT_MIN, LAT_MAX);
  x[F_LNG] = normalize(inc.lng, LNG_MIN, LNG_MAX);
  const h = new Date(inc.start).getUTCHours();
  x[F_HOUR] = normalize(h, 0, 23);
  const dow = new Date(inc.start).getUTCDay();
  x[F_DOW] = normalize(dow, 0, 6);
  x[F_CLOSURE] = inc.closure ? 1.0 : 0.0;
  x[F_PRIORITY] = inc.priority === "High" ? 1.0 : inc.priority === "Medium" ? 0.5 : 0.0;
  const freq = corrFreqMap.get(inc.corridor || "Non-corridor") ?? 0;
  x[F_CORR_FREQ] = corrFreqMax > 0 ? freq / corrFreqMax : 0;
  return x;
}

function train(): GBMModel {
  if (_model) return _model;

  const n = INCIDENTS.length;

  // Build corridor frequency map
  const corrFreqMap = new Map<string, number>();
  for (const inc of INCIDENTS) {
    const c = inc.corridor || "Non-corridor";
    corrFreqMap.set(c, (corrFreqMap.get(c) ?? 0) + 1);
  }
  const corrFreqMax = Math.max(...corrFreqMap.values(), 1);

  // Build feature matrix X and target y
  const X: Float64Array[] = INCIDENTS.map(inc => buildFeatureVector(inc, corrFreqMax, corrFreqMap));
  const y = new Float64Array(INCIDENTS.map(incidentTarget));

  // F[i] = current ensemble prediction for sample i
  const baseMean = y.reduce((a, b) => a + b, 0) / n;
  const F = new Float64Array(n).fill(baseMean);

  const stumps: Stump[] = [];
  const importance = new Float64Array(N_FEATURES);

  for (let t = 0; t < T; t++) {
    // Negative gradient of MSE loss = residuals
    const residuals = new Float64Array(n);
    for (let i = 0; i < n; i++) residuals[i] = y[i] - F[i];

    const stump = fitStump(X, residuals);
    stumps.push(stump);

    // Update ensemble predictions
    for (let i = 0; i < n; i++) {
      F[i] += ETA * predictStump(stump, X[i]);
    }

    // Accumulate feature importance: variance reduction from this stump
    const gainLeft = stump.leftValue ** 2;
    const gainRight = stump.rightValue ** 2;
    importance[stump.featureIdx] += gainLeft + gainRight;
  }

  // Final training MSE
  let mse = 0;
  for (let i = 0; i < n; i++) mse += (y[i] - F[i]) ** 2;
  mse /= n;

  _model = { baseMean, stumps, importance, corrFreqMax, trainingMSE: mse };
  return _model;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inference
// ─────────────────────────────────────────────────────────────────────────────

function predictGBM(x: Float64Array): number {
  const model = train();
  let pred = model.baseMean;
  for (const stump of model.stumps) {
    pred += ETA * predictStump(stump, x);
  }
  return Math.max(0, Math.min(1, pred)); // clamp to [0,1] severity
}

// Build feature vector for a new (planned) event — no incident fields available,
// so we synthesize closure/priority from the event kind base risk.
function eventFeatureVector(features: RiskFeatures, corrFreqMax: number): Float64Array {
  const x = new Float64Array(N_FEATURES);
  x[F_LAT] = normalize(features.lat, LAT_MIN, LAT_MAX);
  x[F_LNG] = normalize(features.lng, LNG_MIN, LNG_MAX);
  x[F_HOUR] = normalize(features.hourOfDay, 0, 23);
  x[F_DOW] = normalize(features.dayOfWeek, 0, 6);
  // For a planned event: estimate closure probability from base risk
  x[F_CLOSURE] = features.eventKindBase >= 70 ? 0.8 : features.eventKindBase >= 50 ? 0.4 : 0.1;
  x[F_PRIORITY] = normalize(features.eventKindBase, 0, 100);
  // Crowd pressure as proxy for corridor frequency impact
  const crowdLoad = (features.crowdSize * features.crowdMultiplier) / 1000;
  x[F_CORR_FREQ] = Math.min(1, crowdLoad / 20);
  return x;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function predictRisk(features: RiskFeatures): RiskPrediction {
  const model = train();

  // GBM severity prediction (0–1)
  const x = eventFeatureVector(features, model.corrFreqMax);
  const gbmSeverity = predictGBM(x);

  // Scale severity to risk score: severity × range + base
  // Severity=1 → risk 98, severity=0 → risk 15
  const gbmRisk = Math.round(15 + gbmSeverity * 83);

  // Blend with event kind base for final score (70% GBM, 30% domain prior)
  const riskScore = Math.max(15, Math.min(98,
    Math.round(gbmRisk * 0.70 + features.eventKindBase * 0.30),
  ));

  const mlContribution = riskScore - features.eventKindBase;

  // Feature importance normalized to [0,1]
  const totalImp = model.importance.reduce((a, b) => a + b, 0) || 1;
  const locationHotspot = (model.importance[F_LAT] + model.importance[F_LNG]) / (2 * totalImp);
  const crowdPressure = model.importance[F_CORR_FREQ] / totalImp;
  const temporalRisk = (model.importance[F_HOUR] + model.importance[F_DOW]) / (2 * totalImp);
  const causePattern = (model.importance[F_CLOSURE] + model.importance[F_PRIORITY]) / (2 * totalImp);

  // Confidence: inversely proportional to training MSE, boosted by crowd signal
  const baseConf = Math.max(50, Math.min(92, Math.round(85 - model.trainingMSE * 200)));
  const crowdBoost = Math.min(6, Math.round((features.crowdSize / 10000)));
  const confidence = Math.min(95, baseConf + crowdBoost);

  const reasoning: string[] = [
    `GBM ensemble (${T} stumps, η=${ETA}): severity score ${(gbmSeverity * 100).toFixed(1)}% → risk ${gbmRisk}.`,
    `Training converged to MSE=${model.trainingMSE.toFixed(4)} on ${INCIDENTS.length} incidents.`,
    `Top GBM split feature: "${model.stumps[0]?.featureName ?? "—"}" (round 1).`,
    `Spatial importance: ${(locationHotspot * 100).toFixed(1)}% | Temporal: ${(temporalRisk * 100).toFixed(1)}% | Crowd: ${(crowdPressure * 100).toFixed(1)}%.`,
    `Final blended risk: ${gbmRisk}×0.70 + ${features.eventKindBase}×0.30 = ${riskScore}.`,
  ];

  return {
    riskScore,
    confidence,
    mlContribution,
    featureImportance: {
      locationHotspot: +locationHotspot.toFixed(3),
      crowdPressure: +crowdPressure.toFixed(3),
      temporalRisk: +temporalRisk.toFixed(3),
      causePattern: +causePattern.toFixed(3),
    },
    reasoning,
  };
}

/** Called by feedback loop to nudge model weights post-event */
export function applyFeedback(actualSeverity: number, predictedSeverity: number): void {
  const model = _model;
  if (!model) return;
  // Online correction: adjust base mean slightly toward actual
  const error = actualSeverity - predictedSeverity;
  model.baseMean += 0.05 * error; // small online learning rate
}

export function getModelStats(): { rounds: number; mse: number; topFeature: string } {
  const model = train();
  const top = model.stumps.reduce((best, s) => {
    const imp = model.importance[s.featureIdx];
    return imp > model.importance[best.featureIdx] ? s : best;
  }, model.stumps[0]);
  return { rounds: model.stumps.length, mse: model.trainingMSE, topFeature: top?.featureName ?? "—" };
}

export function getTopHotspots(n = 20): Array<{ lat: number; lng: number; count: number; closureRate: number; highPriorityRate: number; avgHour: number }> {
  const GRID_DEG = 0.01;
  const gridMap = new Map<string, { lats: number[]; lngs: number[]; closures: number; highs: number; hours: number[] }>();
  for (const inc of INCIDENTS) {
    const key = `${Math.round(inc.lat / GRID_DEG)}_${Math.round(inc.lng / GRID_DEG)}`;
    if (!gridMap.has(key)) gridMap.set(key, { lats: [], lngs: [], closures: 0, highs: 0, hours: [] });
    const cell = gridMap.get(key)!;
    cell.lats.push(inc.lat); cell.lngs.push(inc.lng);
    if (inc.closure) cell.closures++;
    if (inc.priority === "High") cell.highs++;
    cell.hours.push(new Date(inc.start).getUTCHours());
  }
  return [...gridMap.values()]
    .map(cell => {
      const c = cell.lats.length;
      return {
        lat: cell.lats.reduce((a, b) => a + b, 0) / c,
        lng: cell.lngs.reduce((a, b) => a + b, 0) / c,
        count: c,
        closureRate: cell.closures / c,
        highPriorityRate: cell.highs / c,
        avgHour: cell.hours.reduce((a, b) => a + b, 0) / c,
      };
    })
    .sort((a, b) => (b.closureRate * 2 + b.highPriorityRate) * b.count - (a.closureRate * 2 + a.highPriorityRate) * a.count)
    .slice(0, n);
}

export function warmup(): void { train(); }
