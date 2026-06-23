import { o as __toESM } from "../_runtime.mjs";
import { _ as riskBand, g as predictImpact, r as INCIDENTS, t as BENGALURU_CENTER, u as getEvents, y as subscribe } from "./intel-BKuSbRxh.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as Plus, P as MapPin, T as Radio, c as TrendingUp, ct as ArrowRight, ft as Activity, i as Users, it as Bot, m as Siren, ot as ArrowUp, r as Wifi, s as TriangleAlert, ut as ArrowDown } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as CityMap } from "./CityMap-DcVaDjIA.mjs";
import { t as MetricStat } from "./RiskGauge-CqxM5Prs.mjs";
import { i as updateTiwFromPulse, r as subscribeTiw, t as getAllTiw } from "./tiw_store-CTlgkrTD.mjs";
import { t as ShareButton } from "./share-button-DU_VuhYu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BKdRudlS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CORRIDORS_SEED = [
	{
		id: "orr-e",
		name: "ORR · Marathahalli"
	},
	{
		id: "orr-s",
		name: "ORR · Silk Board"
	},
	{
		id: "hosur",
		name: "Hosur Rd · Electronic City"
	},
	{
		id: "tumkur",
		name: "Tumkur Rd · Yeshwanthpur"
	},
	{
		id: "old-madras",
		name: "Old Madras Rd · KR Puram"
	},
	{
		id: "bellary",
		name: "Bellary Rd · Hebbal"
	},
	{
		id: "mysore",
		name: "Mysore Rd · Nayandahalli"
	},
	{
		id: "mg",
		name: "MG Rd · Trinity"
	}
];
var CALLSIGNS = [
	"TP-12",
	"TP-44",
	"PCR-7",
	"PCR-19",
	"AMB-3",
	"WRK-2",
	"TP-08",
	"PCR-31"
];
var INITIAL_TS = Date.UTC(2026, 0, 1, 8, 0, 0);
function rand(min, max) {
	return min + Math.random() * (max - min);
}
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function seededRandom(seed) {
	let state = seed >>> 0;
	return () => {
		state = state * 1664525 + 1013904223 >>> 0;
		return state / 4294967296;
	};
}
function seededRand(next, min, max) {
	return min + next() * (max - min);
}
function seededPick(next, arr) {
	return arr[Math.floor(next() * arr.length)];
}
function corridorStatus(load) {
	if (load >= 85) return "gridlock";
	if (load >= 65) return "heavy";
	if (load >= 40) return "moderate";
	return "free";
}
function seed() {
	const next = seededRandom(7321);
	const corridors = CORRIDORS_SEED.map((c) => {
		const load = Math.round(seededRand(next, 28, 78));
		return {
			...c,
			load,
			delta: 0,
			flow: Math.round(120 - load * .7),
			status: corridorStatus(load)
		};
	});
	const [cLat, cLng] = BENGALURU_CENTER;
	const units = CALLSIGNS.map((cs, i) => ({
		id: `U-${i}`,
		callsign: cs,
		kind: cs.startsWith("AMB") ? "ambulance" : cs.startsWith("WRK") ? "wrecker" : cs.startsWith("PCR") ? "patrol" : "officer",
		lat: cLat + seededRand(next, -.05, .05),
		lng: cLng + seededRand(next, -.06, .06),
		heading: seededRand(next, 0, 360),
		status: seededPick(next, [
			"patrolling",
			"patrolling",
			"en-route",
			"on-scene"
		]),
		speedKph: Math.round(seededRand(next, 18, 48))
	}));
	return {
		tick: 0,
		startedAt: INITIAL_TS,
		feed: [],
		corridors,
		units,
		alerts: [],
		citywide: {
			avgLoad: 0,
			activeUnits: units.length,
			openIncidents: 0,
			advisoriesPerMin: 0
		}
	};
}
var pulse = seed();
var listeners = /* @__PURE__ */ new Set();
var intervalId = null;
function step() {
	const live = getEvents().filter((e) => e.status === "live" || e.status === "deployed");
	const liveBoost = live.length * 6;
	const corridors = pulse.corridors.map((c) => {
		const drift = rand(-7, 7) + (liveBoost > 0 ? rand(0, 4) : 0);
		const load = Math.max(8, Math.min(98, Math.round(c.load + drift)));
		const delta = load - c.load;
		return {
			...c,
			load,
			delta,
			flow: Math.max(4, Math.round(140 - load * .85)),
			status: corridorStatus(load)
		};
	});
	const units = pulse.units.map((u) => {
		const headingShift = (Math.random() - .5) * 25;
		const heading = (u.heading + headingShift + 360) % 360;
		const stepKm = u.speedKph / 3600 * 2.5;
		const dLat = stepKm / 110.9 * Math.cos(heading * Math.PI / 180);
		const dLng = stepKm / 108.3 * Math.sin(heading * Math.PI / 180);
		let lat = u.lat + dLat;
		let lng = u.lng + dLng;
		lat = Math.max(12.85, Math.min(13.12, lat));
		lng = Math.max(77.48, Math.min(77.74, lng));
		const status = Math.random() < .04 ? pick([
			"patrolling",
			"en-route",
			"on-scene",
			"rtb"
		]) : u.status;
		const assignedTo = status === "en-route" || status === "on-scene" ? live[Math.floor(Math.random() * Math.max(1, live.length))]?.id ?? u.assignedTo : void 0;
		return {
			...u,
			lat,
			lng,
			heading,
			status,
			assignedTo
		};
	});
	const aged = pulse.alerts.map((a) => ({
		...a,
		ttl: a.ttl - 1
	})).filter((a) => a.ttl > 0);
	if (Math.random() < .35) {
		const c = pick(corridors);
		const candidates = [
			{
				id: `AL-${Date.now()}`,
				text: `${c.name} load surged to ${c.load}% — advise diversion`,
				tone: c.load > 80 ? "critical" : "warning",
				ts: Date.now(),
				ttl: 10
			},
			{
				id: `AL-${Date.now()}`,
				text: `Sensor cluster ${pick([
					"S-12",
					"S-37",
					"S-44"
				])} reports stalled vehicle`,
				tone: "warning",
				ts: Date.now(),
				ttl: 10
			},
			{
				id: `AL-${Date.now()}`,
				text: `${pick(units).callsign} reached scene · ETA cleared`,
				tone: "info",
				ts: Date.now(),
				ttl: 8
			},
			{
				id: `AL-${Date.now()}`,
				text: `AI Strategist flagged early-exit risk at upcoming event`,
				tone: "info",
				ts: Date.now(),
				ttl: 12
			}
		];
		aged.unshift(pick(candidates));
	}
	const newItems = [];
	const itemCount = 1 + Math.floor(Math.random() * 2);
	for (let i = 0; i < itemCount; i++) newItems.push(buildFeedItem(corridors, units, live));
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
			advisoriesPerMin
		}
	};
	return pulse;
}
function buildFeedItem(corridors, units, live) {
	const id = `F-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
	const ts = Date.now();
	const roll = Math.random();
	if (roll < .25) {
		const u = pick(units);
		return {
			id,
			ts,
			kind: "checkin",
			tone: "info",
			source: u.callsign,
			text: `${u.callsign} ${u.status === "on-scene" ? "on scene" : u.status === "rtb" ? "returning to base" : "in motion"} · ${u.speedKph} km/h`
		};
	}
	if (roll < .5) {
		const c = pick(corridors);
		const dir = c.delta >= 0 ? "↑" : "↓";
		return {
			id,
			ts,
			kind: "sensor",
			tone: c.load >= 80 ? "critical" : c.load >= 60 ? "warning" : "info",
			source: "Sensor",
			text: `${c.name} ${dir} ${Math.abs(c.delta)}% (now ${c.load}%, ${c.flow} veh/min)`
		};
	}
	if (roll < .7) {
		const u = pick(units);
		const tgt = live[0];
		return {
			id,
			ts,
			kind: "dispatch",
			tone: "warning",
			source: "Dispatch",
			text: tgt ? `${u.callsign} dispatched to ${tgt.name} · ETA ${Math.round(rand(3, 14))} min` : `${u.callsign} repositioning to ${pick(corridors).name}`
		};
	}
	if (roll < .85) return {
		id,
		ts,
		kind: "intel",
		tone: "info",
		source: "Intel",
		text: `Pattern match: ${pick([
			"festival surge",
			"school dispersal",
			"weather-linked slowdown",
			"match-day inflow"
		])} on ${pick(corridors).name}`
	};
	return {
		id,
		ts,
		kind: "ai",
		tone: "info",
		source: "AI",
		text: `Strategist suggests ${pick([
			"pre-positioning 2 units",
			"early diversion activation",
			"barricade pre-stage",
			"PA advisory broadcast"
		])} for next hot zone`
	};
}
function emit() {
	listeners.forEach((fn) => fn());
}
function ensureRunning() {
	if (intervalId || typeof window === "undefined") return;
	intervalId = setInterval(() => {
		step();
		emit();
	}, 2500);
}
function usePulse() {
	const [snap, setSnap] = (0, import_react.useState)(pulse);
	(0, import_react.useEffect)(() => {
		ensureRunning();
		const fn = () => setSnap({ ...pulse });
		listeners.add(fn);
		if (pulse.tick === 0) {
			step();
			setSnap({ ...pulse });
		}
		return () => {
			listeners.delete(fn);
		};
	}, []);
	return snap;
}
var kindIcon = {
	dispatch: Radio,
	checkin: MapPin,
	alert: Siren,
	sensor: Activity,
	intel: TrendingUp,
	ai: Bot
};
function LiveFeed({ className }) {
	const { feed, citywide } = usePulse();
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (ref.current) ref.current.scrollTop = 0;
	}, [feed[0]?.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Live Ops Feed",
		subtitle: `${citywide.advisoriesPerMin}/min advisories · ${citywide.activeUnits} units active`,
		className,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			tone: "success",
			className: "gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success pulse-dot" }), " LIVE"]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref,
			className: "max-h-[420px] overflow-auto divide-y divide-border",
			children: [feed.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4 text-sm text-muted-foreground",
				children: "Listening to city sensors…"
			}), feed.map((f, i) => {
				const Icon = kindIcon[f.kind];
				const color = f.tone === "critical" ? "text-critical" : f.tone === "warning" ? "text-warning" : f.tone === "success" ? "text-success" : "text-info";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex items-start gap-3 px-3 py-2 text-[13px] ${i === 0 ? "animate-fade-in bg-primary/5" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3.5 mt-0.5 shrink-0 ${color}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "leading-snug text-foreground/90",
							children: f.text
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] font-mono text-muted-foreground mt-0.5",
							children: [
								f.source,
								" · ",
								timeAgo(f.ts)
							]
						})]
					})]
				}, f.id);
			})]
		})
	});
}
function TrafficPulse({ className }) {
	const { corridors, citywide } = usePulse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Traffic Pulse",
		subtitle: `Citywide load ${citywide.avgLoad}%`,
		className,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-3.5 text-success" }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border",
			children: corridors.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CorridorRow, { c }, c.id))
		})
	});
}
function CorridorRow({ c }) {
	const color = c.status === "gridlock" ? "var(--critical)" : c.status === "heavy" ? "var(--warning)" : c.status === "moderate" ? "var(--info)" : "var(--success)";
	const Trend = c.delta >= 0 ? ArrowUp : ArrowDown;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-[13px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate font-medium",
					children: c.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs inline-flex items-center gap-1",
					style: { color },
					children: [
						c.load,
						"%",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trend, {
							className: "size-3",
							style: { color: c.delta >= 0 ? "var(--warning)" : "var(--success)" }
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1.5 rounded-full bg-muted overflow-hidden mt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full transition-all duration-700 ease-out",
					style: {
						width: `${c.load}%`,
						background: color
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[10px] font-mono text-muted-foreground mt-0.5 capitalize",
				children: [
					c.status,
					" · ",
					c.flow,
					" veh/min · Δ ",
					c.delta >= 0 ? "+" : "",
					c.delta,
					"%"
				]
			})
		]
	});
}
function ActiveDeployments({ className }) {
	const { units } = usePulse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Active Deployments",
		subtitle: `${units.length} units in field`,
		className,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: "info",
			children: "live GPS"
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[300px] overflow-auto divide-y divide-border",
			children: units.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitRow, { u }, u.id))
		})
	});
}
function UnitRow({ u }) {
	const tone = u.status === "on-scene" ? "success" : u.status === "en-route" ? "warning" : u.status === "rtb" ? "muted" : "info";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 py-2 flex items-center gap-3 text-[13px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "size-2 rounded-full pulse-dot",
			style: { background: tone === "success" ? "var(--success)" : tone === "warning" ? "var(--warning)" : tone === "muted" ? "var(--muted-foreground)" : "var(--info)" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono font-medium",
					children: u.callsign
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone,
					children: u.status
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[10px] font-mono text-muted-foreground mt-0.5",
				children: [
					u.kind,
					" · ",
					u.speedKph,
					" km/h · ",
					u.lat.toFixed(4),
					", ",
					u.lng.toFixed(4)
				]
			})]
		})]
	});
}
function DynamicAlerts({ className }) {
	const { alerts } = usePulse();
	const { tiwAlerts } = useTiwAlerts();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Dynamic Alerts",
		subtitle: alerts.length || tiwAlerts.length ? `${alerts.length + tiwAlerts.length} active` : "All clear",
		className,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Siren, { className: `size-3.5 ${alerts.some((a) => a.tone === "critical") || tiwAlerts.some((a) => a.tone === "critical") ? "text-critical" : "text-muted-foreground"}` }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "divide-y divide-border",
			children: [
				!alerts.length && !tiwAlerts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 text-sm text-muted-foreground",
					children: "No active alerts."
				}),
				tiwAlerts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TiwSingleAlert, { a: tiwAlerts[0] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-3 py-2.5 text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Siren, { className: "size-3.5 shrink-0 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: "🚨 T−IW MONITOR"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-foreground mt-0.5",
							children: "Armed · forecast deviation pending"
						})]
					})]
				}),
				alerts.map((a, i) => {
					const color = a.tone === "critical" ? "text-critical" : a.tone === "warning" ? "text-warning" : "text-info";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-center gap-3 px-3 py-2.5 text-[13px] ${i === 0 && !tiwAlerts.length ? "animate-fade-in" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Siren, { className: `size-3.5 shrink-0 ${color}` }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1",
								children: a.text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-mono text-muted-foreground",
								children: timeAgo(a.ts)
							})
						]
					}, a.id);
				})
			]
		})
	});
}
function useTiwAlerts() {
	const pulse = usePulse();
	const [tiwAlerts, setTiwAlerts] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		updateTiwFromPulse(pulse);
		setTiwAlerts(twsToAlerts(getAllTiw()));
		const unsub = subscribeTiw(() => {
			setTiwAlerts(twsToAlerts(getAllTiw()));
		});
		return () => {
			unsub();
		};
	}, [pulse.tick]);
	return { tiwAlerts };
}
function twsToAlerts(tws) {
	const now = Date.now();
	return tws.filter((t) => t.driftTriggered && t.drift && t.revisedAction).slice(0, 2).map((t) => {
		const tone = t.drift.severity === "critical" ? "critical" : "warning";
		return {
			id: t.revisedAction.id,
			text: `🚨 NETHRA T−IW ALERT | FORECAST DEVIATION DETECTED`,
			sub: `📍 ${t.drift.corridorName} · T−IW: ${t.remainingMin} min — ${t.revisedAction.title}`,
			tone,
			ts: now
		};
	});
}
function TiwSingleAlert({ a }) {
	const sub = a.sub ?? "";
	const corridorLine = sub.split("·")[0]?.replace(/^[^:]*:\s*/g, "") ?? "";
	const remainingMatch = sub.match(/T−IW:\s*(\d+)\s*min/);
	const remainingMin = remainingMatch ? remainingMatch[1] : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3 px-3 py-2.5 text-[13px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Siren, { className: "size-3.5 shrink-0 text-critical" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: "🚨 T−IW ALERT"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex items-center justify-center size-4 rounded-full border border-border bg-card/50 text-[10px] text-muted-foreground",
							title: "T−IW = minutes remaining before the current intervention plan becomes insufficient due to forecast deviation.",
							children: "i"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-muted-foreground mt-0.5",
						children: [
							corridorLine.trim() || "Bellary Rd",
							" · ",
							remainingMin,
							" min remaining"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-muted-foreground mt-0.5",
						children: "Forecast deviation detected."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-primary mt-0.5",
						children: "View revised plan →"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] font-mono text-muted-foreground",
				children: timeAgo(a.ts)
			})
		]
	});
}
function timeAgo(ts) {
	const s = Math.max(0, Math.round((Date.now() - ts) / 1e3));
	if (s < 5) return "now";
	if (s < 60) return `${s}s ago`;
	return `${Math.round(s / 60)}m ago`;
}
function useEvents() {
	const [events, setEvents] = (0, import_react.useState)(getEvents());
	(0, import_react.useEffect)(() => subscribe(() => setEvents([...getEvents()])), []);
	return events;
}
function unplannedMetricFor(e) {
	switch (e.kind) {
		case "festival": return e.crowd.toLocaleString();
		case "accident": return `${Math.max(1, Math.round((e.crowd || 1) / 1e3))} vehicles involved`;
		case "construction": return `${Math.max(.5, e.durationHours / 12).toFixed(1)} km work zone`;
		case "waterlogging": return `${Math.max(1, Math.round((e.durationHours || 1) / 2))} lanes submerged`;
		case "tree_fall": return `${Math.max(1, Math.round((e.durationHours || 1) / 2))} lanes blocked`;
		default: return `${e.kind} impact`;
	}
}
function CommandCenter() {
	const events = useEvents();
	const pulse = usePulse();
	const live = events.filter((e) => e.status === "live");
	const planned = events.filter((e) => e.status === "planned" || e.status === "draft");
	const totalCrowd = events.reduce((s, e) => s + e.crowd, 0);
	const mapUnits = pulse.units.map((u) => ({
		id: u.id,
		lat: u.lat,
		lng: u.lng,
		callsign: u.callsign,
		status: u.status,
		tone: u.status === "on-scene" ? "success" : u.status === "en-route" ? "warning" : u.status === "rtb" ? "muted" : "info"
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4 min-h-[calc(100vh-3rem)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-mono uppercase tracking-[0.2em] text-primary",
						children: "Command Center"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold mt-1",
						children: "Bengaluru · Live Operations"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: "All upcoming and live events, ranked by operational risk. Click an event to plan, deploy, or monitor it."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareButton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/events/new",
						className: "inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Create Event"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Live events",
						value: live.length,
						sub: "active in field",
						tone: "critical"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Citywide load",
						value: `${pulse.citywide.avgLoad}%`,
						sub: `${pulse.citywide.advisoriesPerMin} advisories/min`,
						tone: pulse.citywide.avgLoad > 70 ? "critical" : pulse.citywide.avgLoad > 50 ? "warning" : "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Units in field",
						value: pulse.citywide.activeUnits,
						sub: `${planned.length} planned · ${totalCrowd.toLocaleString()} pax`,
						tone: "info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Open incidents",
						value: pulse.citywide.openIncidents,
						sub: `${INCIDENTS.length.toLocaleString()} historical`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Digital Twin",
				subtitle: `Live · tick ${pulse.tick} · ${pulse.units.length} units tracked`,
				className: "col-span-12 lg:col-span-8 h-[560px] flex flex-col",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "success",
					className: "gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success pulse-dot" }), " LIVE"]
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityMap, {
						events,
						units: mapUnits
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Operations Queue",
				subtitle: `Risk-ranked · ${events.length} events`,
				className: "col-span-12 lg:col-span-4 h-[560px] flex flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 overflow-auto divide-y divide-border",
					children: events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-center h-full text-sm text-muted-foreground",
						children: "All quiet ✨"
					}) : events.map((e) => {
						return {
							e,
							p: predictImpact({
								kind: e.kind,
								lat: e.lat,
								lng: e.lng,
								crowd: e.crowd,
								durationHours: e.durationHours
							})
						};
					}).sort((a, b) => b.p.riskScore - a.p.riskScore).map(({ e, p }) => {
						const band = riskBand(p.riskScore);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/events/$eventId",
							params: { eventId: e.id },
							className: "block px-4 py-3 hover:bg-accent/40 transition group",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 size-2.5 rounded-full",
										style: {
											background: band.color,
											boxShadow: `0 0 0 4px ${band.color}22`
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium text-sm truncate",
													children: e.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-xs",
													style: { color: band.color },
													children: p.riskScore
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground truncate",
												children: e.address
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1.5 flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													tone: e.status === "live" ? "critical" : e.status === "planned" ? "warning" : "muted",
													children: e.status
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[11px] font-mono text-muted-foreground whitespace-nowrap",
													children: [e.status === "planned" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "inline size-3 mr-0.5" }), e.crowd.toLocaleString()] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: unplannedMetricFor(e) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "inline",
														children: [
															"· ",
															p.delayMinutes,
															"min delay"
														]
													})]
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" })
								]
							})
						}, e.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveFeed, { className: "col-span-12 lg:col-span-5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrafficPulse, { className: "col-span-12 lg:col-span-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 lg:col-span-3 flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DynamicAlerts, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveDeployments, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Quick Actions",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
									to: "/events/new",
									label: "New Event",
									icon: Plus
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
									to: "/twin",
									label: "Open Twin",
									icon: Radio
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
									to: "/strategist",
									label: "Ask AI",
									icon: Bot
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickLink, {
									to: "/demo",
									label: "Demo Mode",
									icon: TriangleAlert
								})
							]
						})
					})
				]
			})
		]
	}) });
}
function QuickLink({ to, label, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "flex flex-col items-start gap-2 rounded-md border border-border bg-card/40 p-3 hover:border-primary/40 hover:bg-accent/40 transition",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm",
			children: label
		})]
	});
}
//#endregion
export { CommandCenter as component };
