import { o as __toESM } from "../_runtime.mjs";
import { a as calibrationBins, d as historicalLedger, f as learnRecords, h as predVsActualSeries, p as learningSummary, x as weeklyPerformance } from "./intel-BKuSbRxh.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { H as GitBranch, c as TrendingUp, l as TrendingDown, rt as Brain, u as Target, x as Search } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as MetricStat } from "./RiskGauge-CqxM5Prs.mjs";
import { i as subscribeClosedIntel, n as getLatestClosedIntel } from "./closed_intel_store-y6Wg7KyK.mjs";
import { t as Input } from "./input-DSwxtU_l.mjs";
import { a as XAxis, c as Area, d as ReferenceLine, f as ResponsiveContainer, i as YAxis, l as Line, m as Legend, n as ScatterChart, o as Scatter, p as Tooltip, r as LineChart, s as ZAxis, t as AreaChart, u as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn-LotmDoBf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var C_PRED = "oklch(0.65 0.18 220)";
var C_ACT = "oklch(0.72 0.18 30)";
var C_OK = "oklch(0.72 0.18 150)";
var C_WARN = "oklch(0.78 0.16 75)";
function LearnPage() {
	const summary = learningSummary();
	const [cei, setCei] = (0, import_react.useState)(getLatestClosedIntel());
	(0, import_react.useEffect)(() => {
		const unsub = subscribeClosedIntel(() => setCei(getLatestClosedIntel()));
		return () => unsub();
	}, []);
	const scatter = predVsActualSeries();
	const weekly = weeklyPerformance();
	const calib = calibrationBins();
	const ledger = historicalLedger(14);
	const records = learnRecords();
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);
	const filteredLedger = (0, import_react.useMemo)(() => {
		if (!debouncedSearchQuery) return ledger;
		const query = debouncedSearchQuery.toLowerCase();
		return ledger.filter((r) => r.id.toLowerCase().includes(query) || r.event.toLowerCase().includes(query) || r.status.toLowerCase().includes(query));
	}, [ledger, debouncedSearchQuery]);
	const filteredRecords = (0, import_react.useMemo)(() => {
		if (!debouncedSearchQuery) return records;
		const query = debouncedSearchQuery.toLowerCase();
		return records.filter((r) => r.id.toLowerCase().includes(query) || r.name.toLowerCase().includes(query) || r.notes.toLowerCase().includes(query));
	}, [records, debouncedSearchQuery]);
	const maxDelay = Math.max(...scatter.map((s) => Math.max(s.predictedDelayMin, s.actualDelayMin))) + 5;
	const identity = [{
		predictedDelayMin: 0,
		actualDelayMin: 0
	}, {
		predictedDelayMin: maxDelay,
		actualDelayMin: maxDelay
	}];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-mono uppercase tracking-[0.2em] text-primary",
							children: "Learning Dashboard"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold mt-1",
							children: "NETHRA sharpens with every closed event"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: "Predicted vs actual delay, forecast accuracy, calibration drift, and the learning trend across the last 12 weeks."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "text",
							placeholder: "Search records...",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							className: "pl-9 w-48 md:w-64"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 font-mono text-[11px] text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, { className: "size-3.5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: summary.modelVersion }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-border",
								children: "·"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [summary.eventsLearned, " events trained"] })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 grid grid-cols-2 lg:grid-cols-5 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Forecast accuracy",
						value: `${summary.overallAccuracy}%`,
						tone: "success",
						sub: "within ±5 min"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Mean abs error",
						value: `${summary.mae} min`,
						tone: "info",
						sub: "delay forecast"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Calibration err",
						value: summary.calibrationError.toFixed(3),
						tone: "info",
						sub: "brier score"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "12-wk gain",
						value: `+${summary.improvement}%`,
						tone: "success",
						sub: "accuracy uplift"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
						label: "Re-tunings",
						value: records.filter((r) => Math.abs(r.predictedRisk - r.actualRisk) > 8).length,
						tone: "warning",
						sub: "priors updated"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Predicted vs Actual Delay",
				subtitle: "Each dot is a closed event. The diagonal is a perfect forecast.",
				className: "col-span-12 lg:col-span-7",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "info",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-3" }), " y = x ideal"]
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[320px] p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScatterChart, {
							margin: {
								top: 10,
								right: 20,
								bottom: 30,
								left: 10
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--border)",
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									dataKey: "predictedDelayMin",
									name: "Predicted",
									unit: "m",
									domain: [0, maxDelay],
									stroke: "var(--muted-foreground)",
									tick: {
										fontSize: 11,
										fontFamily: "ui-monospace"
									},
									label: {
										value: "Predicted delay (min)",
										position: "insideBottom",
										offset: -15,
										fill: "var(--muted-foreground)",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									type: "number",
									dataKey: "actualDelayMin",
									name: "Actual",
									unit: "m",
									domain: [0, maxDelay],
									stroke: "var(--muted-foreground)",
									tick: {
										fontSize: 11,
										fontFamily: "ui-monospace"
									},
									label: {
										value: "Actual (min)",
										angle: -90,
										position: "insideLeft",
										fill: "var(--muted-foreground)",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZAxis, { range: [40, 40] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									cursor: { strokeDasharray: "3 3" },
									contentStyle: {
										background: "var(--panel)",
										border: "1px solid var(--border)",
										fontSize: 12
									},
									formatter: (v, n) => [`${v} min`, n]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scatter, {
									data: identity,
									line: {
										stroke: "var(--border)",
										strokeDasharray: "4 4"
									},
									shape: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {}),
									legendType: "none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scatter, {
									name: "Events",
									data: scatter,
									fill: C_PRED,
									fillOpacity: .7
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Model Calibration",
				subtitle: "Reliability diagram — predicted risk vs observed outcome by decile.",
				className: "col-span-12 lg:col-span-5",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "success",
					children: ["brier ", summary.calibrationError.toFixed(3)]
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[320px] p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: calib,
							margin: {
								top: 10,
								right: 20,
								bottom: 30,
								left: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--border)",
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "predicted",
									unit: "%",
									stroke: "var(--muted-foreground)",
									tick: {
										fontSize: 11,
										fontFamily: "ui-monospace"
									},
									label: {
										value: "Predicted risk",
										position: "insideBottom",
										offset: -15,
										fill: "var(--muted-foreground)",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									unit: "%",
									domain: [0, 100],
									stroke: "var(--muted-foreground)",
									tick: {
										fontSize: 11,
										fontFamily: "ui-monospace"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "var(--panel)",
									border: "1px solid var(--border)",
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
									segment: [{
										x: 0,
										y: 0
									}, {
										x: 100,
										y: 100
									}],
									stroke: "var(--border)",
									strokeDasharray: "4 4",
									label: {
										value: "perfect",
										fill: "var(--muted-foreground)",
										fontSize: 10,
										position: "insideTopRight"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "actual",
									stroke: C_OK,
									strokeWidth: 2,
									dot: {
										r: 3,
										fill: C_OK
									},
									name: "Observed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "predicted",
									stroke: C_PRED,
									strokeWidth: 1.5,
									strokeDasharray: "3 3",
									dot: false,
									name: "Predicted"
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Learning Trend Over Time",
				subtitle: "Weekly forecast accuracy and mean-absolute-error. Trend shows continuous improvement.",
				className: "col-span-12 lg:col-span-7",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "success",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }),
						" +",
						summary.improvement,
						"% in 12w"
					]
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[300px] p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: weekly,
							margin: {
								top: 10,
								right: 20,
								bottom: 20,
								left: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "accGrad",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0%",
										stopColor: C_OK,
										stopOpacity: .5
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "100%",
										stopColor: C_OK,
										stopOpacity: 0
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--border)",
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "week",
									stroke: "var(--muted-foreground)",
									tick: {
										fontSize: 11,
										fontFamily: "ui-monospace"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									yAxisId: "acc",
									unit: "%",
									domain: [0, 100],
									stroke: "var(--muted-foreground)",
									tick: {
										fontSize: 11,
										fontFamily: "ui-monospace"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									yAxisId: "mae",
									orientation: "right",
									unit: "m",
									stroke: "var(--muted-foreground)",
									tick: {
										fontSize: 11,
										fontFamily: "ui-monospace"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "var(--panel)",
									border: "1px solid var(--border)",
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: {
									fontSize: 11,
									fontFamily: "ui-monospace"
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									yAxisId: "acc",
									type: "monotone",
									dataKey: "accuracy",
									stroke: C_OK,
									fill: "url(#accGrad)",
									strokeWidth: 2,
									name: "Accuracy %"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									yAxisId: "mae",
									type: "monotone",
									dataKey: "mae",
									stroke: C_WARN,
									strokeWidth: 2,
									dot: false,
									name: "MAE (min)"
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Latest Learned Event",
				subtitle: "Forecast → T−IW Drift → Revised Action → Outcome → Learned for Future Events",
				className: "col-span-12 lg:col-span-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
						children: "Latest Closed Event"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border bg-card/40 p-3 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: "Event:"
								}),
								" ",
								cei?.eventId ? `${cei.eventId} · ${cei.eventId === "EVT-2041" ? "RCB vs CSK — IPL Match" : "Event impact in queue"}` : "EVT-2041 · RCB vs CSK — IPL Match"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: "Forecast:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[12px] text-muted-foreground mt-1",
									children: ["EIS: ", 98]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: "T−IW Drift:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground mt-1",
										children: cei?.timeWindowRemainingMin ? "Bellary Rd · Hebbal" : "Bellary Rd · Hebbal"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground",
										children: "Forecast deviation detected"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[12px] text-muted-foreground",
										children: [
											"T−IW: ",
											cei?.timeWindowRemainingMin ?? 16,
											" min"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: "Revised Action:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground mt-1",
										children: cei?.revisedAction?.split(" · ")[0] ?? "Diversion activated"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground",
										children: "12 additional officers deployed"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: "Actual Outcome:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[12px] text-muted-foreground mt-1",
										children: [
											"Actual Delay: ",
											cei?.actualDelayMin ?? "—",
											" min"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[12px] text-muted-foreground",
										children: [
											"Improvement: ",
											cei?.forecastDelayMin && cei?.actualDelayMin ? Math.max(0, cei.forecastDelayMin - cei.actualDelayMin) : "—",
											" min"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-medium",
										children: "Learned:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground mt-1",
										children: "Match-day prior updated"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground",
										children: "Junction DNA recalibrated"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground",
										children: "Future forecasts strengthened"
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Historical Performance",
				subtitle: `Latest closed events — predicted vs actual delay${filteredLedger.length !== ledger.length ? ` (${filteredLedger.length} filtered)` : ""}`,
				className: "col-span-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: filteredLedger.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: [
							"No records match \"",
							debouncedSearchQuery,
							"\""
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2",
									children: "ID"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2",
									children: "When"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2",
									children: "Event"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-right",
									children: "Predicted"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-right",
									children: "Actual"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-right",
									children: "Δ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2",
									children: "Status"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredLedger.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60 hover:bg-accent/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2 font-mono text-[11px] text-muted-foreground",
									children: r.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2 font-mono text-[11px]",
									children: r.date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2 capitalize",
									children: r.event
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-2 text-right font-mono",
									children: [r.predicted, "m"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-2 text-right font-mono",
									children: [r.actual, "m"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2 text-right font-mono",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-0.5",
										style: { color: r.delta >= 0 ? "var(--critical)" : "var(--success)" },
										children: [
											r.delta >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3" }),
											r.delta > 0 ? "+" : "",
											r.delta,
											"m"
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: r.status === "on-target" ? "success" : r.status === "improved" ? "info" : "warning",
										children: r.status
									})
								})
							]
						}, r.id)) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Per-Event Learning Notes",
				subtitle: filteredRecords.length !== records.length ? `(${filteredRecords.length} filtered)` : "",
				className: "col-span-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: filteredRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: [
							"No records match \"",
							debouncedSearchQuery,
							"\""
						]
					}) : filteredRecords.map((r) => {
						const delta = r.actualRisk - r.predictedRisk;
						const accurate = Math.abs(delta) <= 8;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 grid grid-cols-12 gap-4 items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-12 lg:col-span-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-mono text-[11px] text-muted-foreground",
											children: r.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium mt-0.5 capitalize",
											children: r.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "size-3 text-primary" }),
												" ",
												r.notes
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiBar, {
									label: "Risk",
									pred: r.predictedRisk,
									act: r.actualRisk,
									unit: ""
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiBar, {
									label: "Delay",
									pred: r.predictedDelayMin,
									act: r.actualDelayMin,
									unit: "m"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-12 lg:col-span-2 flex lg:justify-end items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: accurate ? "success" : "warning",
										children: accurate ? "on target" : "re-tuned"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs inline-flex items-center gap-0.5",
										style: { color: delta >= 0 ? "var(--critical)" : "var(--success)" },
										children: [
											delta >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3" }),
											" Δ ",
											delta > 0 ? "+" : "",
											delta
										]
									})]
								})
							]
						}, r.id);
					})
				})
			})
		]
	}) });
}
function KpiBar({ label, pred, act, unit }) {
	const max = Math.max(pred, act, 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "col-span-6 lg:col-span-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				color: C_PRED,
				pct: pred / max * 100,
				label: `${pred}${unit}`,
				tag: "pred"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				color: C_ACT,
				pct: act / max * 100,
				label: `${act}${unit}`,
				tag: "act"
			})]
		})]
	});
}
function Row({ color, pct, label, tag }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 text-[11px] font-mono",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-7 text-muted-foreground",
				children: tag
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 h-1.5 rounded-full bg-muted overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full",
					style: {
						width: `${pct}%`,
						background: color
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-12 text-right",
				children: label
			})
		]
	});
}
//#endregion
export { LearnPage as component };
