import { buildTrainingData, trainLinearRegressionModel, type RegressionModel, type TargetKind } from "@/ml/train_model";

let cachedModel: RegressionModel | null = null;
let cachedDelayModel: RegressionModel | null = null;

function ensureModel(kind: TargetKind): RegressionModel {
  if (kind === "risk") {
    if (!cachedModel) {
      const incidents = buildTrainingData();
      cachedModel = trainLinearRegressionModel(incidents, "risk");
    }
    return cachedModel;
  }

  if (!cachedDelayModel) {
    const incidents = buildTrainingData();
    cachedDelayModel = trainLinearRegressionModel(incidents, "delay");
  }
  return cachedDelayModel;
}

export function getRiskModel() {
  return ensureModel("risk");
}

export function getDelayModel() {
  return ensureModel("delay");
}

export function warmupModels() {
  getRiskModel();
  getDelayModel();
}
