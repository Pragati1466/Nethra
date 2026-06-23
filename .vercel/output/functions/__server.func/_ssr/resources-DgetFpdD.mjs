import { o as __toESM } from "../_runtime.mjs";
import { b as subscribe, y as rollupResources } from "./intel-Bd2vThK7.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as Radio, _ as ShieldCheck, i as Users, t as Zap } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as MetricStat } from "./RiskGauge-myQ5E85U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-DgetFpdD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResourcesPage() {
	const [pool, setPool] = (0, import_react.useState)(rollupResources());
	(0, import_react.useEffect)(() => subscribe(() => setPool(rollupResources())), []);
	const pools = [
		{
			key: "officers",
			label: "Officers",
			icon: Users,
			data: pool.officers,
			tone: "info"
		},
		{
			key: "barricades",
			label: "Barricades",
			icon: ShieldCheck,
			data: pool.barricades,
			tone: "warning"
		},
		{
			key: "patrols",
			label: "Patrol units",
			icon: Radio,
			data: pool.patrols,
			tone: "success"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-mono uppercase tracking-[0.2em] text-primary",
						children: "Resource Optimization"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold mt-1",
						children: "Citywide allocation across active operations"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: "Live coverage vs. predicted demand. NETHRA flags shortages and suggests reassignment from low-risk events."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3",
				children: pools.map(({ key, label, icon: Icon, data, tone }) => {
					const gap = data.required - data.deployed;
					const coverage = Math.min(100, Math.round(data.deployed / Math.max(1, data.required) * 100));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: gap > 0 ? "critical" : "success",
										children: gap > 0 ? `short ${gap}` : "covered"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-3xl font-semibold",
									children: [data.deployed, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-base text-muted-foreground",
										children: ["/", data.required]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground font-mono",
									children: [
										"pool ",
										data.total,
										" · required ",
										data.required
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1.5 rounded-full bg-muted overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full",
										style: {
											width: `${coverage}%`,
											background: gap > 0 ? "var(--critical)" : "var(--success)"
										}
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
									label: "Coverage",
									value: `${coverage}%`,
									tone
								})
							]
						})
					}, key);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Per-event allocation",
				subtitle: "Click an event to adjust deployment",
				className: "col-span-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-2.5",
										children: "Event"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2.5",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5",
										children: "Risk"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5",
										children: "Officers"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5",
										children: "Barricades"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2.5",
										children: "Patrols"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-4 py-2.5",
										children: "Action"
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: pool.perEvent.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-accent/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-medium",
										children: e.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: e.status === "live" ? "critical" : e.status === "planned" ? "warning" : e.status === "deployed" ? "info" : "muted",
											children: e.status
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-mono",
										children: e.risk
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-mono",
										children: e.officers
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-mono",
										children: e.barricades
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-mono",
										children: e.patrols
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/events/$eventId",
											params: { eventId: e.id },
											className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3" }), " open"]
										})
									})
								]
							}, e.id))
						})]
					})
				})
			})
		]
	}) });
}
//#endregion
export { ResourcesPage as component };
