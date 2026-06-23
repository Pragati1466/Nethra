// NETHRA Closed Event Intelligence (CEI) store — in-memory, deterministic.
// Binds the final T−IW intervention outcome to a shared record visible in:
// 1) Dynamic Alerts (closure summary)
// 2) Learn Loop "Latest Learned Event" card
// 3) Decision Replay "Event closes" final outcome

import type { PlannedEvent } from "@/lib/intel";
import type { Prediction } from "@/lib/intel";

export type ClosedEventIntel = {
  eventId: string;
  forecastDelayMin: number;
  timeWindowRemainingMin: number;
  revisedAction: string;
  actualDelayMin: number;
  learnedUpdate: string;
};

type Listener = () => void;

const listeners = new Set<Listener>();
let latest: ClosedEventIntel | null = null;

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeClosedIntel(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}


export function getLatestClosedIntel(): ClosedEventIntel | null {
  return latest;
}

export function setLatestClosedIntel(record: ClosedEventIntel) {
  latest = record;
  emit();
}

export function deriveCeifromTiwClosure(params: {
  ev: PlannedEvent;
  prediction: Prediction;
  timeWindowRemainingMin: number;
  revisedActionTitle: string;
  // deterministic proxy for actual delay; UI story only
  actualDelayMin: number;
  learnedUpdate: string;
}): ClosedEventIntel {
  return {
    eventId: params.ev.id,
    forecastDelayMin: params.prediction.delayMinutes,
    timeWindowRemainingMin: params.timeWindowRemainingMin,
    revisedAction: params.revisedActionTitle,
    actualDelayMin: params.actualDelayMin,
    learnedUpdate: params.learnedUpdate,
  };
}

