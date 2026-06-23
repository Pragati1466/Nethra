import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/osrm.functions-CMaIVd9L.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var OSRM = "https://router.project-osrm.org";
var R = 6371;
function offset(lat, lng, bearingDeg, km) {
	const br = bearingDeg * Math.PI / 180;
	const lat1 = lat * Math.PI / 180;
	const lng1 = lng * Math.PI / 180;
	const lat2 = Math.asin(Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(br));
	const lng2 = lng1 + Math.atan2(Math.sin(br) * Math.sin(km / R) * Math.cos(lat1), Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2));
	return [lat2 * 180 / Math.PI, lng2 * 180 / Math.PI];
}
function haversine([la1, ln1], [la2, ln2]) {
	const dLat = (la2 - la1) * Math.PI / 180;
	const dLng = (ln2 - ln1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}
function buildOsrmUrl(coords, opts) {
	const path = coords.map(([la, ln]) => `${ln.toFixed(6)},${la.toFixed(6)}`).join(";");
	const q = new URLSearchParams({
		overview: "full",
		geometries: "geojson",
		steps: opts.steps ? "true" : "false"
	});
	if (opts.alternatives) q.set("alternatives", String(opts.alternatives));
	return `${OSRM}/route/v1/driving/${path}?${q.toString()}`;
}
function humanizeStep(s) {
	const t = s.maneuver?.type ?? "continue";
	const m = s.maneuver?.modifier;
	const road = s.name?.trim() || "road";
	const parts = [];
	switch (t) {
		case "depart":
			parts.push(`Depart on ${road}`);
			break;
		case "arrive":
			parts.push(`Arrive at destination`);
			break;
		case "turn":
			parts.push(`Turn ${m ?? ""} onto ${road}`);
			break;
		case "merge":
			parts.push(`Merge ${m ?? ""} onto ${road}`);
			break;
		case "on ramp":
			parts.push(`Take the ramp ${m ?? ""} onto ${road}`);
			break;
		case "off ramp":
			parts.push(`Take exit ${m ?? ""} toward ${road}`);
			break;
		case "fork":
			parts.push(`Keep ${m ?? "ahead"} at fork onto ${road}`);
			break;
		case "roundabout":
		case "rotary":
			parts.push(`Enter roundabout, exit onto ${road}`);
			break;
		case "end of road":
			parts.push(`At end of road, turn ${m ?? ""} onto ${road}`);
			break;
		default:
			parts.push(`Continue ${m ?? "straight"} on ${road}`);
			break;
	}
	return {
		instruction: parts.join(" ").replace(/\s+/g, " ").trim(),
		distanceM: Math.round(s.distance),
		durationS: Math.round(s.duration),
		name: road,
		modifier: m,
		type: t
	};
}
async function fetchOsrm(url) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 7e3);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: { "User-Agent": "NETHRA/1.0 (traffic-ops)" }
		});
		if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(t);
	}
}
var getDiversionRoutes_createServerFn_handler = createServerRpc({
	id: "aa8cb64a8346cc1dc6fe8f5c71c06d7809386eee8ce71c102fd133f2722e9113",
	name: "getDiversionRoutes",
	filename: "src/lib/osrm.functions.ts"
}, (opts) => getDiversionRoutes.__executeServer(opts));
var getDiversionRoutes = createServerFn({ method: "POST" }).validator((d) => d).handler(getDiversionRoutes_createServerFn_handler, async ({ data }) => {
	const { lat, lng, impactRadiusKm = 1.5, bearingDeg = 35 } = data;
	const spread = Math.max(3, impactRadiusKm * 2.5);
	const origin = offset(lat, lng, (bearingDeg + 180) % 360, spread);
	const dest = offset(lat, lng, bearingDeg, spread);
	try {
		const [baseRes, altRes] = await Promise.all([fetchOsrm(buildOsrmUrl([
			origin,
			[lat, lng],
			dest
		], { steps: false })), fetchOsrm(buildOsrmUrl([origin, dest], {
			alternatives: 3,
			steps: true
		}))]);
		if (baseRes.code !== "Ok" || !baseRes.routes?.length) throw new Error(`OSRM baseline: ${baseRes.message ?? baseRes.code}`);
		if (altRes.code !== "Ok" || !altRes.routes?.length) throw new Error(`OSRM alternates: ${altRes.message ?? altRes.code}`);
		const baselineDurMin = baseRes.routes[0].duration / 60;
		const baselineKm = baseRes.routes[0].distance / 1e3;
		const palette = [
			"North bypass",
			"South arterial",
			"East ring loop",
			"Inner ring shortcut"
		];
		const routes = altRes.routes.slice(0, 3).map((r, idx) => {
			const geometry = r.geometry.coordinates.map(([ln, la]) => [la, ln]);
			let minD = Infinity;
			for (const pt of geometry) {
				const d = haversine(pt, [lat, lng]);
				if (d < minD) minD = d;
			}
			const durationMin = r.duration / 60;
			const distanceKm = r.distance / 1e3;
			const extraMinutes = Math.max(0, Math.round(durationMin - baselineDurMin));
			const clearance = Math.max(0, minD - impactRadiusKm * .4);
			const congestionReductionPct = Math.round(Math.max(0, Math.min(95, clearance / (impactRadiusKm * 1.6) * 95)));
			const stepsRaw = r.legs?.flatMap((l) => l.steps ?? []) ?? [];
			const avgEdgeM = stepsRaw.length ? r.distance / stepsRaw.length : 250;
			const capacityPct = Math.max(35, Math.min(95, Math.round(40 + avgEdgeM / 12)));
			const steps = stepsRaw.map(humanizeStep).filter((s) => s.distanceM > 5 || s.type === "arrive");
			return {
				id: `OSRM-${idx + 1}`,
				name: palette[idx] ?? `Alternate ${idx + 1}`,
				recommended: false,
				geometry,
				distanceKm: +distanceKm.toFixed(2),
				durationMin: +durationMin.toFixed(1),
				extraMinutes,
				congestionReductionPct,
				capacityPct,
				minDistanceFromIncidentKm: +minD.toFixed(2),
				steps
			};
		});
		const scored = routes.map((r) => ({
			r,
			s: r.congestionReductionPct * .6 + r.capacityPct * .4 - r.extraMinutes * 1.2
		}));
		scored.sort((a, b) => b.s - a.s);
		if (scored[0]) scored[0].r.recommended = true;
		return {
			ok: true,
			source: "osrm",
			baseline: {
				distanceKm: +baselineKm.toFixed(2),
				durationMin: +baselineDurMin.toFixed(1)
			},
			routes
		};
	} catch (e) {
		return {
			ok: false,
			source: "fallback",
			routes: [
				{
					name: "North bypass",
					bearing: bearingDeg + 90
				},
				{
					name: "South arterial",
					bearing: bearingDeg - 90
				},
				{
					name: "East ring loop",
					bearing: bearingDeg + 45
				}
			].map((v, idx) => {
				const r = Math.max(1.8, impactRadiusKm + .6);
				const geometry = [
					origin,
					offset(lat, lng, v.bearing - 25, r),
					offset(lat, lng, v.bearing, r * 1.4),
					offset(lat, lng, v.bearing + 25, r),
					dest
				];
				const dist = geometry.slice(1).reduce((acc, p, i) => acc + haversine(geometry[i], p), 0);
				const dur = dist * 2.4;
				return {
					id: `FALLBACK-${idx + 1}`,
					name: v.name,
					recommended: idx === 0,
					geometry,
					distanceKm: +dist.toFixed(2),
					durationMin: +dur.toFixed(1),
					extraMinutes: 4 + idx * 3,
					congestionReductionPct: 80 - idx * 15,
					capacityPct: 78 - idx * 10,
					minDistanceFromIncidentKm: +(r * .9).toFixed(2),
					steps: [
						{
							instruction: `Depart staging point on ${v.name}`,
							distanceM: 800,
							durationS: 120,
							name: v.name
						},
						{
							instruction: `Continue around the impact zone`,
							distanceM: Math.round(dist * 600),
							durationS: Math.round(dur * 36),
							name: v.name
						},
						{
							instruction: `Arrive at destination`,
							distanceM: 0,
							durationS: 0,
							name: "destination",
							type: "arrive"
						}
					]
				};
			}),
			error: e instanceof Error ? e.message : "OSRM unreachable"
		};
	}
});
//#endregion
export { getDiversionRoutes_createServerFn_handler };
