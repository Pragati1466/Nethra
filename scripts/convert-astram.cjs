const fs = require("fs");
const Papa = require("papaparse");

const csv = fs.readFileSync("src/data/astram.csv", "utf8");

const parsed = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true,
});

const incidents = parsed.data.map((row, index) => ({
  id: row.id || `INC-${index}`,
  type: row.event_type || "",
  cause: row.event_cause || "",
  lat: Number(row.latitude || 0),
  lng: Number(row.longitude || 0),
  corridor: row.corridor || "",
  priority: row.priority || "",
  zone: row.zone || "",
  junction: row.junction || "",
  station: row.police_station || "",
  start: row.start_datetime || "",
  closure:
    String(row.requires_road_closure).toLowerCase() === "true",
}));

fs.writeFileSync(
  "src/data/incidents.json",
  JSON.stringify(incidents, null, 2)
);

console.log(
  `Created incidents.json with ${incidents.length} incidents`
);