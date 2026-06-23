import { o as __toESM } from "../_runtime.mjs";
import { _ as predictImpact, i as addEvent, n as EVENT_KINDS, v as riskBand } from "./intel-Bd2vThK7.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as CircleCheck, P as MapPin, f as Sparkles, i as Users } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as CityMap } from "./CityMap-CKVCF3Ux.mjs";
import { n as RiskGauge, t as MetricStat } from "./RiskGauge-myQ5E85U.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events.new-DBx9DAV5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewEvent() {
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("festival");
	const [crowd, setCrowd] = (0, import_react.useState)(15e3);
	const [hours, setHours] = (0, import_react.useState)(4);
	const [startsAt, setStartsAt] = (0, import_react.useState)(() => new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 16));
	const [pin, setPin] = (0, import_react.useState)(null);
	const [address, setAddress] = (0, import_react.useState)("");
	const prediction = (0, import_react.useMemo)(() => pin ? predictImpact({
		kind,
		lat: pin.lat,
		lng: pin.lng,
		crowd,
		durationHours: hours
	}) : null, [
		pin,
		kind,
		crowd,
		hours
	]);
	const band = prediction ? riskBand(prediction.riskScore) : null;
	function handlePick(lat, lng) {
		setPin({
			lat,
			lng
		});
		if (!address) setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)} · Bengaluru`);
	}
	function handleCreate() {
		if (!pin || !name) return;
		const id = "EVT-" + Math.floor(2e3 + Math.random() * 8e3);
		addEvent({
			id,
			name,
			kind,
			lat: pin.lat,
			lng: pin.lng,
			address,
			crowd,
			durationHours: hours,
			startsAt: new Date(startsAt).toISOString(),
			status: "planned",
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		toast.success("Event created successfully", { description: `${name} has been staged and operational plan is ready.` });
		navigate({
			to: "/events/$eventId",
			params: { eventId: id }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-mono uppercase tracking-[0.2em] text-primary",
						children: "Event Creation Center"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold mt-1",
						children: "Stage an upcoming event"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: "Click the map to drop a pin, fill in the details, and NETHRA will instantly predict impact, recommend deployment, and stage operational plans."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "1 · Pick location",
				subtitle: "Click the map",
				className: "col-span-12 lg:col-span-7 h-[560px] flex flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityMap, {
						onPick: handlePick,
						focus: pin && prediction ? {
							lat: pin.lat,
							lng: pin.lng,
							impactRadiusKm: prediction.impactRadiusKm,
							riskScore: prediction.riskScore
						} : null
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "2 · Event details",
				className: "col-span-12 lg:col-span-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Event name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "e.g. Republic Day Parade",
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Type",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: kind,
								onChange: (e) => setKind(e.target.value),
								className: inputCls,
								children: EVENT_KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k.id,
									children: k.label
								}, k.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Location",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: address,
									onChange: (e) => setAddress(e.target.value),
									placeholder: "Drop a pin on the map",
									className: inputCls
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid place-items-center px-3 rounded-md border border-border bg-card/40",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: `size-4 ${pin ? "text-success" : "text-muted-foreground"}` })
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Expected crowd",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 0,
										step: 500,
										value: crowd,
										onChange: (e) => setCrowd(+e.target.value),
										className: inputCls + " pl-8"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Duration (hours)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 1,
									max: 72,
									value: hours,
									onChange: (e) => setHours(+e.target.value),
									className: inputCls
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Starts at",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "datetime-local",
								value: startsAt,
								onChange: (e) => setStartsAt(e.target.value),
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: !pin || !name,
							onClick: handleCreate,
							className: "w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-3.5 py-2.5 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Create & open operational plan"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "3 · Live impact prediction",
				subtitle: pin ? "Refines as you edit details" : "Drop a pin to begin",
				action: prediction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: band?.tone ?? "info",
					children: [
						"Confidence ",
						prediction.confidence,
						"%"
					]
				}) : null,
				className: "col-span-12",
				children: !prediction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-10 text-center text-muted-foreground text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 mx-auto mb-2 text-muted-foreground/60" }), "Pick a location on the map to see predicted risk, affected corridors, and recommended deployment."]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 grid grid-cols-12 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-12 md:col-span-3 grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskGauge, { score: prediction.riskScore })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 md:col-span-5 grid grid-cols-2 gap-3 self-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
									label: "Impact radius",
									value: `${prediction.impactRadiusKm} km`,
									tone: "info"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
									label: "Expected delay",
									value: `${prediction.delayMinutes} min`,
									tone: "warning"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
									label: "Officers needed",
									value: prediction.recommendedOfficers,
									sub: "recommended"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
									label: "Barricades",
									value: prediction.recommendedBarricades,
									sub: "recommended"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 md:col-span-4 space-y-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
								children: "Why this score"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1.5 text-[13px]",
								children: prediction.reasoning.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-primary mt-0.5",
										children: "›"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground/80",
										children: r
									})]
								}, i))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
									label: "Affected junctions",
									items: prediction.affectedJunctions
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
									label: "Stress corridors",
									items: prediction.affectedCorridors
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
									label: "Responding stations",
									items: prediction.affectedStations
								})
							]
						})
					]
				})
			})
		]
	}) });
}
var inputCls = "w-full rounded-md bg-input/60 border border-border px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition";
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
			children: label
		}), children]
	});
}
function Chips({ label, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children: items.length ? items.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[12px] px-2 py-1 rounded-md bg-accent/50 border border-border",
			children: x
		}, x)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: "—"
		})
	})] });
}
//#endregion
export { NewEvent as component };
