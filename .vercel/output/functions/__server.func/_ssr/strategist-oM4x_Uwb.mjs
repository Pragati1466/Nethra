import { o as __toESM } from "../_runtime.mjs";
import { _ as predictImpact, h as nearbyIncidents, n as EVENT_KINDS, r as INCIDENTS, u as getEvents, v as riskBand } from "./intel-Bd2vThK7.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as User, b as Send, f as Sparkles, it as Bot } from "../_libs/lucide-react.mjs";
import { n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as ShareButton } from "./share-button-DU_VuhYu.mjs";
import { t as Skeleton } from "./skeleton-CQ1Suyte.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/strategist-oM4x_Uwb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function answer(q) {
	const ql = q.toLowerCase();
	const events = getEvents();
	if (ql.includes("highest risk") || ql.includes("riskiest") || ql.includes("top risk")) {
		const top = events.map((e) => ({
			e,
			p: predictImpact({
				kind: e.kind,
				lat: e.lat,
				lng: e.lng,
				crowd: e.crowd,
				durationHours: e.durationHours
			})
		})).sort((a, b) => b.p.riskScore - a.p.riskScore)[0];
		if (!top) return {
			role: "assistant",
			text: "No active events in the queue right now."
		};
		return {
			role: "assistant",
			text: `**${top.e.name}** is the highest-risk event right now with a risk score of **${top.p.riskScore}/100** (${riskBand(top.p.riskScore).label}). It will pull ${top.e.crowd.toLocaleString()} people near ${top.e.address}. Expected delay around the perimeter is ~${top.p.delayMinutes} min and the impact radius is ${top.p.impactRadiusKm} km. I recommend pre-staging **${top.p.recommendedOfficers} officers** and **${top.p.recommendedBarricades} barricades**, with diversions through ${top.p.affectedCorridors.slice(0, 2).join(" and ") || "local connectors"}.`,
			cites: top.p.similarIncidents.slice(0, 3).map((s) => s.id)
		};
	}
	for (const k of EVENT_KINDS) if (ql.includes(k.id) || ql.includes(k.label.toLowerCase().split(" ")[0])) {
		const matches = events.filter((e) => e.kind === k.id);
		if (matches.length) {
			const e = matches[0];
			const p = predictImpact({
				kind: e.kind,
				lat: e.lat,
				lng: e.lng,
				crowd: e.crowd,
				durationHours: e.durationHours
			});
			return {
				role: "assistant",
				text: `For **${e.name}** (${k.label}): risk ${p.riskScore}, delay ${p.delayMinutes}min, ${p.recommendedOfficers} officers recommended. Stress corridors: ${p.affectedCorridors.join(", ") || "local"}.`,
				cites: p.similarIncidents.slice(0, 3).map((s) => s.id)
			};
		}
	}
	if (ql.includes("how many") || ql.includes("history") || ql.includes("historical")) return {
		role: "assistant",
		text: `The intelligence layer holds **${INCIDENTS.length.toLocaleString()} historical incidents** across Bengaluru. The most common cause is vehicle breakdown (≈60%), followed by potholes, construction and waterlogging. High-priority events cluster around ORR East, Mysore Road and Bellary Road corridors.`
	};
	if (ql.includes("silk board") || ql.includes("orr") || ql.includes("mysore") || ql.includes("hosur") || ql.includes("tumkur")) {
		const corridor = ql.includes("silk") ? "ORR East 1" : ql.includes("orr") ? "ORR East 1" : ql.includes("mysore") ? "Mysore Road" : ql.includes("hosur") ? "Hosur Road" : "Tumkur Road";
		const hits = INCIDENTS.filter((i) => i.corridor === corridor);
		return {
			role: "assistant",
			text: `**${corridor}** has ${hits.length} historical incidents on record. ${Math.round(hits.filter((h) => h.priority === "High").length / Math.max(1, hits.length) * 100)}% were classified high-priority. Top causes: ${[...new Set(hits.map((h) => h.cause))].slice(0, 3).join(", ")}. I'd keep at least 2 patrol units on standby during peak hours.`,
			cites: hits.slice(0, 3).map((h) => h.id)
		};
	}
	if (ql.includes("deploy") || ql.includes("officer") || ql.includes("resource")) return {
		role: "assistant",
		text: `Across the current queue, optimal deployment is **${events.reduce((s, e) => s + predictImpact({
			kind: e.kind,
			lat: e.lat,
			lng: e.lng,
			crowd: e.crowd,
			durationHours: e.durationHours
		}).recommendedOfficers, 0)} officers** total. Prioritize live events first, then anything in the next 6h window. I can break this down per event — ask "show me deployment for [event name]".`
	};
	const sample = nearbyIncidents(12.97, 77.59, 4).slice(0, 3);
	return {
		role: "assistant",
		text: `I can reason over **${INCIDENTS.length.toLocaleString()}** historical traffic events and the live operational queue. Try asking:\n\n• "What's the highest risk event right now?"\n• "Tell me about Silk Board / ORR / Mysore Road"\n• "How many officers should we deploy today?"\n• "How risky is the cricket match?"`,
		cites: sample.map((s) => s.i.id)
	};
}
function StrategistPage() {
	const [input, setInput] = (0, import_react.useState)("");
	const [msgs, setMsgs] = (0, import_react.useState)([{
		role: "assistant",
		text: "I'm the NETHRA Traffic Strategist. I read every event in the queue and 8,000+ historical incidents. Ask me what to do next."
	}]);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const endRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [msgs]);
	(0, import_react.useEffect)(() => {
		setTimeout(() => setIsLoading(false), 500);
	}, []);
	function send(text) {
		const q = text.trim();
		if (!q) return;
		setMsgs((m) => [...m, {
			role: "user",
			text: q
		}]);
		setInput("");
		setTimeout(() => setMsgs((m) => [...m, answer(q)]), 350);
		toast.success("Message sent", { description: "AI Strategist is analyzing your query." });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4 h-[calc(100vh-3rem)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "col-span-12 flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-mono uppercase tracking-[0.2em] text-primary",
				children: "AI Strategist"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold mt-1",
				children: "Operational reasoning, on demand"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareButton, {})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Conversation",
			className: "col-span-12 lg:col-span-8 flex flex-col min-h-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-auto p-4 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 shrink-0 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3 justify-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 space-y-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2 ml-auto" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 shrink-0 rounded-md" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 shrink-0 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-2/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/3" })]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "flex-1 h-10 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-20 rounded-md" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Suggested questions",
			className: "col-span-12 lg:col-span-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 space-y-2",
				children: [[
					1,
					2,
					3,
					4,
					5
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-md" }, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-3 border-t border-border mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-32 rounded-md" })
				})]
			})
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			title: "Conversation",
			className: "col-span-12 lg:col-span-8 flex flex-col min-h-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-auto p-4 space-y-4",
				children: [msgs.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex gap-3 ${m.role === "user" ? "justify-end" : ""}`,
					children: [
						m.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-8 shrink-0 rounded-md bg-primary/15 border border-primary/30 grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4 text-primary" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed border ${m.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-card/60 border-border"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "whitespace-pre-wrap",
								dangerouslySetInnerHTML: { __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }
							}), m.cites && m.cites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground",
								children: ["cites: ", m.cites.join(" · ")]
							})]
						}),
						m.role === "user" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-8 shrink-0 rounded-md bg-accent border border-border grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" })
						})
					]
				}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					send(input);
				},
				className: "border-t border-border p-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					autoFocus: true,
					value: input,
					onChange: (e) => setInput(e.target.value),
					placeholder: "Ask about risks, deployments, corridors, or specific events…",
					className: "flex-1 rounded-md bg-input/60 border border-border px-3 py-2 text-sm outline-none focus:border-primary/60"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), " Send"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
			title: "Suggested questions",
			className: "col-span-12 lg:col-span-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 space-y-2",
				children: [[
					"What's the highest risk event right now?",
					"How risky is the cricket match?",
					"Tell me about Silk Board congestion history",
					"How many officers should we deploy today?",
					"What's happening on Mysore Road?"
				].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => send(q),
					className: "w-full text-left text-sm rounded-md border border-border bg-card/40 px-3 py-2 hover:border-primary/40 hover:bg-accent/40 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "inline size-3.5 text-primary mr-1.5" }), q]
				}, q)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-3 border-t border-border mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: "info",
						children: [
							"Powered by ",
							INCIDENTS.length.toLocaleString(),
							" incidents"
						]
					})
				})]
			})
		})] })]
	}) });
}
//#endregion
export { StrategistPage as component };
