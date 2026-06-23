// T−IW (Intervention Window) deterministic drift logic.
// This file implements the narrative novelty: EIS → plan sufficiency
// window (T−IW) → drift trigger → revised minimum correction.
//
// NOTE: This is intentionally deterministic from the existing forecast
// inputs + live corridor pulse signals (no model re-training).

import type { PlannedEvent } from "@/lib/intel";
import type { Prediction } from "@/lib/intel";
import type { Corridor } from "@/lib/pulse";

export type DriftSignal = {
  corridorId: string;
  corridorName: string;
  forecastPeakLoad: number; // derived from EIS/delay
  actualLoad: number;        // from pulse corridor
  driftMinutesEarly: number; // how early compared to plan sufficiency
  severity: "warning" | "critical";
};

export type TiwState = {
  eventId: string;
  // Total window for which the initially planned deployment is sufficient.
  timeWindowMin: number;
  // Remaining minutes at the current tick (client computed).
  remainingMin: number;
  // Whether drift trigger fired.
  driftTriggered: boolean;
  // Latest drift signal (if any).
  drift?: DriftSignal;
  // Recommended correction action.
  revisedAction?: {
    id: string;
    title: string;
    reviseAfterMin: number;
    steps: string[];
  };
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function forecastPeakLoadFromEis(p: Prediction) {
  // Convert riskScore + delay into a load threshold.
  // Keeps it narrative-consistent: higher risk => higher expected corridor load.
  // Range tuned to pulse corridor loads (8..98).
  const base = 35 + (p.riskScore * 0.45);
  const delayBump = clamp(p.delayMinutes, 0, 120) * 0.15;
  return clamp(Math.round(base + delayBump), 30, 95);
}

function timeWindowFromEis(p: Prediction) {
  // T−IW: the window where deployed plan remains sufficient.
  // Higher confidence => larger window; higher delay/risk => smaller window.
  const confFactor = 0.85 + (p.confidence / 100) * 0.6; // ~1.0..1.45
  const riskFactor = 1.0 + (p.riskScore / 100) * 0.6; // ~1.0..1.6
  const delayFactor = 1.0 + clamp(p.delayMinutes, 0, 180) / 240; // ~1.0..1.75
  const raw = 40 * (confFactor / (riskFactor * delayFactor));
  // Clamp so UI always looks reasonable.
  return clamp(Math.round(raw), 8, 45);
}

function driftSeverity(actual: number, forecastPeak: number): DriftSignal["severity"] {
  const ratio = actual / Math.max(1, forecastPeak);
  if (ratio >= 1.18) return "critical";
  if (ratio >= 1.08) return "warning";
  return "warning";
}

export function computeTiw(
  ev: PlannedEvent,
  p: Prediction,
  corridors: Corridor[],
  // elapsed minutes since "monitoring begins"; caller controls mapping.
  elapsedMin: number,
): TiwState {
  const timeWindowMin = timeWindowFromEis(p);
  const remainingMin = clamp(timeWindowMin - elapsedMin, 0, timeWindowMin);

  // Drift trigger: if any corridor in the impact region is already above
  // forecast peak load during remaining window.
  const forecastPeakLoad = forecastPeakLoadFromEis(p);

  // Map impact radius to a corridor selection proxy by load delta.
  // Since pulse corridors are synthetic, pick the worst offender.
  const worst = corridors
    .slice()
    .sort((a, b) => b.load - a.load)
    .find(Boolean);

  if (!worst) {
    return {
      eventId: ev.id,
      timeWindowMin,
      remainingMin,
      driftTriggered: false,
    };
  }

  const actualLoad = worst.load;

  // Decide early drift based on how much threshold is exceeded.
  const exceed = actualLoad - forecastPeakLoad;
  const exceedRatio = exceed / Math.max(1, forecastPeakLoad);

  // driftMinutesEarly: how far inside the window drift appears.
  // Higher exceed ratio => more minutes early.
  const driftMinutesEarly = clamp(Math.round(exceedRatio * 35), 0, timeWindowMin);

  const driftTriggered = remainingMin === 0
    ? false
    : actualLoad >= forecastPeakLoad && driftMinutesEarly >= Math.round(timeWindowMin * 0.25);

  if (!driftTriggered) {
    return {
      eventId: ev.id,
      timeWindowMin,
      remainingMin,
      driftTriggered: false,
    };
  }

  const severity = driftSeverity(actualLoad, forecastPeakLoad);

  const drift: DriftSignal = {
    corridorId: worst.id,
    corridorName: worst.name,
    forecastPeakLoad,
    actualLoad,
    driftMinutesEarly,
    severity,
  };

  const revisedAction = suggestRevisedAction(ev, p, drift, remainingMin);

  return {
    eventId: ev.id,
    timeWindowMin,
    remainingMin,
    driftTriggered: true,
    drift,
    revisedAction,
  };
}

function suggestRevisedAction(
  ev: PlannedEvent,
  p: Prediction,
  drift: DriftSignal,
  remainingMin: number,
): TiwState["revisedAction"] {
  const id = `TW-${ev.id}-${drift.corridorId}`;
  const reviseAfterMin = Math.max(2, Math.round(remainingMin * 0.45));

  const baseSteps = [
    `Pull forward diversion activation by ~${Math.max(10, Math.round(p.delayMinutes * 0.15))} minutes for the impacted corridors.`,
    `Add ${Math.max(2, Math.round(p.recommendedOfficers * 0.15))} traffic officers as floating reserve at lead junctions (${p.affectedJunctions.slice(0, 2).join(", ") || "primary junctions"}).`,
    `Pre-stage ${Math.max(1, Math.round(p.recommendedBarricades * 0.12))} barricades at chokepoints aligned to the diversion plan.`,
  ];

  const severityStep = drift.severity === "critical"
    ? [`Escalate to command center immediately; reserve an emergency access lane through the high-load corridor (${drift.corridorName}).`]
    : [`Notify command center; tighten monitoring cadence on ${drift.corridorName}.`];

  return {
    id,
    title: `FORECAST DEVIATION DETECTED @ ${drift.corridorName}`,
    reviseAfterMin,
    steps: [...baseSteps, ...severityStep],
  };
}

