import { g as predictImpact, u as getEvents } from "./intel-BKuSbRxh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tiw_store-CTlgkrTD.js
var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function forecastPeakLoadFromEis(p) {
	const base = 35 + p.riskScore * .45;
	const delayBump = clamp(p.delayMinutes, 0, 120) * .15;
	return clamp(Math.round(base + delayBump), 30, 95);
}
function timeWindowFromEis(p) {
	const raw = 40 * ((.85 + p.confidence / 100 * .6) / ((1 + p.riskScore / 100 * .6) * (1 + clamp(p.delayMinutes, 0, 180) / 240)));
	return clamp(Math.round(raw), 8, 45);
}
function driftSeverity(actual, forecastPeak) {
	const ratio = actual / Math.max(1, forecastPeak);
	if (ratio >= 1.18) return "critical";
	if (ratio >= 1.08) return "warning";
	return "warning";
}
function computeTiw(ev, p, corridors, elapsedMin) {
	const timeWindowMin = timeWindowFromEis(p);
	const remainingMin = clamp(timeWindowMin - elapsedMin, 0, timeWindowMin);
	const forecastPeakLoad = forecastPeakLoadFromEis(p);
	const worst = corridors.slice().sort((a, b) => b.load - a.load).find(Boolean);
	if (!worst) return {
		eventId: ev.id,
		timeWindowMin,
		remainingMin,
		driftTriggered: false
	};
	const actualLoad = worst.load;
	const exceedRatio = (actualLoad - forecastPeakLoad) / Math.max(1, forecastPeakLoad);
	const driftMinutesEarly = clamp(Math.round(exceedRatio * 35), 0, timeWindowMin);
	if (!(remainingMin === 0 ? false : actualLoad >= forecastPeakLoad && driftMinutesEarly >= Math.round(timeWindowMin * .25))) return {
		eventId: ev.id,
		timeWindowMin,
		remainingMin,
		driftTriggered: false
	};
	const severity = driftSeverity(actualLoad, forecastPeakLoad);
	const drift = {
		corridorId: worst.id,
		corridorName: worst.name,
		forecastPeakLoad,
		actualLoad,
		driftMinutesEarly,
		severity
	};
	const revisedAction = suggestRevisedAction(ev, p, drift, remainingMin);
	return {
		eventId: ev.id,
		timeWindowMin,
		remainingMin,
		driftTriggered: true,
		drift,
		revisedAction
	};
}
function suggestRevisedAction(ev, p, drift, remainingMin) {
	const id = `TW-${ev.id}-${drift.corridorId}`;
	const reviseAfterMin = Math.max(2, Math.round(remainingMin * .45));
	const baseSteps = [
		`Pull forward diversion activation by ~${Math.max(10, Math.round(p.delayMinutes * .15))} minutes for the impacted corridors.`,
		`Add ${Math.max(2, Math.round(p.recommendedOfficers * .15))} traffic officers as floating reserve at lead junctions (${p.affectedJunctions.slice(0, 2).join(", ") || "primary junctions"}).`,
		`Pre-stage ${Math.max(1, Math.round(p.recommendedBarricades * .12))} barricades at chokepoints aligned to the diversion plan.`
	];
	const severityStep = drift.severity === "critical" ? [`Escalate to command center immediately; reserve an emergency access lane through the high-load corridor (${drift.corridorName}).`] : [`Notify command center; tighten monitoring cadence on ${drift.corridorName}.`];
	return {
		id,
		title: `FORECAST DEVIATION DETECTED @ ${drift.corridorName}`,
		reviseAfterMin,
		steps: [...baseSteps, ...severityStep]
	};
}
var listeners = /* @__PURE__ */ new Set();
var stateByEventId = /* @__PURE__ */ new Map();
function emit() {
	listeners.forEach((fn) => fn());
}
function subscribeTiw(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
function getTiwForEvent(eventId) {
	return stateByEventId.get(eventId);
}
function getAllTiw() {
	return [...stateByEventId.values()];
}
function updateTiwFromPulse(pulse) {
	const liveCandidates = getEvents().filter((e) => e.status === "deployed" || e.status === "live");
	const next = /* @__PURE__ */ new Map();
	for (const ev of liveCandidates) {
		const prediction = predictImpact({
			kind: ev.kind,
			lat: ev.lat,
			lng: ev.lng,
			crowd: ev.crowd,
			durationHours: ev.durationHours
		});
		const elapsedMin = pulse.tick;
		const tw = computeTiw(ev, prediction, pulse.corridors, elapsedMin);
		next.set(ev.id, tw);
	}
	stateByEventId = next;
	emit();
}
//#endregion
export { updateTiwFromPulse as i, getTiwForEvent as n, subscribeTiw as r, getAllTiw as t };
