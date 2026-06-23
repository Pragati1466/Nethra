// NETHRA Live Operations pulse — a single ticking store that mimics a live
// city. Subscribed components re-render every tick so the platform feels
// alive: feed items stream in, corridor congestion fluctuates, deployed
// units move along jittered paths, alerts cycle.
//
// Pure client-side; no network. Deterministic enough to look realistic,
// random enough to feel live. Single setInterval, shared across consumers.
import { useEffect, useState } from "react";
import { BENGALURU_CENTER, getEvents, type PlannedEvent } from "@/lib/intel";

export type FeedItem = {
  id: string;
  ts: number;
  kind: "dispatch" | "checkin" | "alert" | "sensor" | "intel" | "ai";
  text: string;
  tone: "info" | "success" | "warning" | "critical";
  source: string;
};

export type Corridor = {
  id: string;
  name: string;
  load: number;        // 0–100 congestion %
  delta: number;       // most recent change
  flow: number;        // vehicles/min (derived)
  status: "free" | "moderate" | "heavy" | "gridlock";
};

export type FieldUnit = {
  id: string;
  callsign: string;
  kind: "patrol" | "officer" | "wrecker" | "ambulance";
  lat: number;
  lng: number;
  heading: number;     // degrees
  status: "en-route" | "on-scene" | "patrolling" | "rtb";
  assignedTo?: string; // event id
  speedKph: number;
};

export type Alert = {
  id: string;
  text: string;
  tone: "info" | "warning" | "critical";
  ts: number;
  ttl: number;         // ticks remaining
};

export type Pulse = {
  tick: number;
  startedAt: number;
  feed: FeedItem[];
  corridors: Corridor[];
  units: FieldUnit[];
  alerts: Alert[];
  citywide: {
    avgLoad: number;
    activeUnits: number;
    openIncidents: number;
    advisoriesPerMin: number;
  };
};

const CORRIDORS_SEED: Omit<Corridor, "load" | "delta" | "flow" | "status">[] = [
  { id: "orr-e", name: "ORR · Marathahalli" },
  { id: "orr-s", name: "ORR · Silk Board" },
  { id: "hosur", name: "Hosur Rd · Electronic City" },
  { id: "tumkur", name: "Tumkur Rd · Yeshwanthpur" },
  { id: "old-madras", name: "Old Madras Rd · KR Puram" },
  { id: "bellary", name: "Bellary Rd · Hebbal" },
  { id: "mysore", name: "Mysore Rd · Nayandahalli" },
  { id: "mg", name: "MG Rd · Trinity" },
];

const CALLSIGNS = ["TP-12", "TP-44", "PCR-7", "PCR-19", "AMB-3", "WRK-2", "TP-08", "PCR-31"];
const INITIAL_TS = Date.UTC(2026, 0, 1, 8, 0, 0);

function rand(min: number, max: number) { return min + Math.random() * (max - min); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
function seededRand(next: () => number, min: number, max: number) { return min + next() * (max - min); }
function seededPick<T>(next: () => number, arr: T[]): T { return arr[Math.floor(next() * arr.length)]; }
function corridorStatus(load: number): Corridor["status"] {
  if (load >= 85) return "gridlock";
  if (load >= 65) return "heavy";
  if (load >= 40) return "moderate";
  return "free";
}

function seed(): Pulse {
  const next = seededRandom(7321);
  const corridors: Corridor[] = CORRIDORS_SEED.map((c) => {
    const load = Math.round(seededRand(next, 28, 78));
    return { ...c, load, delta: 0, flow: Math.round(120 - load * 0.7), status: corridorStatus(load) };
  });
  const [cLat, cLng] = BENGALURU_CENTER;
  const units: FieldUnit[] = CALLSIGNS.map((cs, i) => ({
    id: `U-${i}`,
    callsign: cs,
    kind: cs.startsWith("AMB") ? "ambulance" : cs.startsWith("WRK") ? "wrecker" : cs.startsWith("PCR") ? "patrol" : "officer",
    lat: cLat + seededRand(next, -0.05, 0.05),
    lng: cLng + seededRand(next, -0.06, 0.06),
    heading: seededRand(next, 0, 360),
    status: seededPick(next, ["patrolling", "patrolling", "en-route", "on-scene"]),
    speedKph: Math.round(seededRand(next, 18, 48)),
  }));
  return {
    tick: 0,
    startedAt: INITIAL_TS,
    feed: [],
    corridors,
    units,
    alerts: [],
    citywide: { avgLoad: 0, activeUnits: units.length, openIncidents: 0, advisoriesPerMin: 0 },
  };
}

let pulse: Pulse = seed();
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function step(): Pulse {
  const events = getEvents();
  const live = events.filter((e) => e.status === "live" || e.status === "deployed");
  const liveBoost = live.length * 6;

  // Corridors: random walk, biased up if live events nearby push load.
  const corridors: Corridor[] = pulse.corridors.map((c) => {
    const drift = rand(-7, 7) + (liveBoost > 0 ? rand(0, 4) : 0);
    const load = Math.max(8, Math.min(98, Math.round(c.load + drift)));
    const delta = load - c.load;
    return { ...c, load, delta, flow: Math.max(4, Math.round(140 - load * 0.85)), status: corridorStatus(load) };
  });

  // Units: jitter along heading, occasional status flip.
  const units: FieldUnit[] = pulse.units.map((u) => {
    const headingShift = (Math.random() - 0.5) * 25;
    const heading = (u.heading + headingShift + 360) % 360;
    // ~30 km/h * 2.5s = ~0.02 km per tick; 1 deg lat ≈ 111 km → ~0.0002 deg.
    const stepKm = (u.speedKph / 3600) * 2.5;
    const dLat = (stepKm / 110.9) * Math.cos((heading * Math.PI) / 180);
    const dLng = (stepKm / 108.3) * Math.sin((heading * Math.PI) / 180);
    let lat = u.lat + dLat;
    let lng = u.lng + dLng;
    // Keep within Bengaluru-ish bounds.
    lat = Math.max(12.85, Math.min(13.12, lat));
    lng = Math.max(77.48, Math.min(77.74, lng));
    const status: FieldUnit["status"] = Math.random() < 0.04
      ? pick(["patrolling", "en-route", "on-scene", "rtb"])
      : u.status;
    const assignedTo = status === "en-route" || status === "on-scene"
      ? (live[Math.floor(Math.random() * Math.max(1, live.length))]?.id ?? u.assignedTo)
      : undefined;
    return { ...u, lat, lng, heading, status, assignedTo };
  });

  // Alerts: spawn occasionally; age existing ones.
  const aged: Alert[] = pulse.alerts
    .map((a) => ({ ...a, ttl: a.ttl - 1 }))
    .filter((a) => a.ttl > 0);
  if (Math.random() < 0.35) {
    const c = pick(corridors);
    const candidates: Alert[] = [
      { id: `AL-${Date.now()}`, text: `${c.name} load surged to ${c.load}% — advise diversion`, tone: c.load > 80 ? "critical" : "warning", ts: Date.now(), ttl: 10 },
      { id: `AL-${Date.now()}`, text: `Sensor cluster ${pick(["S-12", "S-37", "S-44"])} reports stalled vehicle`, tone: "warning", ts: Date.now(), ttl: 10 },
      { id: `AL-${Date.now()}`, text: `${pick(units).callsign} reached scene · ETA cleared`, tone: "info", ts: Date.now(), ttl: 8 },
      { id: `AL-${Date.now()}`, text: `AI Strategist flagged early-exit risk at upcoming event`, tone: "info", ts: Date.now(), ttl: 12 },
    ];
    aged.unshift(pick(candidates));
  }

  // Feed items: 1–3 per tick, mix of sources.
  const newItems: FeedItem[] = [];
  const itemCount = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < itemCount; i++) {
    newItems.push(buildFeedItem(corridors, units, live));
  }

  const feed = [...newItems, ...pulse.feed].slice(0, 60);

  const avgLoad = Math.round(corridors.reduce((s, c) => s + c.load, 0) / corridors.length);
  const advisoriesPerMin = Math.round(24 + Math.sin(pulse.tick / 4) * 6 + avgLoad / 8);

  pulse = {
    tick: pulse.tick + 1,
    startedAt: pulse.startedAt,
    feed,
    corridors,
    units,
    alerts: aged.slice(0, 6),
    citywide: {
      avgLoad,
      activeUnits: units.filter((u) => u.status !== "rtb").length,
      openIncidents: aged.filter((a) => a.tone !== "info").length + live.length,
      advisoriesPerMin,
    },
  };
  return pulse;
}

function buildFeedItem(corridors: Corridor[], units: FieldUnit[], live: PlannedEvent[]): FeedItem {
  const id = `F-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const ts = Date.now();
  const roll = Math.random();
  if (roll < 0.25) {
    const u = pick(units);
    return {
      id, ts, kind: "checkin", tone: "info", source: u.callsign,
      text: `${u.callsign} ${u.status === "on-scene" ? "on scene" : u.status === "rtb" ? "returning to base" : "in motion"} · ${u.speedKph} km/h`,
    };
  }
  if (roll < 0.5) {
    const c = pick(corridors);
    const dir = c.delta >= 0 ? "↑" : "↓";
    const tone: FeedItem["tone"] = c.load >= 80 ? "critical" : c.load >= 60 ? "warning" : "info";
    return { id, ts, kind: "sensor", tone, source: "Sensor", text: `${c.name} ${dir} ${Math.abs(c.delta)}% (now ${c.load}%, ${c.flow} veh/min)` };
  }
  if (roll < 0.7) {
    const u = pick(units);
    const tgt = live[0];
    return {
      id, ts, kind: "dispatch", tone: "warning", source: "Dispatch",
      text: tgt
        ? `${u.callsign} dispatched to ${tgt.name} · ETA ${Math.round(rand(3, 14))} min`
        : `${u.callsign} repositioning to ${pick(corridors).name}`,
    };
  }
  if (roll < 0.85) {
    return {
      id, ts, kind: "intel", tone: "info", source: "Intel",
      text: `Pattern match: ${pick(["festival surge", "school dispersal", "weather-linked slowdown", "match-day inflow"])} on ${pick(corridors).name}`,
    };
  }
  return {
    id, ts, kind: "ai", tone: "info", source: "AI",
    text: `Strategist suggests ${pick(["pre-positioning 2 units", "early diversion activation", "barricade pre-stage", "PA advisory broadcast"])} for next hot zone`,
  };
}

function emit() { listeners.forEach((fn) => fn()); }

function ensureRunning() {
  if (intervalId || typeof window === "undefined") return;
  intervalId = setInterval(() => { step(); emit(); }, 2500);
}

export function usePulse(): Pulse {
  const [snap, setSnap] = useState<Pulse>(pulse);
  useEffect(() => {
    ensureRunning();
    const fn = () => setSnap({ ...pulse });
    listeners.add(fn);
    // Trigger an immediate tick so first paint isn't all zeros.
    if (pulse.tick === 0) { step(); setSnap({ ...pulse }); }
    return () => { listeners.delete(fn); };
  }, []);
  return snap;
}

export function pulseSnapshot(): Pulse { return pulse; }
