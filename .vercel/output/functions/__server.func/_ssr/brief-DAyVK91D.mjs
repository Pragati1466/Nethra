import { o as __toESM } from "../_runtime.mjs";
import { _ as predictImpact, n as EVENT_KINDS, s as diversionRoutesFor, u as getEvents, v as riskBand } from "./intel-Bd2vThK7.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { $ as CircleCheck, D as Printer, G as FileText, f as Sparkles, g as Shield, q as Download } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brief-DAyVK91D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = require_jspdf_node_min();
function buildBrief(ev) {
	const prediction = predictImpact(ev);
	const routes = diversionRoutesFor(ev, prediction);
	const diversion = routes.find((r) => r.recommended) ?? routes[0];
	const band = riskBand(prediction.riskScore);
	const kindLabel = EVENT_KINDS.find((k) => k.id === ev.kind)?.label ?? ev.kind;
	const recommendations = [
		`Activate Command Post at ${ev.address.split(",")[0]} T-90 minutes prior to event start.`,
		`Deploy ${prediction.recommendedOfficers} traffic officers across ${prediction.affectedJunctions.length} key junctions.`,
		`Pre-position ${prediction.recommendedBarricades} barricades along ${prediction.affectedCorridors[0] ?? "primary corridor"}.`,
		`Issue public advisory via BTP Twitter, FM radio, and Namma Metro PIS — 6 hours pre-event.`,
		`Coordinate with ${prediction.affectedStations[0] ?? "local"} Police Station for crowd management standby.`,
		`Activate diversion plan "${diversion.name}" upon hitting ${Math.round(prediction.riskScore * .7)}% saturation.`
	];
	const deployment = [
		{
			unit: "Traffic Police",
			count: prediction.recommendedOfficers,
			role: "Junction control & flow management",
			eta: "T-90 min"
		},
		{
			unit: "Hoysala Patrol",
			count: Math.max(3, Math.round(prediction.recommendedOfficers / 4)),
			role: "Mobile response & escort",
			eta: "T-60 min"
		},
		{
			unit: "Barricade Units",
			count: prediction.recommendedBarricades,
			role: "Crowd channelling & lane closure",
			eta: "T-120 min"
		},
		{
			unit: "Tow / Crane",
			count: 2,
			role: "Stranded vehicle removal",
			eta: "On standby"
		},
		{
			unit: "Medical Standby",
			count: 1,
			role: "Ambulance + paramedics",
			eta: "T-30 min"
		},
		{
			unit: "CCTV Operators",
			count: 2,
			role: "Corridor surveillance from CCC",
			eta: "T-90 min"
		}
	];
	const expectedOutcome = [
		`Average corridor delay contained to ≤ ${prediction.delayMinutes} minutes (vs ${Math.round(prediction.delayMinutes * 1.8)} min unmanaged baseline).`,
		`Diversion route "${diversion.name}" absorbs ~${diversion.capacityPct}% of displaced traffic with +${diversion.extraMinutes} min travel time.`,
		`Impact contained within ${prediction.impactRadiusKm} km radius — ${prediction.affectedCorridors.length} corridors actively managed.`,
		`Probability of cascade into adjacent zones reduced from 38% (no action) to ${Math.max(4, 100 - prediction.confidence)}%.`,
		`Estimated economic impact mitigation: ₹${(prediction.delayMinutes * prediction.recommendedOfficers * 1.4).toFixed(1)} lakh in productive hours saved.`
	];
	return {
		ref: `NTH/BRF/${(/* @__PURE__ */ new Date()).getFullYear()}/${ev.id.replace("EVT-", "")}`,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		event: ev,
		kindLabel,
		prediction,
		diversion,
		band,
		recommendations,
		deployment,
		expectedOutcome
	};
}
function BriefPage() {
	const events = getEvents();
	const [selectedId, setSelectedId] = (0, import_react.useState)(events[0]?.id ?? "");
	const [brief, setBrief] = (0, import_react.useState)(null);
	const [generating, setGenerating] = (0, import_react.useState)(false);
	const selected = (0, import_react.useMemo)(() => events.find((e) => e.id === selectedId), [events, selectedId]);
	const handleGenerate = () => {
		if (!selected) return;
		setGenerating(true);
		setTimeout(() => {
			setBrief(buildBrief(selected));
			setGenerating(false);
		}, 600);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-5 max-w-[1400px] mx-auto print:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between mb-5 gap-4 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-xl font-semibold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-primary" }), "Executive Decision Brief Generator"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "One-click briefing in the format the Commissioner's office receives. PDF, print, or on-screen."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "info",
				children: "Commissioner Briefing Format · BTP-EDB-v2"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Generate Brief",
			subtitle: "Select an event and synthesize a decision-ready report",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 flex flex-wrap items-end gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-[280px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-[11px] font-mono uppercase tracking-wider text-muted-foreground",
							children: "Event"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: selectedId,
							onChange: (e) => setSelectedId(e.target.value),
							className: "mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm",
							children: events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: e.id,
								children: [
									e.id,
									" · ",
									e.name,
									" (",
									e.status,
									")"
								]
							}, e.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleGenerate,
						disabled: !selected || generating,
						className: "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), generating ? "Synthesizing…" : "Generate Brief"]
					}),
					brief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => window.print(),
						className: "inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-accent/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" }), " Print"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => downloadPdf(brief),
						className: "inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-accent/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download PDF"]
					})] })
				]
			})
		})]
	}), brief ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-6 pb-10 print:p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefDocument, { brief })
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-6 pb-10 print:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-[900px] mx-auto border border-dashed border-border rounded-lg p-10 text-center text-sm text-muted-foreground",
			children: [
				"Select an event and press ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground font-medium",
					children: "Generate Brief"
				}),
				" to produce a Commissioner-ready report."
			]
		})
	})] });
}
function BriefDocument({ brief }) {
	const { event: ev, prediction: p, diversion: d, band } = brief;
	const startDate = new Date(ev.startsAt);
	const fmtDate = startDate.toLocaleString("en-IN", {
		dateStyle: "full",
		timeStyle: "short"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		id: "brief-doc",
		className: "mx-auto bg-white text-neutral-900 shadow-xl print:shadow-none",
		style: {
			width: "210mm",
			minHeight: "297mm",
			padding: "18mm 16mm",
			fontFamily: "Georgia, 'Times New Roman', serif"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b-2 border-neutral-900 pb-3 mb-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-12 rounded-full border-2 border-neutral-900 grid place-items-center bg-neutral-900 text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-6" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-[0.2em] text-neutral-600",
								children: "Government of Karnataka"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg font-bold leading-tight",
								children: "Bengaluru Traffic Police"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-neutral-700 italic",
								children: "Office of the Commissioner · NETHRA Decision Support"
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right text-[10px] font-mono uppercase tracking-wider text-neutral-600",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Ref: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-neutral-900",
								children: brief.ref
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Issued: ", new Date(brief.generatedAt).toLocaleString("en-IN")] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Classification: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-red-700",
								children: "RESTRICTED"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-[0.3em] text-neutral-500",
						children: "Executive Decision Brief"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold mt-1",
						children: ev.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11px] text-neutral-600 mt-1",
						children: [
							"For the attention of: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "The Commissioner of Police (Traffic)"
							}),
							" · From: NETHRA Operations Cell"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-4 gap-2 mb-5 text-[10px] font-mono uppercase",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "Event ID",
						value: ev.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "Category",
						value: brief.kindLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "Scheduled",
						value: startDate.toLocaleDateString("en-IN")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "Status",
						value: ev.status
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				number: "1",
				title: "Event Summary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[12px] leading-relaxed",
					children: [
						"A ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: brief.kindLabel.toLowerCase() }),
						" is scheduled at ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ev.address }),
						" on",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: fmtDate }),
						", with an expected footfall of",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ev.crowd.toLocaleString("en-IN") }),
						" persons over a duration of",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [ev.durationHours, " hours"] }),
						". The location lies in a historically",
						" ",
						p.similarIncidents.length > 5 ? "high-incident" : "moderate-incident",
						" corridor with",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.similarIncidents.length }),
						" comparable past events on record."
					]
				}), ev.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[12px] mt-2 italic text-neutral-700",
					children: ["Note: ", ev.notes]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				number: "2",
				title: "Predicted Impact",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-4 gap-2 mb-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
								label: "Event Impact Score (EIS)",
								value: `${p.riskScore}`,
								sub: band.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
								label: "Confidence",
								value: `${p.confidence}%`,
								sub: "Model certainty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
								label: "Avg Delay",
								value: `${p.delayMinutes} min`,
								sub: "Per corridor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
								label: "Impact Radius",
								value: `${p.impactRadiusKm} km`,
								sub: "From epicentre"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[12px] leading-relaxed",
						children: [
							"Pressure is expected on",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.affectedCorridors.join(", ") || "local arterial network" }),
							" ",
							"with cascading effects on junctions:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.affectedJunctions.join(", ") || "—" }),
							". Nearest response stations: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.affectedStations.join(", ") || "—" }),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "text-[11px] mt-2 space-y-1 list-disc pl-5 text-neutral-700",
						children: p.reasoning.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, i))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				number: "3",
				title: "Recommended Actions",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "text-[12px] space-y-1.5 list-decimal pl-5",
					children: brief.recommendations.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, i))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				number: "4",
				title: "Deployment Plan",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-[11px] border-collapse",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-neutral-900 text-white text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-semibold",
								children: "Unit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-semibold w-16 text-right",
								children: "Count"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-semibold",
								children: "Role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-semibold w-24",
								children: "Deploy By"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [brief.deployment.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: i % 2 ? "bg-neutral-50" : "",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 border-b border-neutral-200 font-medium",
								children: d.unit
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 border-b border-neutral-200 text-right font-mono",
								children: d.count
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 border-b border-neutral-200 text-neutral-700",
								children: d.role
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 border-b border-neutral-200 font-mono",
								children: d.eta
							})
						]
					}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-neutral-100 font-semibold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5",
								children: "Total Personnel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5 text-right font-mono",
								children: brief.deployment.reduce((s, d) => s + d.count, 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-1.5",
								colSpan: 2,
								children: "Coordinated through NETHRA Command & Control Centre"
							})
						]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				number: "5",
				title: "Diversion Strategy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-neutral-300 rounded p-3 bg-neutral-50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between mb-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-semibold text-[13px]",
							children: ["Primary Route: ", d.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] font-mono uppercase text-neutral-600",
							children: ["Route ID: ", d.id]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2 text-[11px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neutral-500",
									children: "Extra travel time:"
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
									"+",
									d.extraMinutes,
									" min"
								] })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neutral-500",
									children: "Capacity absorbed:"
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [d.capacityPct, "%"] })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-neutral-500",
									children: "Coverage:"
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: d.coverage.join(" · ") })
							] })
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "text-[11px] mt-2 space-y-1 list-disc pl-5 text-neutral-700",
					children: p.diversions.map((dv, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Divert traffic from ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: dv.from }),
						" → ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: dv.to }),
						" via ",
						dv.via,
						"."
					] }, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
					number: "6",
					title: "Confidence Score"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-neutral-300 rounded p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-3xl font-bold leading-none",
							children: [p.confidence, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider text-neutral-500 mt-1",
							children: "Model Certainty"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 h-2 bg-neutral-200 rounded overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-neutral-900",
								style: { width: `${p.confidence}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] text-neutral-600 mt-2 leading-snug",
							children: [
								"Derived from ",
								p.similarIncidents.length,
								" comparable historical incidents within 3 km; model version ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono",
									children: "nethra-forecast-v1"
								}),
								"."
							]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
					number: "7",
					title: "Expected Outcome"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "text-[11px] space-y-1.5 list-none",
					children: brief.expectedOutcome.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 shrink-0 mt-0.5 text-green-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: o })]
					}, i))
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 pt-4 border-t border-neutral-400 grid grid-cols-2 gap-8 text-[11px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 border-b border-neutral-700" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-semibold",
						children: "Prepared by"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-neutral-600",
						children: "NETHRA Operations Cell · Decision Support"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 border-b border-neutral-700" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-semibold",
						children: "Approved by"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-neutral-600",
						children: "Commissioner of Police (Traffic)"
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-6 pt-2 border-t border-neutral-300 flex justify-between text-[9px] font-mono uppercase text-neutral-500",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NETHRA · Traffic OS · Bengaluru" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: brief.ref }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Page 1 of 1 · Restricted" })
				]
			})
		]
	});
}
function Section({ number, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
			number,
			title
		}), children]
	});
}
function SectionHead({ number, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
		className: "text-[12px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-1 mb-2 flex items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono opacity-70",
				children: [number, "."]
			}),
			" ",
			title
		]
	});
}
function Cell({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-neutral-300 px-2 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[8px] text-neutral-500 tracking-wider",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] font-semibold text-neutral-900 truncate",
			children: value
		})]
	});
}
function KPI({ label, value, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-neutral-400 px-2 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[9px] uppercase tracking-wider text-neutral-500",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-lg font-bold leading-tight mt-0.5",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[9px] text-neutral-600",
				children: sub
			})
		]
	});
}
function downloadPdf(brief) {
	const doc = new import_jspdf_node_min.jsPDF({
		unit: "mm",
		format: "a4"
	});
	const W = 210;
	const M = 16;
	let y = 18;
	const { event: ev, prediction: p, diversion: d, band } = brief;
	doc.setFillColor(20, 20, 20);
	doc.rect(0, 0, W, 8, "F");
	doc.setTextColor(255);
	doc.setFontSize(8);
	doc.setFont("helvetica", "bold");
	doc.text("BENGALURU TRAFFIC POLICE · NETHRA DECISION SUPPORT", M, 5.5);
	doc.text("RESTRICTED", W - M, 5.5, { align: "right" });
	doc.setTextColor(0);
	doc.setFont("times", "bold");
	doc.setFontSize(16);
	doc.text("Executive Decision Brief", W / 2, y, { align: "center" });
	y += 6;
	doc.setFont("times", "italic");
	doc.setFontSize(10);
	doc.text(`For the Commissioner of Police (Traffic)`, W / 2, y, { align: "center" });
	y += 8;
	doc.setDrawColor(0);
	doc.setLineWidth(.3);
	doc.line(M, y, W - M, y);
	y += 4;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.text(`Ref: ${brief.ref}`, M, y);
	doc.text(`Issued: ${new Date(brief.generatedAt).toLocaleString("en-IN")}`, W - M, y, { align: "right" });
	y += 5;
	doc.line(M, y, W - M, y);
	y += 6;
	doc.setFont("times", "bold");
	doc.setFontSize(14);
	doc.text(ev.name, M, y);
	y += 5;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	doc.text(`${brief.kindLabel} · ${ev.address}`, M, y);
	y += 4;
	doc.text(`${new Date(ev.startsAt).toLocaleString("en-IN")} · Crowd: ${ev.crowd.toLocaleString("en-IN")} · Duration: ${ev.durationHours}h`, M, y);
	y += 7;
	const heading = (n, t) => {
		if (y > 270) {
			doc.addPage();
			y = 18;
		}
		doc.setFillColor(20, 20, 20);
		doc.rect(M, y - 4, W - M * 2, 6, "F");
		doc.setTextColor(255);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(9);
		doc.text(`${n}.  ${t.toUpperCase()}`, 18, y);
		doc.setTextColor(0);
		y += 5;
	};
	const para = (text) => {
		doc.setFont("times", "normal");
		doc.setFontSize(10);
		const lines = doc.splitTextToSize(text, W - M * 2);
		for (const line of lines) {
			if (y > 282) {
				doc.addPage();
				y = 18;
			}
			doc.text(line, M, y);
			y += 4.5;
		}
	};
	const bullets = (items) => {
		doc.setFont("times", "normal");
		doc.setFontSize(10);
		items.forEach((it, i) => {
			const lines = doc.splitTextToSize(`${i + 1}. ${it}`, W - M * 2 - 4);
			for (const line of lines) {
				if (y > 282) {
					doc.addPage();
					y = 18;
				}
				doc.text(line, 18, y);
				y += 4.5;
			}
		});
	};
	heading("1", "Event Summary");
	para(`A ${brief.kindLabel.toLowerCase()} is scheduled at ${ev.address} on ${new Date(ev.startsAt).toLocaleString("en-IN")}, with an expected footfall of ${ev.crowd.toLocaleString("en-IN")} persons over ${ev.durationHours} hours. The location records ${p.similarIncidents.length} comparable historical incidents within 3 km.`);
	y += 2;
	heading("2", "Predicted Impact");
	para(`Risk Score: ${p.riskScore}/100 (${band.label}) · Confidence: ${p.confidence}% · Avg Delay: ${p.delayMinutes} min · Impact Radius: ${p.impactRadiusKm} km.`);
	para(`Pressure expected on: ${p.affectedCorridors.join(", ") || "local arterials"}. Critical junctions: ${p.affectedJunctions.join(", ") || "—"}.`);
	y += 2;
	heading("3", "Recommended Actions");
	bullets(brief.recommendations);
	y += 2;
	heading("4", "Deployment Plan");
	doc.setFont("helvetica", "bold");
	doc.setFontSize(9);
	doc.setFillColor(230, 230, 230);
	doc.rect(M, y - 4, W - M * 2, 5.5, "F");
	doc.text("Unit", 18, y);
	doc.text("Count", 86, y);
	doc.text("Role", 106, y);
	doc.text("Deploy By", W - M - 22, y);
	y += 3;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(9);
	for (const r of brief.deployment) {
		if (y > 278) {
			doc.addPage();
			y = 18;
		}
		y += 4;
		doc.text(r.unit, 18, y);
		doc.text(String(r.count), 86, y);
		const roleLines = doc.splitTextToSize(r.role, 70);
		doc.text(roleLines[0], 106, y);
		doc.text(r.eta, W - M - 22, y);
		doc.setDrawColor(220);
		doc.line(M, y + 1.5, W - M, y + 1.5);
	}
	y += 6;
	heading("5", "Diversion Strategy");
	para(`Primary route: ${d.name} (${d.id}) — adds +${d.extraMinutes} min travel time, absorbs ~${d.capacityPct}% of displaced traffic. Coverage: ${d.coverage.join(" · ")}.`);
	bullets(p.diversions.map((x) => `Divert ${x.from} → ${x.to} via ${x.via}.`));
	y += 2;
	heading("6", "Confidence Score");
	doc.setFont("times", "bold");
	doc.setFontSize(22);
	doc.text(`${p.confidence}%`, M, y + 4);
	doc.setFont("times", "normal");
	doc.setFontSize(9);
	doc.text(`Model: nethra-forecast-v1 · Basis: ${p.similarIncidents.length} comparable incidents within 3 km.`, 44, y + 4);
	y += 10;
	heading("7", "Expected Outcome");
	bullets(brief.expectedOutcome);
	y += 4;
	if (y > 250) {
		doc.addPage();
		y = 30;
	}
	y = Math.max(y, 250);
	doc.setDrawColor(0);
	doc.line(M, y, 86, y);
	doc.line(W - M - 70, y, W - M, y);
	y += 4;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(9);
	doc.text("Prepared by", M, y);
	doc.text("Approved by", W - M - 70, y);
	y += 4;
	doc.setFont("helvetica", "normal");
	doc.text("NETHRA Operations Cell", M, y);
	doc.text("Commissioner of Police (Traffic)", W - M - 70, y);
	const pageCount = doc.getNumberOfPages();
	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		doc.setFontSize(7);
		doc.setTextColor(120);
		doc.text(`${brief.ref} · NETHRA · Restricted`, M, 292);
		doc.text(`Page ${i} of ${pageCount}`, W - M, 292, { align: "right" });
	}
	doc.save(`${brief.ref.replace(/\//g, "_")}.pdf`);
}
//#endregion
export { BriefPage as component };
