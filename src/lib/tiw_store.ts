// In-memory T−IW store.
// Stores the active forecast monitor state per event, derived deterministically
// from forecast (EIS/MEI inputs) + live pulse corridor loads.

import type { Prediction } from "@/lib/intel";
import type { TiwState } from "@/lib/tw";
import { computeTiw } from "@/lib/tw";
import type { Pulse, Corridor } from "@/lib/pulse";
import { getEvents, predictImpact } from "@/lib/intel";


type Listener = () => void;


const listeners = new Set<Listener>();
let stateByEventId = new Map<string, TiwState>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeTiw(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getTiwForEvent(eventId: string): TiwState | undefined {
  return stateByEventId.get(eventId);
}

export function getAllTiw(): TiwState[] {
  return [...stateByEventId.values()];
}

// Called by UI on every pulse tick to refresh countdown + drift decision.
export function updateTiwFromPulse(pulse: Pulse) {
  const events = getEvents();
  const liveCandidates = events.filter((e) => e.status === "deployed" || e.status === "live");

  // For each active event, recompute T−IW state using the same deterministic
  // computeTiw function.
  const next = new Map<string, TiwState>();
  for (const ev of liveCandidates) {
    const prediction: Prediction = predictImpact({
      kind: ev.kind,
      lat: ev.lat,
      lng: ev.lng,
      crowd: ev.crowd,
      durationHours: ev.durationHours,
    });

    // Map tick to "elapsed monitoring minutes".
    // Pulse tick advances every 2.5s; we interpret as 1 minute per tick for a visible countdown.
    const elapsedMin = pulse.tick; // 1 tick => 1 minute (UI-friendly)

    const tw = computeTiw(ev, prediction, pulse.corridors as Corridor[], elapsedMin);
    next.set(ev.id, tw);
  }

  stateByEventId = next;
  emit();
}


