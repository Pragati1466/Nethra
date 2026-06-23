// Precompute H3 hex aggregation of historical incidents x hour-of-week.
// Spreads each incident across its k-ring 2 neighborhood with a falloff so the
// resulting heatmap reads as continuous congestion, not isolated pixels.
import { readFileSync, writeFileSync } from "node:fs";
import { latLngToCell, cellToLatLng, gridDisk } from "h3-js";

const RES = 8;
const KRING = 2;          // hops of spread
const FALLOFF = [1.0, 0.55, 0.25]; // self, 1-ring, 2-ring weights

const incidents = JSON.parse(readFileSync("src/data/incidents.json", "utf8"));

const cells = new Map();
let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;

function ensureCell(h) {
  let c = cells.get(h);
  if (!c) {
    const [clat, clng] = cellToLatLng(h);
    c = { h, lat: clat, lng: clng, total: 0, hourly: new Array(168).fill(0), corridorCounts: new Map() };
    cells.set(h, c);
  }
  return c;
}

for (const inc of incidents) {
  if (typeof inc.lat !== "number" || typeof inc.lng !== "number") continue;
  if (inc.lat < 12.7 || inc.lat > 13.25 || inc.lng < 77.35 || inc.lng > 77.85) continue;
  minLat = Math.min(minLat, inc.lat); maxLat = Math.max(maxLat, inc.lat);
  minLng = Math.min(minLng, inc.lng); maxLng = Math.max(maxLng, inc.lng);

  const home = latLngToCell(inc.lat, inc.lng, RES);
  const d = new Date(inc.start);
  const validTime = !isNaN(d.getTime());
  const bucket = validTime ? d.getUTCDay() * 24 + d.getUTCHours() : -1;

  // Spread to neighbors with falloff
  for (let k = 0; k <= KRING; k++) {
    const ring = k === 0 ? [home] : gridDisk(home, k).filter((x) => gridDisk(home, k - 1).indexOf(x) === -1);
    const w = FALLOFF[k];
    for (const h of ring) {
      const c = ensureCell(h);
      c.total += w;
      if (bucket >= 0) c.hourly[bucket] += w;
      if (k === 0 && inc.corridor && inc.corridor !== "NULL") {
        c.corridorCounts.set(inc.corridor, (c.corridorCounts.get(inc.corridor) || 0) + 1);
      }
    }
  }
}

// Round for compactness
const out = {
  res: RES,
  bbox: { minLat, maxLat, minLng, maxLng },
  generatedAt: new Date().toISOString(),
  cells: [...cells.values()].map((c) => ({
    h: c.h, lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5),
    total: +c.total.toFixed(2),
    hourly: c.hourly.map((x) => +x.toFixed(2)),
    corridors: [...c.corridorCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k),
  })),
};

writeFileSync("src/data/hexgrid.json", JSON.stringify(out));
console.log(`hexgrid: ${out.cells.length} cells, total mass ${out.cells.reduce((s,c)=>s+c.total,0).toFixed(0)}`);
