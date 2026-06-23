import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { P as MapPin, S as Route, dt as ArrowDownRight, f as Sparkles, rt as Brain, st as ArrowUpRight, v as ShieldAlert, z as History } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel } from "./AppShell-DZ395jJC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Explainability-Cp41_M55.js
var import_jsx_runtime = require_jsx_runtime();
var sourceTone = {
	historical: "warning",
	event: "info",
	context: "success",
	model: "muted"
};
function ExplainabilityPanel({ explanation, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Explainable Intelligence",
		subtitle: explanation.headline,
		className,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				tone: "info",
				children: [
					"conf ",
					explanation.confidence,
					"%"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				tone: "muted",
				children: [explanation.evidenceCount, " incidents reviewed"]
			})]
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 text-primary" }), " Because"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5 text-[13px]",
					children: explanation.bullets.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary mt-0.5",
							children: "›"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground/85",
							children: b
						})]
					}, i))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "size-3 text-primary" }), " Top contributing factors"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: explanation.factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorBar, { f }, f.id))
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-3 text-primary" }), " Historical evidence"]
				}), explanation.similar.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5",
					children: explanation.similar.slice(0, 4).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimilarRow, { s }, s.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "No closely matched historical incidents."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 text-primary" }), " Junction DNA"]
				}), explanation.junctionDNA.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
					children: explanation.junctionDNA.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JunctionCard, { j }, j.name))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "No junction-level concentration detected."
				})] })]
			})]
		}), explanation.diversion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiversionRationaleView, { d: explanation.diversion })
		})]
	});
}
function FactorBar({ f }) {
	const Arrow = f.direction === "up" ? ArrowUpRight : ArrowDownRight;
	const color = f.direction === "up" ? "var(--critical)" : "var(--success)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-[13px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrow, {
						className: "size-3.5",
						style: { color }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: f.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: sourceTone[f.source],
						className: "ml-1 !py-0",
						children: f.source
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono text-xs text-muted-foreground",
				children: [f.weight, "%"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 rounded-full bg-muted overflow-hidden mt-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full",
				style: {
					width: `${Math.max(3, f.weight)}%`,
					background: color
				}
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-muted-foreground mt-1 leading-snug",
			children: f.evidence
		})
	] });
}
function SimilarRow({ s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-card/50 p-2.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "capitalize truncate text-[13px]",
				children: s.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				tone: s.match >= 75 ? "warning" : "muted",
				children: [s.match, "% match"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-muted-foreground mt-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"delay ",
					s.delayMin,
					" min"
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["peak risk ", s.riskAtPeak] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [s.distanceKm, " km away"] }),
				s.closure && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-critical",
					children: "closure"
				})
			]
		})]
	});
}
function JunctionCard({ j }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-card/50 p-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[13px] font-medium truncate",
				children: j.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs",
				style: { color: j.riskIndex >= 75 ? "var(--critical)" : j.riskIndex >= 55 ? "var(--warning)" : "var(--info)" },
				children: j.riskIndex
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-[11px] text-muted-foreground mt-1 leading-snug",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "capitalize",
				children: ["Top cause: ", j.topCause]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-mono",
				children: [
					j.incidentCount,
					" incidents · peak ",
					j.peakHour,
					" · closures ",
					(j.closureRate * 100).toFixed(0),
					"%"
				]
			})]
		})]
	});
}
function DiversionRationaleView({ d }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 mb-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-4 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm font-medium",
				children: [
					"Why “",
					d.routeName,
					"” was chosen"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				tone: "success",
				children: ["fit score ", d.score]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-success/30 bg-success/5 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-success mb-1",
					children: "Pros"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: d.pros.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-success",
							children: "+"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground/85",
							children: p
						})]
					}, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-warning/30 bg-warning/5 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-warning mb-1 flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-3" }), " Cons"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: d.cons.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-warning",
							children: "!"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground/85",
							children: p
						})]
					}, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-card/40 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1",
					children: "Alternates rejected"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-1",
					children: [d.rejected.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "×"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-foreground/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: r.name
								}),
								" — ",
								r.reason
							]
						})]
					}, r.id)), !d.rejected.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted-foreground",
						children: "Single viable route generated."
					})]
				})]
			})
		]
	})] });
}
//#endregion
export { ExplainabilityPanel as t };
