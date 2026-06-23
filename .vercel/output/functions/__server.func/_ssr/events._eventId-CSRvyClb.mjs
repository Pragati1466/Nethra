import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppShell } from "./AppShell-DZ395jJC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events._eventId-CSRvyClb.js
var import_jsx_runtime = require_jsx_runtime();
var SplitNotFoundComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "p-10 text-center text-muted-foreground",
	children: ["Event not found. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		className: "text-primary",
		children: "Back to ops"
	})]
}) });
//#endregion
export { SplitNotFoundComponent as notFoundComponent };
