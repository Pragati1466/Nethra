import { _ as riskBand } from "./intel-BKuSbRxh.mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RiskGauge-CqxM5Prs.js
var import_jsx_runtime = require_jsx_runtime();
function RiskGauge({ score, label = "Risk Score", size = 140 }) {
	const band = riskBand(score);
	const r = size / 2 - 10;
	const c = 2 * Math.PI * r;
	const dash = score / 100 * c;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			style: {
				width: size,
				height: size
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				className: "-rotate-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: size / 2,
					cy: size / 2,
					r,
					stroke: "var(--border)",
					strokeWidth: "8",
					fill: "none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: size / 2,
					cy: size / 2,
					r,
					stroke: band.color,
					strokeWidth: "8",
					fill: "none",
					strokeDasharray: `${dash} ${c}`,
					strokeLinecap: "round",
					style: { transition: "stroke-dasharray 600ms ease" }
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-3xl font-semibold",
						style: { color: band.color },
						children: score
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5",
						children: "/ 100"
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-semibold mt-0.5",
				style: { color: band.color },
				children: band.label
			})]
		})]
	});
}
function MetricStat({ label, value, sub, tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-card/50 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `font-mono text-2xl font-semibold mt-1 ${{
					default: "text-foreground",
					info: "text-info",
					warning: "text-warning",
					critical: "text-critical",
					success: "text-success"
				}[tone]}`,
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] text-muted-foreground mt-0.5",
				children: sub
			})
		]
	});
}
//#endregion
export { RiskGauge as n, MetricStat as t };
