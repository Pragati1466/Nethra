import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useTheme } from "./theme-provider-DreZkDIn.mjs";
import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { G as FileText, I as Linkedin, M as Moon, N as Map, Q as CirclePlay, S as Route, T as Radio, V as Github, d as Sun, ft as Activity, g as Shield, i as Users, it as Bot, o as Twitter, ot as ArrowUp, rt as Brain, tt as CalendarPlus, z as History } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-DZ395jJC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function BackToTop() {
	const [isVisible, setIsVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const toggleVisibility = () => {
			if (window.scrollY > 300) setIsVisible(true);
			else setIsVisible(false);
		};
		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: scrollToTop,
		"aria-label": "Back to top",
		className: cn("fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300", "opacity-0 translate-y-4 pointer-events-none", isVisible && "opacity-100 translate-y-0 pointer-events-auto"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-5" })
	});
}
function Footer() {
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border bg-panel/40 backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container mx-auto px-4 py-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-4 gap-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-8 rounded-md bg-primary/15 border border-primary/40 grid place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold tracking-wide text-sm leading-none",
								children: "NETHRA"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] text-muted-foreground font-mono mt-1",
								children: "TRAFFIC OS · v1.0"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground leading-relaxed",
							children: "Predict, simulate, plan, deploy and monitor traffic operations end-to-end."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4",
						children: "Operations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "Command Center"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/twin",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "Digital Twin"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/events/new",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "Create Event"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/strategist",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "AI Strategist"
							}) })
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4",
						children: "Resources"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/learn",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "Learn Loop"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/replay",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "Decision Replay"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/resources",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "Resource Optimization"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/diversion",
								className: "text-sm text-foreground/80 hover:text-primary transition-colors",
								children: "Diversion Planner"
							}) })
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4",
						children: "Connect"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#",
								className: "size-8 rounded-md border border-border bg-card/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-colors",
								"aria-label": "GitHub",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "size-4 text-foreground/80" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#",
								className: "size-8 rounded-md border border-border bg-card/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-colors",
								"aria-label": "Twitter",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Twitter, { className: "size-4 text-foreground/80" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#",
								className: "size-8 rounded-md border border-border bg-card/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-colors",
								"aria-label": "LinkedIn",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Linkedin, { className: "size-4 text-foreground/80" })
							})
						]
					})] })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 pt-8 border-t border-border text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] text-muted-foreground font-mono",
					children: [
						"© ",
						currentYear,
						" NETHRA Traffic OS. All rights reserved. · Bengaluru Metropolitan Region"
					]
				})
			})]
		})
	});
}
var nav = [
	{
		to: "/",
		label: "Command Center",
		icon: Radio,
		end: true
	},
	{
		to: "/twin",
		label: "Digital Twin",
		icon: Map
	},
	{
		to: "/events/new",
		label: "Create Event",
		icon: CalendarPlus
	},
	{
		to: "/diversion",
		label: "Diversion Planner",
		icon: Route
	},
	{
		to: "/resources",
		label: "Resource Optimization",
		icon: Users
	},
	{
		to: "/strategist",
		label: "AI Strategist",
		icon: Bot
	},
	{
		to: "/replay",
		label: "Decision Replay",
		icon: History
	},
	{
		to: "/learn",
		label: "Learn Loop",
		icon: Brain
	},
	{
		to: "/brief",
		label: "Decision Brief",
		icon: FileText
	},
	{
		to: "/demo",
		label: "One-Click Demo",
		icon: CirclePlay
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-panel/80 backdrop-blur",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-5 border-b border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2.5 group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-8 rounded-md bg-primary/15 border border-primary/40 grid place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -right-0.5 -top-0.5 size-2 rounded-full bg-success pulse-dot relative" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold tracking-wide text-sm leading-none",
								children: "👁 NETHRA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] text-muted-foreground font-mono mt-1",
								children: "Eyes on the city"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[9px] text-muted-foreground/70 font-mono",
								children: "TRAFFIC OS · v1.0"
							})
						] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex-1 px-2 py-3 space-y-0.5",
					children: nav.map((n) => {
						const Icon = n.icon;
						const active = n.end ? pathname === n.to : pathname.startsWith(n.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: n.to,
							className: cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", active ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n.label })]
						}, n.to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-3 py-3 border-t border-border text-[11px] font-mono text-muted-foreground space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success" }), " Bengaluru node · online"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Latency 38ms · 8,173 events" })]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 min-w-0",
					children
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackToTop, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
			]
		})]
	});
}
function TopBar() {
	const [now, setNow] = (0, import_react.useState)("--:--:--");
	const { theme, setTheme } = useTheme();
	(0, import_react.useEffect)(() => {
		const tick = () => setNow((/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour12: false }));
		tick();
		const h = setInterval(tick, 1e3);
		return () => clearInterval(h);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "h-12 border-b border-border bg-panel/60 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs font-mono text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-3.5 text-success" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "OPS · BENGALURU" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-border",
					children: "|"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					suppressHydrationWarning: true,
					children: [now, " IST"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ml-auto flex items-center gap-2 text-xs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "success",
					children: "3 events active"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "warning",
					children: "2 alerts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "info",
					children: "12 units deployed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
					className: "p-1.5 rounded-md hover:bg-accent/40 border border-transparent hover:border-border transition-colors",
					"aria-label": "Toggle theme",
					children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4 text-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4 text-foreground" })
				})
			]
		})]
	});
}
function Badge({ tone = "info", children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border font-mono uppercase tracking-wider", {
			info: "bg-info/15 text-info border-info/30",
			success: "bg-success/15 text-success border-success/30",
			warning: "bg-warning/15 text-warning border-warning/30",
			critical: "bg-critical/15 text-critical border-critical/30",
			muted: "bg-muted text-muted-foreground border-border"
		}[tone], className),
		children
	});
}
function Panel({ title, subtitle, action, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-lg border border-border bg-panel/70 backdrop-blur", className),
		children: [(title || action) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between px-4 py-2.5 border-b border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xs font-mono uppercase tracking-wider text-muted-foreground",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-foreground mt-0.5",
				children: subtitle
			})] }), action]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children })]
	});
}
//#endregion
export { cn as i, Badge as n, Panel as r, AppShell as t };
