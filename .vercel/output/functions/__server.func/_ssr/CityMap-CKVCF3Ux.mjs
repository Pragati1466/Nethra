import { o as __toESM } from "../_runtime.mjs";
import { r as INCIDENTS, v as riskBand } from "./intel-Bd2vThK7.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CityMap-CKVCF3Ux.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BBOX = {
	minLat: 12.82,
	maxLat: 13.18,
	minLng: 77.45,
	maxLng: 77.78
};
var VIEW_W = 1e3;
var VIEW_H = 700;
function project(lat, lng) {
	return {
		x: (lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng) * VIEW_W,
		y: (BBOX.maxLat - lat) / (BBOX.maxLat - BBOX.minLat) * VIEW_H
	};
}
function unproject(x, y) {
	const lng = BBOX.minLng + x / VIEW_W * (BBOX.maxLng - BBOX.minLng);
	return {
		lat: BBOX.maxLat - y / VIEW_H * (BBOX.maxLat - BBOX.minLat),
		lng
	};
}
var KM_PER_DEG_LAT = 110.9;
var KM_PER_DEG_LNG = 108.3;
function kmToViewportRadius(km) {
	const dLat = km / KM_PER_DEG_LAT;
	return (km / KM_PER_DEG_LNG / (BBOX.maxLng - BBOX.minLng) * VIEW_W + dLat / (BBOX.maxLat - BBOX.minLat) * VIEW_H) / 2;
}
var ARTERIALS = [
	{
		name: "ORR",
		coords: [
			[13.05, 77.5],
			[13.1, 77.6],
			[13.06, 77.72],
			[12.95, 77.76],
			[12.85, 77.7],
			[12.85, 77.55],
			[12.95, 77.5],
			[13.05, 77.5]
		]
	},
	{
		name: "Tumkur Road",
		coords: [
			[13.18, 77.45],
			[13.04, 77.52],
			[12.97, 77.58]
		]
	},
	{
		name: "Bellary Road",
		coords: [
			[13.18, 77.59],
			[13.05, 77.59],
			[12.97, 77.59]
		]
	},
	{
		name: "Old Madras Road",
		coords: [
			[12.99, 77.78],
			[12.98, 77.7],
			[12.97, 77.6]
		]
	},
	{
		name: "Hosur Road",
		coords: [
			[12.82, 77.7],
			[12.9, 77.65],
			[12.97, 77.6]
		]
	},
	{
		name: "Mysore Road",
		coords: [
			[12.85, 77.45],
			[12.92, 77.52],
			[12.97, 77.58]
		]
	},
	{
		name: "Magadi Road",
		coords: [
			[12.99, 77.46],
			[12.98, 77.53],
			[12.97, 77.58]
		]
	},
	{
		name: "Bannerghatta",
		coords: [
			[12.82, 77.58],
			[12.88, 77.59],
			[12.97, 77.59]
		]
	}
];
function CityMap({ height = "100%", events = [], focus, onPick, showHeat = true, routes, units, className }) {
	const svgRef = (0, import_react.useRef)(null);
	const [hoverPin, setHoverPin] = (0, import_react.useState)(null);
	const [tick, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const h = setInterval(() => setTick((t) => t + 1), 2200);
		return () => clearInterval(h);
	}, []);
	const heatClusters = (0, import_react.useMemo)(() => {
		const cell = 32;
		const map = /* @__PURE__ */ new Map();
		for (const i of INCIDENTS) {
			const { x, y } = project(i.lat, i.lng);
			if (x < 0 || x > VIEW_W || y < 0 || y > VIEW_H) continue;
			const k = `${Math.floor(x / cell)}_${Math.floor(y / cell)}`;
			const w = i.priority === "High" ? 2 : 1;
			const prev = map.get(k);
			if (prev) {
				prev.w += w;
				prev.x = (prev.x + x) / 2;
				prev.y = (prev.y + y) / 2;
			} else map.set(k, {
				x,
				y,
				w
			});
		}
		return [...map.values()];
	}, []);
	const maxW = heatClusters.reduce((m, c) => Math.max(m, c.w), 1);
	function handleClick(e) {
		if (!onPick || !svgRef.current) return;
		const pt = svgRef.current.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const ctm = svgRef.current.getScreenCTM();
		if (!ctm) return;
		const inv = pt.matrixTransform(ctm.inverse());
		const { lat, lng } = unproject(inv.x, inv.y);
		onPick(lat, lng);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		style: {
			height,
			width: "100%",
			position: "relative",
			borderRadius: 8,
			overflow: "hidden",
			background: "radial-gradient(ellipse at center, oklch(0.20 0.03 230), oklch(0.14 0.02 250) 70%)",
			border: "1px solid var(--border)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				ref: svgRef,
				viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
				width: "100%",
				height: "100%",
				preserveAspectRatio: "xMidYMid slice",
				onClick: handleClick,
				style: {
					cursor: onPick ? "crosshair" : "default",
					display: "block"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pattern", {
							id: "grid",
							width: "40",
							height: "40",
							patternUnits: "userSpaceOnUse",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M 40 0 L 0 0 0 40",
								fill: "none",
								stroke: "oklch(0.30 0.025 250 / 0.35)",
								strokeWidth: "0.5"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
							id: "heat",
							cx: "50%",
							cy: "50%",
							r: "50%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "#ef4444",
									stopOpacity: "0.55"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "40%",
									stopColor: "#fb923c",
									stopOpacity: "0.35"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "70%",
									stopColor: "#facc15",
									stopOpacity: "0.18"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "#22d3ee",
									stopOpacity: "0"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
							id: "vignette",
							cx: "50%",
							cy: "50%",
							r: "65%",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "60%",
								stopColor: "transparent"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset: "100%",
								stopColor: "oklch(0.10 0.02 250)",
								stopOpacity: "0.85"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
							id: "glow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", { stdDeviation: "3" })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: VIEW_W,
						height: VIEW_H,
						fill: "url(#grid)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: VIEW_W / 2,
						y1: "0",
						x2: VIEW_W / 2,
						y2: VIEW_H,
						stroke: "oklch(0.78 0.16 200 / 0.18)",
						strokeWidth: "0.5",
						strokeDasharray: "2 6"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "0",
						y1: VIEW_H / 2,
						x2: VIEW_W,
						y2: VIEW_H / 2,
						stroke: "oklch(0.78 0.16 200 / 0.18)",
						strokeWidth: "0.5",
						strokeDasharray: "2 6"
					}),
					ARTERIALS.map((road) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
						points: road.coords.map(([la, ln]) => {
							const p = project(la, ln);
							return `${p.x},${p.y}`;
						}).join(" "),
						fill: "none",
						stroke: "oklch(0.55 0.06 220 / 0.55)",
						strokeWidth: "2.2",
						strokeLinejoin: "round",
						strokeLinecap: "round"
					}) }, road.name)),
					showHeat && heatClusters.map((c, i) => {
						const intensity = c.w / maxW;
						const r = 18 + intensity * 28;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: c.x,
							cy: c.y,
							r,
							fill: "url(#heat)",
							opacity: .4 + intensity * .5
						}, i);
					}),
					routes?.map((rt, i) => {
						const pts = rt.points.map(([la, ln]) => {
							const p = project(la, ln);
							return `${p.x},${p.y}`;
						}).join(" ");
						const color = rt.color ?? "var(--primary)";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
							points: pts,
							fill: "none",
							stroke: color,
							strokeOpacity: "0.25",
							strokeWidth: "9",
							strokeLinejoin: "round",
							strokeLinecap: "round"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
							points: pts,
							fill: "none",
							stroke: color,
							strokeWidth: "2.4",
							strokeLinejoin: "round",
							strokeLinecap: "round",
							strokeDasharray: rt.dashed ? "6 6" : void 0
						})] }, `rt-${i}`);
					}),
					focus && (() => {
						const p = project(focus.lat, focus.lng);
						const r = kmToViewportRadius(focus.impactRadiusKm ?? 1);
						const band = riskBand(focus.riskScore ?? 60);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: p.x,
								cy: p.y,
								r,
								fill: band.color,
								fillOpacity: "0.10",
								stroke: band.color,
								strokeWidth: "1.5",
								strokeDasharray: "6 6"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: p.x,
								cy: p.y,
								r: r * (.5 + tick % 5 / 10),
								fill: "none",
								stroke: band.color,
								strokeWidth: "0.8",
								opacity: .5 - tick % 5 / 12
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: p.x,
								cy: p.y,
								r: "6",
								fill: band.color,
								stroke: "#0a0a14",
								strokeWidth: "2"
							})
						] });
					})(),
					events.map((e) => {
						const p = project(e.lat, e.lng);
						const band = riskBand(e.status === "live" ? 85 : 60);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							transform: `translate(${p.x},${p.y})`,
							style: { cursor: "pointer" },
							onMouseEnter: () => setHoverPin(e),
							onMouseLeave: () => setHoverPin(null),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: "14",
									fill: band.color,
									opacity: "0.18",
									filter: "url(#glow)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: "10",
									fill: band.color,
									stroke: "#0a0a14",
									strokeWidth: "2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									textAnchor: "middle",
									y: "4",
									fontSize: "11",
									fontWeight: "700",
									fill: "#0a0a14",
									fontFamily: "ui-sans-serif",
									children: e.kind[0].toUpperCase()
								}),
								e.status === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: 10 + tick % 3 * 4,
									fill: "none",
									stroke: band.color,
									strokeWidth: "1",
									opacity: .6 - tick % 3 * .2
								})
							]
						}, e.id);
					}),
					units?.map((u) => {
						const p = project(u.lat, u.lng);
						const color = u.tone === "success" ? "var(--success)" : u.tone === "warning" ? "var(--warning)" : u.tone === "muted" ? "var(--muted-foreground)" : "var(--info)";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							transform: `translate(${p.x},${p.y})`,
							style: { transition: "transform 1s linear" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: 4 + tick % 4,
									fill: color,
									opacity: .18
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									r: "3.5",
									fill: color,
									stroke: "#0a0a14",
									strokeWidth: "1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: "6",
									y: "-4",
									fontSize: "8",
									fill: color,
									fontFamily: "ui-mono, monospace",
									children: u.callsign
								})
							]
						}, u.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: VIEW_W,
						height: VIEW_H,
						fill: "url(#vignette)",
						pointerEvents: "none"
					}),
					hoverPin && (() => {
						const p = project(hoverPin.lat, hoverPin.lng);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							transform: `translate(${Math.min(VIEW_W - 220, p.x + 14)},${Math.max(10, p.y - 60)})`,
							pointerEvents: "none",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
									width: "220",
									height: "58",
									rx: "6",
									fill: "oklch(0.16 0.02 250 / 0.95)",
									stroke: "var(--border)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: "10",
									y: "20",
									fontSize: "12",
									fontWeight: "600",
									fill: "#fff",
									fontFamily: "ui-sans-serif",
									children: hoverPin.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: "10",
									y: "36",
									fontSize: "10",
									fill: "#9ca3af",
									fontFamily: "ui-sans-serif",
									children: hoverPin.address.slice(0, 36)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
									x: "10",
									y: "50",
									fontSize: "10",
									fill: "#22d3ee",
									fontFamily: "ui-mono, monospace",
									children: [
										hoverPin.crowd.toLocaleString(),
										" · ",
										hoverPin.status
									]
								})
							]
						});
					})()
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					position: "absolute",
					left: 10,
					top: 10,
					display: "flex",
					gap: 6,
					pointerEvents: "none"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					style: {
						fontSize: 10,
						padding: "3px 8px",
						borderRadius: 4,
						background: "oklch(0.20 0.022 250 / 0.85)",
						color: "var(--primary)",
						border: "1px solid var(--border)",
						letterSpacing: "0.1em",
						textTransform: "uppercase"
					},
					children: "NETHRA · TACTICAL VIEW"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					style: {
						fontSize: 10,
						padding: "3px 8px",
						borderRadius: 4,
						background: "oklch(0.20 0.022 250 / 0.85)",
						color: "var(--muted-foreground)",
						border: "1px solid var(--border)"
					},
					children: "12.97°N · 77.59°E"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					position: "absolute",
					right: 10,
					bottom: 10,
					fontSize: 10,
					fontFamily: "var(--font-mono)",
					color: "var(--muted-foreground)",
					letterSpacing: "0.08em"
				},
				children: [
					"BENGALURU · ",
					INCIDENTS.length,
					" INTEL POINTS"
				]
			})
		]
	});
}
//#endregion
export { CityMap as t };
