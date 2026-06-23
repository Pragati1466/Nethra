import raw from "@/data/incidents.json";
import type { Incident } from "@/lib/intel";
import { safeDivide, safeNumber } from "@/ml/safe_number";

export type AstamFeatureBundle = {
  severityScore: number;
  priorityScore: number;
  closureScore: number;
  corridorScore: number;
  densityScore: number;
  proximityScore: number;
  crowdLoadScore: number;
  durationScore: number;
  kindBaseRisk: number;
  kindCrowdMult: number;
};

type RegressionModel = {
  weights: number[];
  bias: number;
  means: number[];
  stds: number[];
};

type TrainingSample = {
  features: number[];
  target: number;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, safeNumber(n)));
}

function normalizeCause(cause: string) {
  return cause.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function inferEventKindFromCause(cause: string) {
  const normalized = normalizeCause(cause);
  if (normalized.includes("festival") || normalized.includes("procession") || normalized.includes("public")) {
    return { baseRisk: 60, crowdMult: 1.2 };
  }
  if (normalized.includes("cricket")) return { baseRisk: 72, crowdMult: 1.4 };
  if (normalized.includes("protest") || normalized.includes("rally")) return { baseRisk: 78, crowdMult: 1.5 };
  if (normalized.includes("vip")) return { baseRisk: 65, crowdMult: 0.6 };
  if (normalized.includes("construct") || normalized.includes("pot") || normalized.includes("road")) {
    return { baseRisk: 40, crowdMult: 0.2 };
  }
  if (normalized.includes("water") || normalized.includes("logging")) return { baseRisk: 42, crowdMult: 0.0 };
  if (normalized.includes("accid") || normalized.includes("breakdown")) return { baseRisk: 51, crowdMult: 0.3 };
  return { baseRisk: 55, crowdMult: 1.0 };
}

export function incidentSeverity(inc: Incident) {
  const causeWeights: Record<string, number> = {
    accident: 1.45,
    vehicle_breakdown: 0.92,
    water_logging: 1.25,
    construction: 1.02,
    public_event: 1.18,
    procession: 1.14,
    protest: 1.26,
    vip_movement: 1.1,
    pot_holes: 0.88,
    congestion: 0.95,
    road_conditions: 0.9,
    tree_fall: 0.86,
    debris: 0.8,
    others: 0.78,
    test_demo: 0.7,
    fog_low_visibility: 1.18,
  };

  const priorityWeights: Record<string, number> = {
    high: 1.2,
    medium: 1.0,
    low: 0.82,
  };

  const causeWeight = causeWeights[normalizeCause(inc.cause)] ?? 1;
  const priorityWeight = priorityWeights[inc.priority.toLowerCase()] ?? 1;
  const closureFactor = inc.closure ? 1.08 : 0.94;
  const corridorFactor = inc.corridor && inc.corridor !== "Non-corridor" ? 1.05 : 0.95;

  return causeWeight * priorityWeight * closureFactor * corridorFactor;
}

function buildIncidentFeatureVector(inc: Incident): number[] {
  const severity = incidentSeverity(inc);
  const priorityWeight = inc.priority.toLowerCase() === "high" ? 1.2 : inc.priority.toLowerCase() === "medium" ? 1.0 : 0.82;
  const closureScore = inc.closure ? 1.08 : 0.94;
  const corridorScore = inc.corridor && inc.corridor !== "Non-corridor" ? 1.05 : 0.95;
  const causeWeight = (normalizeCause(inc.cause) in { accident: 1 }) ? 1 : 1;
  const kind = inferEventKindFromCause(inc.cause);
  const compactCause = normalizeCause(inc.cause);
  const causeScore = compactCause.includes("accid") || compactCause.includes("breakdown")
    ? 1.45
    : compactCause.includes("water") || compactCause.includes("logging")
      ? 1.25
      : compactCause.includes("protest") || compactCause.includes("rally")
        ? 1.26
        : compactCause.includes("festival") || compactCause.includes("procession") || compactCause.includes("public")
          ? 1.18
          : compactCause.includes("vip")
            ? 1.1
            : compactCause.includes("construct") || compactCause.includes("pot") || compactCause.includes("road")
              ? 1.02
              : 0.95;

  return [severity / 2, priorityWeight, closureScore, corridorScore, causeScore, kind.baseRisk / 100, kind.crowdMult / 1.5, inc.closure ? 1 : 0, inc.corridor && inc.corridor !== "Non-corridor" ? 1 : 0];
}

function buildTrainingSamples() {
  const samples: TrainingSample[] = [];
  const incidents = (raw as Incident[]).slice(0, Math.min(6000, (raw as Incident[]).length));
  for (const inc of incidents) {
    const severity = incidentSeverity(inc);
    const priorityWeight = inc.priority.toLowerCase() === "high" ? 1.2 : inc.priority.toLowerCase() === "medium" ? 1.0 : 0.82;
    const closureFlag = inc.closure ? 1 : 0;
    const corridorFlag = inc.corridor && inc.corridor !== "Non-corridor" ? 1 : 0;
    const kind = inferEventKindFromCause(inc.cause);
    const targetRisk = clamp(Math.round(15 + severity * 16 + priorityWeight * 10 + closureFlag * 8 + corridorFlag * 6 + kind.baseRisk * 0.18), 15, 98);
    const targetDelay = clamp(Math.round(8 + severity * 7 + priorityWeight * 5 + closureFlag * 10 + corridorFlag * 4 + kind.baseRisk * 0.08), 8, 140);
    const targetImpact = clamp(+(1.2 + severity * 0.16 + closureFlag * 0.32 + corridorFlag * 0.18 + kind.crowdMult * 0.2).toFixed(1), 1.2, 6.0);
    samples.push({
      features: buildIncidentFeatureVector(inc),
      target: targetRisk,
    });
    samples.push({
      features: buildIncidentFeatureVector(inc),
      target: targetDelay,
    });
    samples.push({
      features: buildIncidentFeatureVector(inc),
      target: targetImpact,
    });
  }
  return samples;
}

function trainRegressionModel(samples: TrainingSample[], iterations = 400, learningRate = 0.01) {
  const featureCount = samples[0]?.features.length ?? 0;
  const weights = Array(featureCount).fill(0);
  let bias = 0;
  const means = Array(featureCount).fill(0);
  const stds = Array(featureCount).fill(1);

  for (let i = 0; i < featureCount; i++) {
    const values = samples.map((s) => s.features[i]);
    const mean = values.length ? safeDivide(values.reduce((sum, value) => sum + safeNumber(value), 0), values.length) : 0;
    const variance = values.length
      ? safeDivide(values.reduce((sum, value) => sum + (safeNumber(value) - mean) ** 2, 0), values.length)
      : 0;
    means[i] = mean;
    stds[i] = Math.sqrt(variance) || 1;
  }

  const normalizedSamples = samples.map((sample) => ({
    ...sample,
    features: sample.features.map((value, index) => (value - means[index]) / stds[index]),
  }));

  for (let epoch = 0; epoch < iterations; epoch++) {
    let gradientBias = 0;
    const gradientWeights = Array(featureCount).fill(0);
    for (const sample of normalizedSamples) {
      const prediction = bias + sample.features.reduce((sum, value, index) => sum + weights[index] * value, 0);
      const error = prediction - sample.target;
      gradientBias += error / normalizedSamples.length;
      for (let i = 0; i < featureCount; i++) {
        gradientWeights[i] += (error * sample.features[i]) / normalizedSamples.length;
      }
    }
    bias -= learningRate * gradientBias;
    for (let i = 0; i < featureCount; i++) {
      weights[i] -= learningRate * gradientWeights[i];
    }
  }

  return { weights, bias, means, stds } satisfies RegressionModel;
}

function predictRegressionModel(model: RegressionModel, features: number[]) {
  const normalized = features.map((value, index) => {
    const mean = safeNumber(model.means[index]);
    const std = safeNumber(model.stds[index]) || 1;
    return safeDivide(safeNumber(value) - mean, std);
  });
  const score = model.bias + normalized.reduce((sum, value, index) => sum + safeNumber(model.weights[index]) * value, 0);
  return safeNumber(score);
}

const riskModel = trainRegressionModel(buildTrainingSamples());
const delayModel = trainRegressionModel(buildTrainingSamples());
const impactModel = trainRegressionModel(buildTrainingSamples());
const confidenceModel = trainRegressionModel(buildTrainingSamples());

function buildRegressionFeatureVector(features: AstamFeatureBundle) {
  return [
    safeDivide(safeNumber(features.severityScore), 12),
    safeDivide(safeNumber(features.priorityScore), 1.2),
    safeDivide(safeNumber(features.closureScore), 1.08),
    safeDivide(safeNumber(features.corridorScore), 1.05),
    safeDivide(safeNumber(features.densityScore), 20),
    safeNumber(features.proximityScore),
    safeDivide(safeNumber(features.crowdLoadScore), 5),
    safeDivide(safeNumber(features.durationScore), 3),
    safeDivide(safeNumber(features.kindBaseRisk), 80),
    safeDivide(safeNumber(features.kindCrowdMult), 1.5),
  ];
}

export function engineerAstamFeatures(params: {
  kindBaseRisk: number;
  kindCrowdMult: number;
  crowd: number;
  durationHours: number;
  nearby: Array<{ inc: Incident; dKm: number }>;
  radiusKm: number;
}): AstamFeatureBundle {
  const crowdLoad = safeDivide(safeNumber(params.crowd) * safeNumber(params.kindCrowdMult), 1000);
  const durationFactor = Math.min(safeDivide(safeNumber(params.durationHours), 4), 2.5);
  const densityScore = params.nearby.length;

  const severityScore = params.nearby.reduce((sum, x) => {
    const proximity = Math.max(0.35, 1 - safeDivide(safeNumber(x.dKm), safeNumber(params.radiusKm)));
    return sum + safeNumber(incidentSeverity(x.inc)) * proximity;
  }, 0);

  const priorityScore = safeDivide(
    params.nearby.reduce((sum, x) => sum + (x.inc.priority.toLowerCase() === "high" ? 1.2 : 0.9), 0),
    Math.max(1, params.nearby.length),
  );
  const closureScore = safeDivide(
    params.nearby.reduce((sum, x) => sum + (x.inc.closure ? 1.08 : 0.94), 0),
    Math.max(1, params.nearby.length),
  );
  const corridorScore = safeDivide(
    params.nearby.reduce((sum, x) => sum + (x.inc.corridor && x.inc.corridor !== "Non-corridor" ? 1.05 : 0.95), 0),
    Math.max(1, params.nearby.length),
  );
  const proximityScore = safeDivide(
    params.nearby.reduce((sum, x) => sum + Math.max(0.35, 1 - safeDivide(safeNumber(x.dKm), safeNumber(params.radiusKm))), 0),
    Math.max(1, params.nearby.length),
  );

  return {
    severityScore,
    priorityScore,
    closureScore,
    corridorScore,
    densityScore,
    proximityScore,
    crowdLoadScore: crowdLoad,
    durationScore: durationFactor,
    kindBaseRisk: params.kindBaseRisk,
    kindCrowdMult: params.kindCrowdMult,
  };
}

export function scoreWithLightGbm(features: AstamFeatureBundle) {
  const regressionVector = buildRegressionFeatureVector(features);
  const rawRisk = predictRegressionModel(riskModel, regressionVector);
  const rawDelay = predictRegressionModel(delayModel, regressionVector);
  const rawImpact = predictRegressionModel(impactModel, regressionVector);
  const rawConfidence = predictRegressionModel(confidenceModel, regressionVector);

  const riskScore = clamp(Math.round(safeNumber(rawRisk)), 15, 98);
  const delayMinutes = clamp(Math.round(safeNumber(rawDelay)), 8, 140);
  const impactRadiusKm = +(Math.max(1.1, Math.min(6.5, safeNumber(rawImpact))).toFixed(1));
  const confidence = clamp(Math.round(safeNumber(rawConfidence)), 45, 95);

  return {
    riskScore,
    confidence,
    delayMinutes,
    impactRadiusKm,
  };
}

export function findSimilarIncidents(params: {
  query: { lat: number; lng: number; radiusKm: number };
  incidents: Incident[];
  limit?: number;
}) {
  const { query, incidents, limit = 5 } = params;
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return incidents
    .map((inc) => {
      const dLat = toRad(inc.lat - query.lat);
      const dLng = toRad(inc.lng - query.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(query.lat)) * Math.cos(toRad(inc.lat)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.asin(Math.sqrt(a));
      const dKm = safeNumber(R * c);
      const severity = incidentSeverity(inc);
      const proximity = Math.max(0.35, 1 - safeDivide(dKm, safeNumber(query.radiusKm)));
      return { inc, dKm, score: safeNumber(severity) * proximity };
    })
    .filter((x) => x.dKm <= query.radiusKm)
    .sort((a, b) => b.score - a.score || a.dKm - b.dKm)
    .slice(0, limit)
    .map((x) => x.inc);
}
