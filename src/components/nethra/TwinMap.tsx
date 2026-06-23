import { useEffect, useRef, useState } from "react";
import { cellIntensity } from "@/lib/timefield";
import { LANDMARKS } from "@/data/landmarks";
import { HEX_CELLS } from "@/data/hexgrid";
import type { PlannedEvent } from "@/lib/intel";
import { predictImpact, riskBand } from "@/lib/intel";
import { Maximize2, Minimize2 } from "lucide-react";

type HexCell = { h: string; lat: number; lng: number; total: number; hourly: number[]; corridors: string[] };
const CELLS = HEX_CELLS as HexCell[];

// Normalizer tuned so median-mass hex hits ~35% at peak commute, busiest hex pegs ~1.
const MAX_TOTAL = CELLS.reduce((m, c) => Math.max(m, c.total), 0);
const NORMALIZER = (MAX_TOTAL / 168) * 2.0 * 10 * 0.55;


export type LayerToggles = {
  heatmap: boolean;
  incidents: boolean;
  events: boolean;
  landmarks: boolean;
  risk: boolean;
};

export function TwinMap({
  events,
  hourOfWeek,
  layers,
  focusEventId,
  onSelectEvent,
}: {
  events: PlannedEvent[];
  hourOfWeek: number;
  layers: LayerToggles;
  focusEventId?: string;
  onSelectEvent?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const hexFCRef = useRef<any>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);


  // Init map once
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    let disposed = false;

    (async () => {
      const maplibre = await import("maplibre-gl");
      const h3 = await import("h3-js");
      if (disposed || !containerRef.current) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: [77.5946, 12.9716],
        zoom: 10.6,
        minZoom: 9,
        maxZoom: 16,
        attributionControl: { compact: true },
        pitch: 25,
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new maplibre.ScaleControl({ unit: "metric" }), "bottom-left");
      // Make sure canvas matches container size (panel may have animated in).
      setTimeout(() => map.resize(), 100);
      setTimeout(() => map.resize(), 600);


      map.on("load", () => {
        if (disposed) return;

        // ---- Hex heatmap source ----
        const hexFeatures = CELLS.map((c) => {
          const boundary = h3.cellToBoundary(c.h, true); // [lng, lat] pairs
          return {
            type: "Feature" as const,
            properties: { h: c.h, intensity: 0, total: c.total, corridors: c.corridors.join(" · ") },
            geometry: { type: "Polygon" as const, coordinates: [boundary] },
          };
        });
        const hexFC = {
          type: "FeatureCollection" as const,
          features: hexFeatures,
        };
        hexFCRef.current = hexFC;
        map.addSource("hex", { type: "geojson", data: hexFC });


        map.addLayer({
          id: "hex-fill",
          type: "fill",
          source: "hex",
          paint: {
            "fill-color": [
              "interpolate", ["linear"], ["get", "intensity"],
              0,    "rgba(56,189,248,0)",
              0.05, "rgba(56,189,248,0.35)",
              0.20, "rgba(125,211,252,0.55)",
              0.40, "rgba(250,204,21,0.7)",
              0.65, "rgba(249,115,22,0.82)",
              1,    "rgba(239,68,68,0.95)",
            ],

            "fill-outline-color": "rgba(15,23,42,0.55)",
          },
          layout: { visibility: "visible" },
        });

        map.addLayer({
          id: "hex-stroke",
          type: "line",
          source: "hex",
          paint: {
            "line-color": [
              "interpolate", ["linear"], ["get", "intensity"],
              0, "rgba(56,189,248,0)",
              0.3, "rgba(250,204,21,0.25)",
              1, "rgba(239,68,68,0.6)",
            ],
            "line-width": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1.2],
          },
        });

        // ---- Historical incident dots (sampled) ----
        // Show as a thin lower layer; visibility toggled via layers.incidents.
        const incidentsFC = {
          type: "FeatureCollection" as const,
          features: CELLS.flatMap((c) => {
            const n = Math.min(c.total, 6);
            return Array.from({ length: n }).map((_, i) => ({
              type: "Feature" as const,
              properties: { intensity: Math.min(1, c.total / 30) },
              geometry: {
                type: "Point" as const,
                coordinates: [
                  c.lng + (Math.sin(i * 1.7) * 0.002),
                  c.lat + (Math.cos(i * 2.1) * 0.002),
                ],
              },
            }));
          }),
        };
        map.addSource("incidents", { type: "geojson", data: incidentsFC });
        map.addLayer({
          id: "incidents-dots",
          type: "circle",
          source: "incidents",
          paint: {
            "circle-radius": 1.6,
            "circle-color": "#f59e0b",
            "circle-opacity": 0.55,
            "circle-stroke-width": 0,
          },
        });

        // ---- Landmark labels ----
        const landmarksFC = {
          type: "FeatureCollection" as const,
          features: LANDMARKS.map((l) => ({
            type: "Feature" as const,
            properties: { name: l.name, kind: l.kind },
            geometry: { type: "Point" as const, coordinates: [l.lng, l.lat] },
          })),
        };
        map.addSource("landmarks", { type: "geojson", data: landmarksFC });
        map.addLayer({
          id: "landmarks-dot",
          type: "circle",
          source: "landmarks",
          paint: {
            "circle-radius": ["match", ["get", "kind"],
              "junction", 4, "stadium", 5, "transit", 4.5, 3.5],
            "circle-color": "#22d3ee",
            "circle-stroke-color": "#0f172a",
            "circle-stroke-width": 1.5,
            "circle-opacity": 0.95,
          },
        });
        map.addLayer({
          id: "landmarks-label",
          type: "symbol",
          source: "landmarks",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-size": 11,
            "text-offset": [0, 1.1],
            "text-anchor": "top",
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#e2e8f0",
            "text-halo-color": "#0b1220",
            "text-halo-width": 1.4,
          },
        });

        // ---- Events: risk halo + marker + label ----
        map.addSource("events", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "events-halo",
          type: "circle",
          source: "events",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"],
              9, ["*", ["get", "risk"], 0.4],
              13, ["*", ["get", "risk"], 1.1],
            ],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.18,
            "circle-blur": 0.6,
          },
        });
        map.addLayer({
          id: "events-pulse",
          type: "circle",
          source: "events",
          paint: {
            "circle-radius": 9,
            "circle-color": ["get", "color"],
            "circle-opacity": 0.35,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-width": 1.5,
            "circle-stroke-opacity": 0.9,
          },
        });
        map.addLayer({
          id: "events-core",
          type: "circle",
          source: "events",
          paint: {
            "circle-radius": 4,
            "circle-color": "#fff",
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-width": 2,
          },
        });
        map.addLayer({
          id: "events-label",
          type: "symbol",
          source: "events",
          layout: {
            "text-field": ["concat", ["get", "name"], "  ·  ", ["to-string", ["get", "risk"]]],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-size": 11,
            "text-offset": [0, -1.6],
            "text-anchor": "bottom",
          },
          paint: {
            "text-color": "#fafafa",
            "text-halo-color": "#0b1220",
            "text-halo-width": 1.6,
          },
        });

        // Click → select event
        map.on("click", "events-pulse", (e) => {
          const f = e.features?.[0];
          if (f && onSelectEvent) onSelectEvent(String(f.properties?.id));
        });
        ["events-pulse", "hex-fill"].forEach((id) => {
          map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
        });

        // Hex tooltip
        const Popup = maplibre.Popup;
        const popup = new Popup({ closeButton: false, closeOnClick: false, className: "nethra-popup" });
        map.on("mousemove", "hex-fill", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const p = f.properties as any;
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:JetBrains Mono,monospace;font-size:11px;line-height:1.45">
                <div style="color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;font-size:10px">Hex · ${p.h.slice(-6)}</div>
                <div style="color:#f8fafc;margin-top:2px">Intensity <b style="color:#f59e0b">${Math.round(p.intensity*100)}</b> / 100</div>
                <div style="color:#cbd5e1">${p.total} historical incidents</div>
                ${p.corridors ? `<div style="color:#94a3b8;margin-top:2px">${p.corridors}</div>` : ""}
              </div>`,
            )
            .addTo(map);
        });
        map.on("mouseleave", "hex-fill", () => popup.remove());

        readyRef.current = true;
        setReady(true);
      });
    })();

    return () => {
      disposed = true;
      readyRef.current = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update hex intensities when hour changes (mutate cached FC, no h3 recompute)
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const src = map?.getSource("hex");
    const fc = hexFCRef.current;
    if (!src || !fc) return;
    for (let i = 0; i < fc.features.length; i++) {
      const c = CELLS[i];
      fc.features[i].properties.intensity = cellIntensity(c.hourly, c.total, hourOfWeek, NORMALIZER);
    }
    (src as any).setData(fc);
  }, [hourOfWeek, ready]);


  // Update events
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const src = map?.getSource("events");
    if (!src) return;
    const features = events.map((e) => {
      const p = predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours });
      const band = riskBand(p.riskScore);
      const colorMap: Record<string, string> = {
        critical: "#ef4444", warning: "#f59e0b", info: "#38bdf8", success: "#22c55e",
      };
      return {
        type: "Feature" as const,
        properties: {
          id: e.id, name: e.name, risk: p.riskScore, status: e.status,
          color: colorMap[band.tone] ?? "#38bdf8",
        },
        geometry: { type: "Point" as const, coordinates: [e.lng, e.lat] },
      };
    });
    (src as any).setData({ type: "FeatureCollection", features });
  }, [events, ready]);

  // Layer visibility
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    const set = (id: string, v: boolean) => map.getLayer(id) && map.setLayoutProperty(id, "visibility", v ? "visible" : "none");
    set("hex-fill", layers.heatmap);
    set("hex-stroke", layers.heatmap);
    set("incidents-dots", layers.incidents);
    set("landmarks-dot", layers.landmarks);
    set("landmarks-label", layers.landmarks);
    set("events-halo", layers.events && layers.risk);
    set("events-pulse", layers.events);
    set("events-core", layers.events);
    set("events-label", layers.events);
  }, [layers, ready]);

  // Focus
  useEffect(() => {
    if (!ready || !focusEventId) return;
    const ev = events.find((e) => e.id === focusEventId);
    if (!ev) return;
    mapRef.current.flyTo({ center: [ev.lng, ev.lat], zoom: 13.5, speed: 1.2 });
  }, [focusEventId, events, ready]);

  // Resize map when fullscreen changes
  useEffect(() => {
    if (!ready) return;
    setTimeout(() => mapRef.current?.resize(), 100);
  }, [isFullscreen, ready]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef} 
      className="rounded-md overflow-hidden relative"
      style={{ 
        width: "100%", 
        height: "100%",
        ...(isFullscreen ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 0,
          zIndex: 9999,
          height: "100vh",
          width: "100vw"
        } : {})
      }}
    >
      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          padding: "8px",
          borderRadius: 6,
          background: "rgba(15, 23, 42, 0.85)",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          color: "#e2e8f0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          zIndex: 1000
        }}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </div>
  );
}
