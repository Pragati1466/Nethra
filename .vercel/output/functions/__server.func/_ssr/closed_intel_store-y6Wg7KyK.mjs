//#region node_modules/.nitro/vite/services/ssr/assets/closed_intel_store-y6Wg7KyK.js
var listeners = /* @__PURE__ */ new Set();
var latest = null;
function emit() {
	listeners.forEach((fn) => fn());
}
function subscribeClosedIntel(fn) {
	listeners.add(fn);
	return () => {
		listeners.delete(fn);
	};
}
function getLatestClosedIntel() {
	return latest;
}
function setLatestClosedIntel(record) {
	latest = record;
	emit();
}
function deriveCeifromTiwClosure(params) {
	return {
		eventId: params.ev.id,
		forecastDelayMin: params.prediction.delayMinutes,
		timeWindowRemainingMin: params.timeWindowRemainingMin,
		revisedAction: params.revisedActionTitle,
		actualDelayMin: params.actualDelayMin,
		learnedUpdate: params.learnedUpdate
	};
}
//#endregion
export { subscribeClosedIntel as i, getLatestClosedIntel as n, setLatestClosedIntel as r, deriveCeifromTiwClosure as t };
