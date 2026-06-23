import raw from "@/data/incidents.json";
import type { Incident } from "@/lib/intel";

export type RegressionModel = {
  weights: number[];
  bias: number;
  featureNames: string[];
};

export type TargetKind = "risk" | "delay";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function normalizeCause(cause: string) {
  return cause.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function priorityScore(priority: string) {
  const normalized = priority.toLowerCase();
  if (normalized === "high") return 1.4;
  if (normalized === "medium") return 1.0;
  return 0.7;
}

function causeScore(cause: string) {
  const normalized = normalizeCause(cause);
  if (normalized.includes("accid") || normalized.includes("breakdown")) return 1.3;
  if (normalized.includes("water") || normalized.includes("logging")) return 1.25;
  if (normalized.includes("protest") || normalized.includes("rally")) return 1.35;
  if (normalized.includes("festival") || normalized.includes("procession") || normalized.includes("public")) return 1.2;
  if (normalized.includes("vip")) return 1.1;
  if (normalized.includes("construct") || normalized.includes("pot") || normalized.includes("road")) return 1.0;
  return 0.9;
}

export function buildIncidentFeatureVector(incident: Incident): number[] {
  return [
    priorityScore(incident.priority),
    incident.closure ? 1 : 0,
    incident.corridor && incident.corridor !== "Non-corridor" ? 1 : 0,
    causeScore(incident.cause),
    0,
    0,
  ];
}

export function deriveTrainingTarget(incident: Incident, kind: TargetKind) {
  const priority = priorityScore(incident.priority);
  const closureFlag = incident.closure ? 1 : 0;
  const corridorFlag = incident.corridor && incident.corridor !== "Non-corridor" ? 1 : 0;
  const cause = causeScore(incident.cause);

  if (kind === "risk") {
    return clamp(Math.round(20 + priority * 16 + closureFlag * 10 + corridorFlag * 8 + cause * 7), 15, 98);
  }

  return clamp(Math.round(12 + priority * 10 + closureFlag * 8 + corridorFlag * 5 + cause * 6), 8, 140);
}

export function trainLinearRegressionModel(incidents: Incident[], kind: TargetKind) {
  const samples = incidents.map((incident) => ({
    features: buildIncidentFeatureVector(incident),
    target: deriveTrainingTarget(incident, kind),
  }));

  const weights = Array(samples[0]?.features.length ?? 6).fill(0);
  let bias = 0;
  const learningRate = 0.002;
  const epochs = 900;
  const sampleCount = Math.max(1, samples.length);

  for (let epoch = 0; epoch < epochs; epoch++) {
    let gradientBias = 0;
    const gradientWeights = Array(weights.length).fill(0);

    for (const sample of samples) {
      const prediction = bias + sample.features.reduce((sum, value, index) => sum + weights[index] * value, 0);
      const error = prediction - sample.target;
      gradientBias += error / sampleCount;
      sample.features.forEach((value, index) => {
        gradientWeights[index] += (error * value) / sampleCount;
      });
    }

    bias -= learningRate * gradientBias;
    weights.forEach((_, index) => {
      weights[index] -= learningRate * gradientWeights[index];
    });
  }

  return {
    weights,
    bias,
    featureNames: ["priority", "closure", "corridor", "cause", "crowd", "duration"],
  } satisfies RegressionModel;
}

export function dotProduct(weights: number[], features: number[]) {
  return features.reduce((sum, value, index) => sum + value * weights[index], 0);
}

export function predictWithModel(model: RegressionModel, features: number[]) {
  return model.bias + dotProduct(model.weights, features);
}

export function updateModelWithError(model: RegressionModel, features: number[], target: number, prediction: number, learningRate = 0.001) {
  const error = prediction - target;
  model.bias -= learningRate * error;
  features.forEach((value, index) => {
    model.weights[index] -= learningRate * error * value;
  });
  return model;
}

export function buildTrainingData() {
  return (raw as Incident[]).slice(0, Math.min(4000, (raw as Incident[]).length));
}
