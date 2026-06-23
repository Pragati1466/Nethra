import { o as __toESM } from "../_runtime.mjs";
import { _ as riskBand, g as predictImpact, u as getEvents } from "./intel-BKuSbRxh.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { A as Pause, C as RotateCcw, k as Play } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as CityMap } from "./CityMap-DcVaDjIA.mjs";
import { n as getTiwForEvent } from "./tiw_store-CTlgkrTD.mjs";
import { n as getLatestClosedIntel } from "./closed_intel_store-y6Wg7KyK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/replay-DaweO2PR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIMELINE = [
	{
		t: -120,
		label: "Event created",
		detail: "Operator stages event in NETHRA"
	},
	{
		t: -90,
		label: "Impact predicted",
		detail: "Risk score and affected corridors computed from 8K historical incidents"
	},
	{
		t: -75,
		label: "Diversion plan generated",
		detail: "3 corridor-level alternates published"
	},
	{
		t: -60,
		label: "Resource recommendation approved",
		detail: "Officers and barricades assigned to lead stations"
	},
	{
		t: -30,
		label: "Deployment confirmed",
		detail: "Units acknowledge positions"
	},
	{
		t: 0,
		label: "Event goes live",
		detail: "Monitoring begins"
	},
	{
		t: 30,
		label: "Congestion spike absorbed",
		detail: "Diversions diverted ~22% of inbound traffic"
	},
	{
		t: 90,
		label: "Event closes",
		detail: "After-action report generated"
	}
];
function ReplayPage() {
	const events = getEvents();
	const [step, setStep] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const event = events[0];
	const prediction = (0, import_react.useMemo)(() => event ? predictImpact({
		kind: event.kind,
		lat: event.lat,
		lng: event.lng,
		crowd: event.crowd,
		durationHours: event.durationHours
	}) : null, [event]);
	(0, import_react.useState)(() => {
		let h = null;
		if (playing) h = setInterval(() => setStep((s) => Math.min(TIMELINE.length - 1, s + 1)), 1200);
		return () => {
			if (h) clearInterval(h);
		};
	});
	if (!event || !prediction) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-10 text-muted-foreground",
		children: "No events to replay yet."
	}) });
	const band = riskBand(prediction.riskScore);
	getTiwForEvent(event.id);
	const closed = getLatestClosedIntel();
	const current = TIMELINE[step];
	const beforeRadius = prediction.impactRadiusKm * 1.6;
	const afterRadius = prediction.impactRadiusKm * .7;
	const shownRadius = step < 4 ? beforeRadius : step < 7 ? prediction.impactRadiusKm : afterRadius;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-mono uppercase tracking-[0.2em] text-primary",
						children: "Decision Replay"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold mt-1",
						children: event.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: "Scrub through the operational timeline to reconstruct every decision and learn from outcomes."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "col-span-12 lg:col-span-8 h-[480px] flex flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityMap, {
						events: [event],
						focus: {
							lat: event.lat,
							lng: event.lng,
							impactRadiusKm: shownRadius,
							riskScore: prediction.riskScore
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: current.label,
				subtitle: `T ${current.t >= 0 ? "+" : ""}${current.t} min`,
				className: "col-span-12 lg:col-span-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-foreground/80",
							children: current.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground pt-2",
							children: "Before vs After"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-border bg-card/50 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
										children: "Before"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-mono text-xl mt-1 text-warning",
										children: [Math.round(prediction.delayMinutes * 1.4), " min"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-muted-foreground",
										children: "avg delay (no plan)"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-border bg-card/50 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
										children: "After"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-mono text-xl mt-1 text-success",
										children: [closed?.actualDelayMin ?? Math.round(prediction.delayMinutes * .65), " min"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-muted-foreground",
										children: "with NETHRA plan"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: band.tone,
							children: ["Peak risk ", prediction.riskScore]
						}),
						step === TIMELINE.length - 1 && closed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-md border border-success/30 bg-success/5 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-wider text-success",
								children: "Final Outcome"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-sm text-foreground/85",
								children: [
									"Actual Delay: ",
									closed.actualDelayMin,
									" min · Learned: ",
									closed.learnedUpdate
								]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Timeline",
				className: "col-span-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setPlaying((p) => !p),
									className: "inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium",
									children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), playing ? "Pause" : "Play"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => {
										setStep(0);
										setPlaying(false);
									},
									className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-card/40 px-3 py-1.5 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Reset"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-mono text-muted-foreground ml-auto",
									children: [
										"Step ",
										step + 1,
										" / ",
										TIMELINE.length
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: TIMELINE.length - 1,
							value: step,
							onChange: (e) => setStep(+e.target.value),
							className: "w-full accent-[var(--primary)]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1.5",
							children: TIMELINE.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setStep(i),
								className: `text-left text-[11px] p-2 rounded-md border transition ${i === step ? "border-primary bg-primary/15" : "border-border bg-card/40 hover:bg-accent/40"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-muted-foreground",
									children: [
										"T",
										t.t >= 0 ? "+" : "",
										t.t
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate",
									children: t.label
								})]
							}, i))
						})
					]
				})
			})
		]
	}) });
}
//#endregion
export { ReplayPage as component };
