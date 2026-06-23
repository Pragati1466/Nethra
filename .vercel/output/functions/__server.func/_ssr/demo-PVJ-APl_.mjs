import { o as __toESM } from "../_runtime.mjs";
import { _ as riskBand, g as predictImpact, i as addEvent, s as diversionRoutesFor } from "./intel-BKuSbRxh.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Pause, C as RotateCcw, E as Radar, J as Database, S as Route, T as Radio, Z as ClipboardCheck, f as Sparkles, ft as Activity, g as Shield, i as Users, k as Play, n as X, p as SkipForward, s as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as CityMap } from "./CityMap-DcVaDjIA.mjs";
import { n as RiskGauge } from "./RiskGauge-CqxM5Prs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo-PVJ-APl_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEMO_EVENT = {
	name: "RCB vs CSK · IPL Final",
	kind: "cricket",
	lat: 12.9788,
	lng: 77.5996,
	address: "M. Chinnaswamy Stadium, Cubbon Road, Bengaluru",
	crowd: 42e3,
	durationHours: 6,
	startsAt: new Date(Date.now() + 3 * 36e5).toISOString()
};
var ACTS = [
	{
		id: "title",
		label: "Auto-Pilot",
		duration: 4,
		Icon: Sparkles,
		caption: "NETHRA AUTO-PILOT",
		sub: "Watch a smart city operating system run a 6-hour event in 90 seconds."
	},
	{
		id: "intel",
		label: "Event Ingested",
		duration: 9,
		Icon: Database,
		caption: "T-3h · Event detected from BBMP calendar",
		sub: "RCB vs CSK — IPL Final · M. Chinnaswamy Stadium · 42,000 expected."
	},
	{
		id: "predict",
		label: "Risk Predicted",
		duration: 10,
		Icon: Radar,
		caption: "Risk model running on 8,173 historical incidents",
		sub: "Cross-referencing 14 nearest precedents with day-of-week × weather × crowd priors."
	},
	{
		id: "simulate",
		label: "Congestion Sim",
		duration: 9,
		Icon: Activity,
		caption: "Propagating congestion across the road graph",
		sub: "Simulating spillback into MG Road, Cubbon Park, and ORR East."
	},
	{
		id: "impact",
		label: "Impact Zones",
		duration: 9,
		Icon: TriangleAlert,
		caption: "Impact footprint locked",
		sub: "11 junctions · 4 corridors · 38k people-hours at risk inside the radius."
	},
	{
		id: "divert",
		label: "Diversions",
		duration: 11,
		Icon: Route,
		caption: "Generating 3 corridor-level diversions",
		sub: "North bypass · South arterial · East ring loop — ranked by capacity & ETA."
	},
	{
		id: "deploy",
		label: "Resources",
		duration: 11,
		Icon: Shield,
		caption: "Allocating officers, barricades & patrols",
		sub: "Roll-up dispatched to MG Road, Cubbon Park and Trinity gates."
	},
	{
		id: "command",
		label: "Command Center",
		duration: 11,
		Icon: Radio,
		caption: "Command Center activated · Live monitoring",
		sub: "All units online. Heartbeat 2s. Strategist on standby."
	},
	{
		id: "report",
		label: "After-Action",
		duration: 16,
		Icon: ClipboardCheck,
		caption: "Event closed · After-action report compiled",
		sub: "Outcome reconciled against prediction. Model v1.3 → v1.4 queued."
	}
];
var TOTAL = ACTS.reduce((s, a) => s + a.duration, 0);
function DemoPage() {
	const navigate = useNavigate();
	const [started, setStarted] = (0, import_react.useState)(false);
	const [t, setT] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const rafRef = (0, import_react.useRef)(null);
	const lastRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!playing) return;
		lastRef.current = performance.now();
		const tick = (now) => {
			const dt = (now - lastRef.current) / 1e3;
			lastRef.current = now;
			setT((prev) => {
				const next = prev + dt;
				if (next >= TOTAL) {
					setPlaying(false);
					return TOTAL;
				}
				return next;
			});
			rafRef.current = requestAnimationFrame(tick);
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [playing]);
	const { actIdx, actProgress } = (0, import_react.useMemo)(() => {
		let acc = 0;
		for (let i = 0; i < ACTS.length; i++) {
			const end = acc + ACTS[i].duration;
			if (t < end || i === ACTS.length - 1) return {
				actIdx: i,
				actProgress: Math.min(1, (t - acc) / ACTS[i].duration)
			};
			acc = end;
		}
		return {
			actIdx: ACTS.length - 1,
			actProgress: 1
		};
	}, [t]);
	const prediction = (0, import_react.useMemo)(() => predictImpact(DEMO_EVENT), []);
	const diversions = (0, import_react.useMemo)(() => diversionRoutesFor({
		...DEMO_EVENT,
		id: "DEMO",
		status: "planned",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}, prediction), [prediction]);
	function start() {
		setStarted(true);
		setT(0);
		setPlaying(true);
	}
	function pause() {
		setPlaying(false);
	}
	function resume() {
		if (t >= TOTAL) setT(0);
		setPlaying(true);
	}
	function skip() {
		let acc = 0;
		for (let i = 0; i <= actIdx; i++) acc += ACTS[i].duration;
		setT(Math.min(TOTAL, acc + .01));
	}
	function restart() {
		setT(0);
		setPlaying(true);
	}
	function finalize() {
		const id = "EVT-" + Math.floor(2e3 + Math.random() * 8e3);
		addEvent({
			id,
			...DEMO_EVENT,
			status: "live",
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		navigate({
			to: "/events/$eventId",
			params: { eventId: id }
		});
	}
	if (!started) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LaunchScreen, {
		onStart: start,
		onExit: () => navigate({ to: "/" })
	});
	const act = ACTS[actIdx];
	const finished = t >= TOTAL && !playing;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-[oklch(0.07_0.02_250)] text-foreground overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60 bg-[oklch(0.10_0.02_250)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-7 rounded-md bg-primary/15 border border-primary/40 grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-[0.22em] text-primary",
								children: "NETHRA · Auto-Pilot"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: "Cinematic Demo · 90 seconds"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Act ",
								actIdx + 1,
								" / ",
								ACTS.length
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "opacity-40",
								children: "·"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								Math.floor(t).toString().padStart(2, "0"),
								"s / ",
								TOTAL,
								"s"
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [
							playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtrlButton, {
								onClick: pause,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }),
								label: "Pause"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtrlButton, {
								onClick: resume,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }),
								label: finished ? "Replay" : "Resume"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtrlButton, {
								onClick: skip,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-3.5" }),
								label: "Skip act"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtrlButton, {
								onClick: restart,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }),
								label: "Restart"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtrlButton, {
								onClick: () => navigate({ to: "/" }),
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }),
								label: "Exit"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "col-span-12 lg:col-span-7 relative rounded-lg border border-border/60 overflow-hidden bg-[oklch(0.09_0.02_250)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityMap, {
							height: "100%",
							events: actIdx >= 1 ? [stagedEvent(actIdx)] : [],
							focus: actIdx >= 3 ? {
								lat: DEMO_EVENT.lat,
								lng: DEMO_EVENT.lng,
								impactRadiusKm: prediction.impactRadiusKm * (actIdx >= 4 ? 1 : .45 + actProgress * .55),
								riskScore: prediction.riskScore
							} : null,
							routes: actIdx >= 5 ? diversions.slice(0, actIdx >= 6 ? 3 : Math.max(1, Math.ceil(actProgress * 3))).map((d, i) => ({
								points: d.points,
								color: i === 0 ? "oklch(0.78 0.16 200)" : i === 1 ? "oklch(0.80 0.16 60)" : "oklch(0.74 0.18 145)",
								dashed: i > 0,
								label: d.name
							})) : void 0,
							showHeat: actIdx >= 3
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-0",
							style: { background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, oklch(0.10 0.02 250 / 0.10) 4px)" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[oklch(0.10_0.02_250_/_0.85)] border border-border/60 backdrop-blur",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(act.Icon, { className: "size-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-mono uppercase tracking-[0.18em] text-primary",
								children: act.label
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-3 right-3 bottom-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "animate-fade-in rounded-lg border border-border/60 bg-[oklch(0.10_0.02_250_/_0.92)] backdrop-blur px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono uppercase tracking-[0.18em] text-primary/90",
									children: act.caption
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-foreground/90 mt-1",
									children: act.sub
								})]
							}, act.id)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "col-span-12 lg:col-span-5 rounded-lg border border-border/60 bg-[oklch(0.10_0.02_250)] overflow-hidden flex flex-col",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneCard, {
						act,
						progress: actProgress,
						prediction,
						diversions
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "px-4 pb-3 pt-1 bg-[oklch(0.10_0.02_250)] border-t border-border/60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-stretch gap-1 h-2 rounded-full overflow-hidden bg-border/40",
						children: ACTS.map((a, i) => {
							const fill = i < actIdx ? 1 : i === actIdx ? actProgress : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative",
								style: { flex: a.duration },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0",
									style: {
										background: i === actIdx ? "linear-gradient(90deg, var(--primary), oklch(0.85 0.18 200))" : "var(--primary)",
										opacity: i < actIdx ? .5 : 1,
										transform: `scaleX(${fill})`,
										transformOrigin: "left",
										transition: i === actIdx ? "none" : "transform 0.3s"
									}
								})
							}, a.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-between mt-1.5",
						children: ACTS.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								let acc = 0;
								for (let k = 0; k < i; k++) acc += ACTS[k].duration;
								setT(acc + .01);
							},
							className: `text-[9px] font-mono uppercase tracking-wider px-1 transition ${i === actIdx ? "text-primary" : i < actIdx ? "text-muted-foreground" : "text-muted-foreground/50"} hover:text-primary`,
							children: a.label
						}, a.id))
					}),
					finished && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between rounded-md border border-success/40 bg-success/10 px-4 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-foreground",
									children: "Demo complete."
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Open this scenario as a live event in the Command Center?"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: restart,
								className: "text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-card/80",
								children: "Replay"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: finalize,
								className: "text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "size-3.5" }), " Open in Command Center"]
							})]
						})]
					})
				]
			})
		]
	});
}
function stagedEvent(actIdx) {
	return {
		...DEMO_EVENT,
		id: "DEMO",
		status: actIdx >= 7 ? "live" : actIdx >= 6 ? "deployed" : "planned",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function LaunchScreen({ onStart, onExit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-center overflow-hidden",
		style: { background: "radial-gradient(ellipse at 30% 20%, oklch(0.22 0.05 220), oklch(0.07 0.02 250) 60%)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-30",
				style: {
					backgroundImage: "linear-gradient(oklch(0.78 0.16 200 / 0.18) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.16 200 / 0.18) 1px, transparent 1px)",
					backgroundSize: "48px 48px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onExit,
				className: "absolute top-5 right-5 size-9 grid place-items-center rounded-md border border-border bg-card/60 hover:bg-card text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative text-center px-6 max-w-2xl animate-fade-in",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-[10px] font-mono uppercase tracking-[0.22em] text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-pulse" }), " Auto-Pilot Demo"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-5 text-4xl md:text-6xl font-semibold tracking-tight",
						children: [
							"See Bengaluru ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: "re-plan itself"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"in 90 seconds."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-base md:text-lg text-muted-foreground",
						children: "NETHRA stages a major cricket final at Chinnaswamy, predicts risk from 8,173 historical incidents, simulates congestion, plans diversions, deploys officers, and reports the outcome — autonomously."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onStart,
							className: "group inline-flex items-center gap-2.5 rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 shadow-[0_0_40px_-10px_var(--primary)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }),
								" Run Auto-Pilot",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-mono uppercase tracking-wider opacity-70 group-hover:opacity-100",
									children: "90s"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onExit,
							className: "text-sm text-muted-foreground hover:text-foreground px-3 py-3",
							children: "Skip"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 grid grid-cols-3 gap-3 text-left",
						children: [
							{
								k: "Predict",
								v: "Risk model + 8,173 incidents"
							},
							{
								k: "Plan",
								v: "Diversions + resource roll-up"
							},
							{
								k: "Deploy",
								v: "Command center · live ops"
							}
						].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border/60 bg-card/40 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-wider text-primary",
								children: c.k
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mt-1",
								children: c.v
							})]
						}, c.k))
					})
				]
			})
		]
	});
}
function SceneCard({ act, progress, prediction, diversions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full animate-fade-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 py-3 border-b border-border/60 flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(act.Icon, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-mono uppercase tracking-[0.18em] text-primary",
				children: act.label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 overflow-auto p-4",
			children: [
				act.id === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneTitle, {}),
				act.id === "intel" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneIntel, { progress }),
				act.id === "predict" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenePredict, {
					progress,
					prediction
				}),
				act.id === "simulate" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneSimulate, {
					progress,
					prediction
				}),
				act.id === "impact" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneImpact, {
					prediction,
					progress
				}),
				act.id === "divert" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneDivert, {
					diversions,
					progress
				}),
				act.id === "deploy" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneDeploy, {
					progress,
					prediction
				}),
				act.id === "command" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneCommand, { prediction }),
				act.id === "report" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneReport, { prediction })
			]
		})]
	}, act.id);
}
function SceneTitle() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-full grid place-items-center text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-mono uppercase tracking-[0.22em] text-primary",
				children: "Smart City Operating System"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-3xl font-semibold mt-3",
				children: "Predict · Plan · Deploy · Learn"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-3 max-w-sm mx-auto",
				children: "The same loop a Traffic Commissioner runs in the war room, compressed into 90 seconds."
			})
		] })
	});
}
function SceneIntel({ progress }) {
	const lines = [
		{
			t: "0.0",
			k: "INGEST",
			v: "BBMP events feed · 1 new entry"
		},
		{
			t: "0.2",
			k: "PARSE",
			v: "RCB vs CSK · IPL Final"
		},
		{
			t: "0.4",
			k: "GEOCODE",
			v: "M. Chinnaswamy Stadium · 12.9788°N, 77.5996°E"
		},
		{
			t: "0.5",
			k: "CROWD",
			v: "Capacity 42,000 · 6h window"
		},
		{
			t: "0.7",
			k: "WEATHER",
			v: "Clear · 24°C · low rain risk"
		},
		{
			t: "0.9",
			k: "LOCK",
			v: "Event registered as EVT-IPL-001"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2 font-mono text-[12px]",
		children: lines.filter((_, i) => progress >= i / lines.length).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-3 animate-fade-in",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground w-10",
					children: [
						"+",
						l.t,
						"s"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-primary w-20",
					children: l.k
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground/90 flex-1",
					children: l.v
				})
			]
		}, i))
	});
}
function ScenePredict({ progress, prediction }) {
	const score = Math.round(prediction.riskScore * Math.min(1, progress * 1.2));
	const band = riskBand(score);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-12 gap-4 items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "col-span-5 grid place-items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskGauge, { score })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "col-span-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
					children: "Predicted band"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xl font-semibold mt-1",
					style: { color: band.color },
					children: band.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-1.5",
					children: prediction.reasoning.slice(0, 4).map((r, i) => progress >= (i + 1) / 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 text-[12px] animate-fade-in",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { color: band.color },
							children: "›"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground/85",
							children: r
						})]
					}, i))
				})
			]
		})]
	});
}
function SceneSimulate({ progress, prediction }) {
	const tiles = [
		{
			k: "Delay added",
			v: `+${Math.round(prediction.delayMinutes * progress)} min`
		},
		{
			k: "Impact radius",
			v: `${(prediction.impactRadiusKm * progress).toFixed(1)} km`
		},
		{
			k: "Throughput drop",
			v: `-${Math.round(38 * progress)}%`
		},
		{
			k: "Spillback",
			v: `${Math.round(progress * 4)} corridors`
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] text-muted-foreground",
				children: [
					"Propagating demand on a graph of ",
					prediction.affectedJunctions.length + 7,
					" junctions…"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2.5",
				children: tiles.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border/60 bg-card/40 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
						children: t.k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-semibold mt-1 tabular-nums",
						children: t.v
					})]
				}, t.k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-2 rounded-full bg-border/40 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-gradient-to-r from-primary to-amber-400",
					style: {
						width: `${progress * 100}%`,
						transition: "none"
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] font-mono text-primary",
				children: [
					"SIM · ",
					Math.round(progress * 100),
					"%"
				]
			})
		]
	});
}
function SceneImpact({ prediction, progress }) {
	const peopleHours = Math.round(38e3 * progress);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-warning/40 bg-warning/10 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-warning",
					children: "Citizen impact"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-2xl font-semibold mt-1 tabular-nums",
					children: [
						peopleHours.toLocaleString(),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-normal text-muted-foreground",
							children: "people-hours at risk"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
				children: "Affected corridors"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1.5 text-[13px] space-y-1",
				children: prediction.affectedCorridors.slice(0, 4).map((c, i) => progress >= (i + 1) / 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between animate-fade-in border-b border-border/40 pb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground font-mono text-[11px]",
						children: ["tier ", i + 1]
					})]
				}, c))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
				children: "Critical junctions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1.5 flex flex-wrap gap-1.5",
				children: prediction.affectedJunctions.slice(0, 6).map((j, i) => progress >= (i + 1) / 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "animate-fade-in text-[11px] px-2 py-0.5 rounded border border-border bg-card/50",
					children: j
				}, j))
			})] })
		]
	});
}
function SceneDivert({ diversions, progress }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2.5",
		children: diversions.slice(0, 3).map((d, i) => progress >= i / 3.5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "animate-fade-in rounded-md border border-border/60 bg-card/40 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm font-medium flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-3.5 text-primary" }),
							d.name,
							d.recommended && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30",
								children: "Recommended"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] font-mono text-muted-foreground",
						children: [
							"+",
							d.extraMinutes,
							" min"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 text-[11px] text-muted-foreground",
					children: ["Covers: ", d.coverage.join(" · ")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 h-1.5 rounded-full bg-border/40 overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-primary",
						style: { width: `${d.capacityPct}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 text-[10px] font-mono text-muted-foreground",
					children: [
						"Absorbs ",
						d.capacityPct,
						"% of demand"
					]
				})
			]
		}, d.id))
	});
}
function SceneDeploy({ progress, prediction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-2",
			children: [
				{
					k: "Officers",
					v: prediction.recommendedOfficers,
					icon: Users
				},
				{
					k: "Barricades",
					v: prediction.recommendedBarricades,
					icon: Shield
				},
				{
					k: "Patrols",
					v: Math.max(2, Math.round(prediction.recommendedOfficers / 4)),
					icon: Radio
				}
			].map(({ k, v, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border/60 bg-card/40 p-3 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary mx-auto" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xl font-semibold mt-1 tabular-nums",
						children: Math.round(v * Math.min(1, progress * 1.1))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
						children: k
					})
				]
			}, k))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border/60 bg-card/40 p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
				children: "Deployment plan"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1.5 text-[12px] space-y-1",
				children: [
					"12 officers · Chinnaswamy north & east gates",
					"8 officers · MG Road / Trinity junction",
					"6 officers · Cubbon Park ring",
					"4 barricade clusters · diversion entry points",
					"2 patrol units · ORR ramp monitoring"
				].map((l, i) => progress >= (i + 1) / 7 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2 animate-fade-in",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-success",
						children: "▸"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: l })]
				}, l))
			})]
		})]
	});
}
function SceneCommand({ prediction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-2 text-center",
			children: [
				{
					k: "Units",
					v: "26",
					tone: "var(--primary)"
				},
				{
					k: "Cameras",
					v: "48",
					tone: "oklch(0.80 0.16 60)"
				},
				{
					k: "Risk",
					v: `${prediction.riskScore}`,
					tone: riskBand(prediction.riskScore).color
				}
			].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border/60 bg-card/40 p-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xl font-semibold tabular-nums",
					style: { color: m.tone },
					children: m.v
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
					children: m.k
				})]
			}, m.k))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-md border border-border/60 bg-[oklch(0.08_0.02_250)] p-3 font-mono text-[11px] space-y-1",
			children: [[
				{
					t: "00:00",
					v: "Command center activated · 26 units online"
				},
				{
					t: "00:04",
					v: "MG Road camera #14 — flow nominal"
				},
				{
					t: "00:08",
					v: "Trinity junction barricade live"
				},
				{
					t: "00:12",
					v: "ORR East ramp meter armed"
				},
				{
					t: "00:16",
					v: "Gate B inflow 1,200 pax/min — within plan"
				},
				{
					t: "00:21",
					v: "Patrol P-3 reroute confirmed via north bypass"
				}
			].map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 animate-fade-in",
				style: { animationDelay: `${i * 90}ms` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-primary",
					children: f.t
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground/85",
					children: f.v
				})]
			}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 text-success",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success self-center animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Heartbeat live · 2s tick" })]
			})]
		})]
	});
}
function SceneReport({ prediction }) {
	const actualDelay = Math.round(prediction.delayMinutes * .55);
	const saved = prediction.delayMinutes - actualDelay;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-success/40 bg-success/10 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-wider text-success",
						children: "Event closed"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-base font-medium mt-1",
						children: "RCB vs CSK · IPL Final · 6h 04m"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: "Predicted vs Actual reconciled"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Predicted risk",
						v: `${prediction.riskScore}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Actual risk",
						v: `${Math.round(prediction.riskScore * .92)}`,
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Delay avoided",
						v: `${saved} min`,
						accent: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "People-hours saved",
						v: `${(saved * 700).toLocaleString()}`,
						accent: "success"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border/60 bg-card/40 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
					children: "Learn loop"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px] mt-1.5 text-foreground/85",
					children: "Model v1.3 held within ±5 points on risk and ±3 min on delay. Re-weighting Chinnaswamy + MG Road priors → v1.4 queued for next cycle."
				})]
			})
		]
	});
}
function Stat({ label, v, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border/60 bg-card/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-lg font-semibold mt-0.5 tabular-nums ${accent === "success" ? "text-success" : accent === "warning" ? "text-warning" : "text-foreground"}`,
			children: v
		})]
	});
}
function CtrlButton({ onClick, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		title: label,
		className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 hover:bg-card text-foreground/80 hover:text-foreground px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider",
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden sm:inline",
			children: label
		})]
	});
}
//#endregion
export { DemoPage as component };
