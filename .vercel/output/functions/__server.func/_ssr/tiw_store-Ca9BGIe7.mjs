import { _ as predictImpact, f as incidents_default, u as getEvents } from "./intel-Bd2vThK7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tiw_store-Ca9BGIe7.js
var ASTRA_M = incidents_default;
var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function timeWindowFromEis(p) {
	const raw = 40 * ((.85 + p.confidence / 100 * .6) / ((1 + p.riskScore / 100 * .6) * (1 + clamp(p.delayMinutes, 0, 180) / 240)));
	return clamp(Math.round(raw), 8, 45);
}
function driftSeverityFromAbsError(absErr, meanErr, stdErr) {
	const crit = meanErr + 2 * stdErr;
	const warn = meanErr + 1 * stdErr;
	if (absErr > crit) return "critical";
	if (absErr > warn) return "warning";
	return "warning";
}
function absErrorSummaryFromIncidents(incidents) {
	const errs = [];
	for (const inc of incidents) {
		const predictedDelay = getDelayProxyFromIncidentStart(inc);
		const actualDelay = getDelayProxyFromIncidentClosure(inc);
		errs.push(Math.abs(predictedDelay - actualDelay));
	}
	const meanErr = errs.reduce((a, b) => a + b, 0) / Math.max(1, errs.length);
	const variance = errs.reduce((a, b) => {
		const d = b - meanErr;
		return a + d * d;
	}, 0) / Math.max(1, errs.length);
	return {
		meanError: meanErr,
		stdError: Math.sqrt(variance)
	};
}
function parseIsoToMs(s) {
	if (!s) return void 0;
	const ms = Date.parse(s);
	return Number.isFinite(ms) ? ms : void 0;
}
function getDelayProxyFromIncidentStart(inc) {
	const startMs = parseIsoToMs(inc.start);
	if (!startMs) return 0;
	return Math.floor(startMs / 6e4) % 180 / 2;
}
function getDelayProxyFromIncidentClosure(inc) {
	const idStr = String(inc.id ?? "");
	const startMs = parseIsoToMs(inc.start);
	const base = startMs ? Math.floor(startMs / 6e4) % 180 : 0;
	let h = 0;
	for (let i = 0; i < idStr.length; i++) h = (h * 31 + idStr.charCodeAt(i)) % 101;
	const delta = Boolean(inc.closure) ? 30 : 10;
	return Math.max(0, (base + h + delta) % 180) / 2;
}
function computeObservedDelayFromIncidents(ev, incidents) {
	const evType = ev.kind;
	const evCorridor = ev.corridor ?? ev.name;
	const evLat = ev.lat;
	const evLng = ev.lng;
	const matches = [];
	for (const inc of incidents) {
		const incType = inc.type;
		const incCorridor = inc.corridor;
		if (evType && incType && incType !== evType) continue;
		if (evCorridor && incCorridor && incCorridor !== evCorridor) continue;
		const lat = Number(inc.lat);
		const lng = Number(inc.lng);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
		if (Number.isFinite(evLat) && Number.isFinite(evLng)) {
			const dLat = Math.abs(lat - evLat);
			const dLng = Math.abs(lng - evLng);
			const distProxy = Math.sqrt(dLat * dLat + dLng * dLng);
			if (distProxy > .08) continue;
			const w = 1 / Math.max(.001, distProxy);
			const delay = getDelayProxyFromIncidentClosure(inc);
			matches.push({
				w,
				delay
			});
		}
	}
	if (matches.length === 0) return incidents.reduce((a, inc) => a + getDelayProxyFromIncidentClosure(inc), 0) / Math.max(1, incidents.length);
	const totalW = matches.reduce((a, m) => a + m.w, 0);
	return matches.reduce((a, m) => a + m.w * m.delay, 0) / Math.max(1e-9, totalW);
}
function computeTiw(ev, p, corridors, elapsedMin) {
	const timeWindowMin = timeWindowFromEis(p);
	const remainingMin = clamp(timeWindowMin - elapsedMin, 0, timeWindowMin);
	const { meanError, stdError } = absErrorSummaryFromIncidents(ASTRA_M);
	const predictedDelay = p.delayMinutes;
	const observedDelay = computeObservedDelayFromIncidents(ev, ASTRA_M);
	const absErr = Math.abs(observedDelay - predictedDelay);
	const threshold = meanError + 2 * stdError;
	if (!(remainingMin !== 0 && absErr > threshold)) return {
		eventId: ev.id,
		timeWindowMin,
		remainingMin,
		driftTriggered: false
	};
	const corridorProxy = corridors.slice().sort((a, b) => b.load - a.load).find(Boolean);
	const drift = {
		corridorId: corridorProxy?.id ?? "unknown",
		corridorName: corridorProxy?.name ?? ev.id,
		forecastPeakLoad: predictedDelay,
		actualLoad: observedDelay,
		driftMinutesEarly: 0,
		severity: driftSeverityFromAbsError(absErr, meanError, stdError)
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
