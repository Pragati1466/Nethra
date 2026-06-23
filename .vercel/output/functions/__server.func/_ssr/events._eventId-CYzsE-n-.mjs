import { l as getEvent } from "./intel-BKuSbRxh.mjs";
import { P as notFound, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events._eventId-CYzsE-n-.js
var $$splitNotFoundComponentImporter = () => import("./events._eventId-CSRvyClb.mjs");
var $$splitComponentImporter = () => import("./events._eventId-D6iaGiK7.mjs");
var Route = createFileRoute("/events/$eventId")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	loader: ({ params }) => {
		if (!getEvent(params.eventId)) throw notFound();
		return null;
	}
});
//#endregion
export { Route as t };
