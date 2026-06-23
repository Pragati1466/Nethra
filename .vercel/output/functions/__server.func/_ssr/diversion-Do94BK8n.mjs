import { o as __toESM } from "../_runtime.mjs";
import { _ as riskBand, b as updateEvent, c as explainEvent, g as predictImpact, s as diversionRoutesFor, u as getEvents, y as subscribe } from "./intel-BKuSbRxh.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, k as isRedirect, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as CircleCheck, F as LoaderCircle, S as Route, U as Gauge, X as Clock, _ as ShieldCheck, b as Send, ct as ArrowRight, h as Signal, j as Navigation } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as CityMap } from "./CityMap-DcVaDjIA.mjs";
import { t as MetricStat } from "./RiskGauge-CqxM5Prs.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-CIfq5gOD.mjs";
import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as ExplainabilityPanel } from "./Explainability-Cp41_M55.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diversion-Do94BK8n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getDiversionRoutes = createServerFn({ method: "POST" }).inputValidator((d) => d).handler(createSsrRpc("aa8cb64a8346cc1dc6fe8f5c71c06d7809386eee8ce71c102fd133f2722e9113"));
function DiversionPage() {
	const [events, setEvents] = (0, import_react.useState)(getEvents());
	(0, import_react.useEffect)(() => subscribe(() => setEvents([...getEvents()])), []);
	const ranked = (0, import_react.useMemo)(() => events.map((e) => ({
		e,
		p: predictImpact({
			kind: e.kind,
			lat: e.lat,
			lng: e.lng,
			crowd: e.crowd,
			durationHours: e.durationHours
		})
	})).sort((a, b) => b.p.riskScore - a.p.riskScore), [events]);
	const [selectedId, setSelectedId] = (0, import_react.useState)(ranked[0]?.e.id);
	const selected = ranked.find((r) => r.e.id === selectedId) ?? ranked[0];
	const [chosenRoute, setChosenRoute] = (0, import_react.useState)(null);
	const fetchRoutes = useServerFn(getDiversionRoutes);
	const routing = useQuery({
		queryKey: [
			"osrm",
			selected?.e.id,
			selected?.p.impactRadiusKm
		],
		enabled: !!selected,
		staleTime: 5 * 6e4,
		queryFn: () => fetchRoutes({ data: {
			lat: selected.e.lat,
			lng: selected.e.lng,
			impactRadiusKm: selected.p.impactRadiusKm
		} })
	});
	const routes = routing.data?.routes ?? [];
	(0, import_react.useEffect)(() => {
		if (chosenRoute) return;
		const rec = routes.find((r) => r.recommended);
		if (rec) setChosenRoute(rec.id);
	}, [routes, chosenRoute]);
	const palette = [
		"#22d3ee",
		"#f59e0b",
		"#22c55e",
		"#a78bfa"
	];
	const mapRoutes = routes.map((r, i) => ({
		points: r.geometry,
		color: palette[i % palette.length],
		dashed: chosenRoute !== null && chosenRoute !== r.id
	}));
	const picked = routes.find((r) => r.id === chosenRoute) ?? routes.find((r) => r.recommended) ?? routes[0];
	const explanation = (0, import_react.useMemo)(() => {
		if (!selected || !routes.length) return null;
		const legacyRoutes = routes.map((r) => ({
			id: r.id,
			name: r.name,
			points: r.geometry,
			extraMinutes: r.extraMinutes,
			capacityPct: r.capacityPct,
			coverage: [`${r.distanceKm.toFixed(1)} km`, `${r.congestionReductionPct}% relief`],
			recommended: r.recommended
		}));
		const legacyPicked = legacyRoutes.find((r) => r.id === picked?.id) ?? legacyRoutes[0];
		const finalRoutes = legacyRoutes.length ? legacyRoutes : diversionRoutesFor(selected.e, selected.p);
		return explainEvent(selected.e, selected.p, legacyPicked, finalRoutes);
	}, [
		selected,
		routes,
		picked
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-mono uppercase tracking-[0.2em] text-primary",
						children: "Smart Diversion Planner · OSRM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold mt-1",
						children: "Real road-network alternates with live ETA impact"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: "Routes are computed on OpenStreetMap via OSRM. Pick an event, compare alternates by relief and detour cost, lock the route and push turn-by-turn directions to field units."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Events",
				subtitle: "Risk-ranked",
				className: "col-span-12 lg:col-span-3 max-h-[640px] overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: ranked.map(({ e, p }) => {
						const band = riskBand(p.riskScore);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setSelectedId(e.id);
								setChosenRoute(null);
							},
							className: `w-full text-left px-3 py-2.5 hover:bg-accent/40 transition ${e.id === selected?.e.id ? "bg-primary/10 border-l-2 border-primary" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: e.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs",
									style: { color: band.color },
									children: p.riskScore
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground truncate",
								children: e.address
							})]
						}, e.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Tactical Map",
				subtitle: selected?.e.name ?? "—",
				className: "col-span-12 lg:col-span-6 h-[640px] flex flex-col",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: routing.data?.source === "osrm" ? "success" : routing.isFetching ? "info" : "warning",
					children: routing.isFetching ? "routing…" : routing.data?.source === "osrm" ? "OSRM · live" : "fallback"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 p-2 relative",
					children: [selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityMap, {
						events: [selected.e],
						focus: {
							lat: selected.e.lat,
							lng: selected.e.lng,
							impactRadiusKm: selected.p.impactRadiusKm,
							riskScore: selected.p.riskScore
						},
						routes: mapRoutes,
						showHeat: false
					}), routing.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Querying OSRM road network…"]
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Alternate Routes",
				className: "col-span-12 lg:col-span-3 max-h-[640px] overflow-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "divide-y divide-border",
					children: [
						routing.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 text-sm text-muted-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Computing road-network options…"]
						}),
						!routing.isLoading && !routes.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4 text-sm text-muted-foreground",
							children: "No alternates produced. Try a different event."
						}),
						routes.map((r, i) => {
							const active = chosenRoute === r.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `p-3 ${active ? "bg-primary/5" : ""}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 mb-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "size-2.5 rounded-full",
												style: { background: palette[i] }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-medium",
												children: r.name
											}),
											r.recommended && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: "success",
												children: "recommended"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-1.5 text-[11px] font-mono text-muted-foreground mt-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
													" ",
													r.durationMin.toFixed(1),
													" min"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-3" }),
													" ",
													r.distanceKm.toFixed(1),
													" km"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 text-warning",
												children: [
													"+",
													r.extraMinutes,
													" min"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 text-success",
												children: [
													"-",
													r.congestionReductionPct,
													"% load"
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] text-muted-foreground mt-1.5",
										children: [
											"Clears incident by ",
											r.minDistanceFromIncidentKm.toFixed(1),
											" km · capacity ",
											r.capacityPct,
											"%"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setChosenRoute(r.id),
										className: `mt-2 inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent/40"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }),
											" ",
											active ? "Selected" : "Select"
										]
									})
								]
							}, r.id);
						})
					]
				})
			}),
			selected && picked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Operational Impact",
				className: "col-span-12 lg:col-span-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 grid grid-cols-2 lg:grid-cols-5 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Selected route",
							value: picked.name,
							sub: `${picked.distanceKm.toFixed(1)} km · ${picked.durationMin.toFixed(1)} min`,
							tone: "info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "ETA impact",
							value: `+${picked.extraMinutes} min`,
							sub: `vs ${routing.data?.baseline?.durationMin?.toFixed(1) ?? "—"} min through-incident`,
							tone: "warning"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Congestion relief",
							value: `${picked.congestionReductionPct}%`,
							sub: "estimated demand absorbed",
							tone: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Avoidance",
							value: `${picked.minDistanceFromIncidentKm.toFixed(1)} km`,
							sub: "closest approach to incident",
							tone: "info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Corridor capacity",
							value: `${picked.capacityPct}%`,
							sub: "road-class proxy"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border p-3 flex flex-wrap gap-2 justify-end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/events/$eventId",
							params: { eventId: selected.e.id },
							className: "inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border hover:bg-accent/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-3.5" }), " Open event"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: !picked,
							onClick: () => {
								updateEvent(selected.e.id, { status: "deployed" });
							},
							className: "inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), " Push to field units"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: !picked,
							onClick: () => {
								updateEvent(selected.e.id, { status: "live" });
							},
							className: "inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-critical text-destructive-foreground disabled:opacity-40 hover:opacity-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), " Activate diversion"]
						})
					]
				})]
			}),
			picked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Turn-by-turn",
				subtitle: picked.name,
				className: "col-span-12 lg:col-span-4 max-h-[520px] overflow-auto",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-4 text-primary" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "divide-y divide-border",
					children: picked.steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-3 px-3 py-2.5 text-[13px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-6 shrink-0 rounded-full bg-primary/15 text-primary grid place-items-center font-mono text-[11px]",
								children: i + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "leading-snug",
									children: s.instruction
								}), s.distanceM > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] font-mono text-muted-foreground mt-0.5 inline-flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-3" }),
											" ",
											formatDistance(s.distanceM)
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
											" ",
											formatDuration(s.durationS)
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 text-muted-foreground mt-1.5" })
						]
					}, i))
				})
			}),
			explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExplainabilityPanel, {
				className: "col-span-12",
				explanation
			}),
			routing.data && !routing.data.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Routing notice",
				className: "col-span-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 text-xs text-warning inline-flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Signal, { className: "size-3.5" }),
						"OSRM unreachable — showing engineered fallback. Reason: ",
						routing.data.error ?? "unknown",
						"."
					]
				})
			})
		]
	}) });
}
function formatDistance(m) {
	if (m >= 1e3) return `${(m / 1e3).toFixed(1)} km`;
	return `${m} m`;
}
function formatDuration(s) {
	if (s >= 60) return `${Math.round(s / 60)} min`;
	return `${s}s`;
}
//#endregion
export { DiversionPage as component };
