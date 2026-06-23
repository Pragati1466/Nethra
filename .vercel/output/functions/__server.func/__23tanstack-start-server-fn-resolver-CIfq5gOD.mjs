//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CIfq5gOD.js
var manifest = { "aa8cb64a8346cc1dc6fe8f5c71c06d7809386eee8ce71c102fd133f2722e9113": {
	functionName: "getDiversionRoutes_createServerFn_handler",
	importer: () => import("./_ssr/osrm.functions-C_3slNqx.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
