import { o as __toESM } from "../_runtime.mjs";
import { i as require_react, n as QueryClientProvider, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as ThemeProvider } from "./theme-provider-DreZkDIn.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Route$11 } from "./events._eventId-5J5m6qpt.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CCIpUCnZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DV1XU_4B.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-8 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "w-64 h-64",
						viewBox: "0 0 200 200",
						fill: "none",
						xmlns: "http://www.w3.org/2000/svg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "100",
								cy: "100",
								r: "80",
								fill: "var(--primary)",
								fillOpacity: "0.1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "100",
								cy: "100",
								r: "60",
								fill: "var(--primary)",
								fillOpacity: "0.15"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M100 40 L100 100 L140 120",
								stroke: "var(--primary)",
								strokeWidth: "3",
								fill: "none",
								strokeLinecap: "round"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "100",
								cy: "100",
								r: "8",
								fill: "var(--primary)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "140",
								cy: "120",
								r: "5",
								fill: "var(--primary)",
								fillOpacity: "0.6"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M60 140 Q100 180 140 140",
								stroke: "var(--primary)",
								strokeWidth: "2",
								fill: "none",
								strokeDasharray: "5,5",
								opacity: "0.5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: "100",
								y: "75",
								textAnchor: "middle",
								fill: "var(--foreground)",
								fontSize: "48",
								fontWeight: "bold",
								fontFamily: "monospace",
								children: "404"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold text-foreground mb-2",
					children: "Route Not Found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mb-8 max-w-md mx-auto",
					children: "The operational route you're trying to access doesn't exist or has been decommissioned. Let's get you back to command center."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors",
					children: "Return to Command Center"
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong. Try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$10 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "NETHRA — Smart City Traffic OS" },
			{
				name: "description",
				content: "Predict, simulate, plan, deploy and monitor traffic operations end-to-end."
			},
			{
				name: "author",
				content: "NETHRA"
			},
			{
				property: "og:title",
				content: "NETHRA — Smart City Traffic OS"
			},
			{
				property: "og:description",
				content: "An operational decision-making platform for traffic police, planners and emergency response."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "stylesheet",
			href: "https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {})
		] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$10.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, {
			defaultTheme: "dark",
			storageKey: "nethra-ui-theme",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})
	});
}
var $$splitComponentImporter$9 = () => import("./twin-N-3tb5PU.mjs");
var Route$9 = createFileRoute("/twin")({
	head: () => ({
		meta: [
			{ title: "Digital Twin · NETHRA" },
			{
				name: "description",
				content: "Bengaluru digital twin: H3 congestion hexes, 168-hour replay scrubber, live event overlay and landmark intelligence."
			},
			{
				property: "og:title",
				content: "NETHRA Digital Twin · Bengaluru"
			},
			{
				property: "og:description",
				content: "Scrub through a week of city traffic. Watch corridors heat up around live events in real time."
			},
			{
				property: "og:url",
				content: "/twin"
			}
		],
		links: [{
			rel: "canonical",
			href: "/twin"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./strategist-oM4x_Uwb.mjs");
var Route$8 = createFileRoute("/strategist")({
	head: () => ({ meta: [{ title: "AI Strategist · NETHRA" }, {
		name: "description",
		content: "Ask the NETHRA AI Strategist about risks, deployments and operational decisions."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./resources-DgetFpdD.mjs");
var Route$7 = createFileRoute("/resources")({
	head: () => ({ meta: [{ title: "Resource Optimization · NETHRA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./replay-DYFpwQYN.mjs");
var Route$6 = createFileRoute("/replay")({
	head: () => ({ meta: [{ title: "Decision Replay · NETHRA" }, {
		name: "description",
		content: "Replay incident timelines and reconstruct decisions step by step."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./learn-CsAk_KPM.mjs");
var Route$5 = createFileRoute("/learn")({
	head: () => ({ meta: [{ title: "Learning Dashboard · NETHRA" }, {
		name: "description",
		content: "How NETHRA's forecast model improves after every event — accuracy, calibration, drift, and historical performance."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./diversion-CjlxL0xg.mjs");
var Route$4 = createFileRoute("/diversion")({
	head: () => ({ meta: [{ title: "Smart Diversion Planner · NETHRA" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./demo-C1Nry_E1.mjs");
var Route$3 = createFileRoute("/demo")({
	head: () => ({ meta: [{ title: "Live Demo · NETHRA Auto-Pilot" }, {
		name: "description",
		content: "Watch NETHRA run a full operational lifecycle for a major Bengaluru event in 90 seconds — prediction, planning, deployment, and after-action report."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./brief-DAyVK91D.mjs");
var Route$2 = createFileRoute("/brief")({
	head: () => ({ meta: [{ title: "Executive Decision Brief · NETHRA" }, {
		name: "description",
		content: "One-click executive briefing for the Commissioner — event summary, predicted impact, recommended actions, deployment plan, and confidence score."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./routes-xk3hyWzY.mjs");
var Route$1 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "NETHRA — Smart City Traffic OS" },
		{
			name: "description",
			content: "Predict, simulate, plan, deploy and monitor traffic operations for Bengaluru in one operational system."
		},
		{
			property: "og:title",
			content: "NETHRA — Smart City Traffic Operating System"
		},
		{
			property: "og:description",
			content: "An end-to-end decision-making platform for traffic police, planners and emergency response."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./events.new-DBx9DAV5.mjs");
var Route = createFileRoute("/events/new")({
	head: () => ({ meta: [{ title: "Create Event · NETHRA" }, {
		name: "description",
		content: "Create an upcoming traffic event — festival, rally, match, VIP movement, construction — and predict its impact instantly."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var TwinRoute = Route$9.update({
	id: "/twin",
	path: "/twin",
	getParentRoute: () => Route$10
});
var StrategistRoute = Route$8.update({
	id: "/strategist",
	path: "/strategist",
	getParentRoute: () => Route$10
});
var ResourcesRoute = Route$7.update({
	id: "/resources",
	path: "/resources",
	getParentRoute: () => Route$10
});
var ReplayRoute = Route$6.update({
	id: "/replay",
	path: "/replay",
	getParentRoute: () => Route$10
});
var LearnRoute = Route$5.update({
	id: "/learn",
	path: "/learn",
	getParentRoute: () => Route$10
});
var DiversionRoute = Route$4.update({
	id: "/diversion",
	path: "/diversion",
	getParentRoute: () => Route$10
});
var DemoRoute = Route$3.update({
	id: "/demo",
	path: "/demo",
	getParentRoute: () => Route$10
});
var BriefRoute = Route$2.update({
	id: "/brief",
	path: "/brief",
	getParentRoute: () => Route$10
});
var IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$10
});
var EventsNewRoute = Route.update({
	id: "/events/new",
	path: "/events/new",
	getParentRoute: () => Route$10
});
var rootRouteChildren = {
	IndexRoute,
	BriefRoute,
	DemoRoute,
	DiversionRoute,
	LearnRoute,
	ReplayRoute,
	ResourcesRoute,
	StrategistRoute,
	TwinRoute,
	EventsEventIdRoute: Route$11.update({
		id: "/events/$eventId",
		path: "/events/$eventId",
		getParentRoute: () => Route$10
	}),
	EventsNewRoute
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
