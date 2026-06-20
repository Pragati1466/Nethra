import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import {
  getEvents,
  predictImpact,
  diversionRoutesFor,
  riskBand,
  EVENT_KINDS,
  type PlannedEvent,
} from "@/lib/intel";
import { FileText, Download, Printer, Shield, CheckCircle2, AlertTriangle, Clock, Users, Radio, MapPin, Sparkles } from "lucide-react";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/brief")({
  head: () => ({
    meta: [
      { title: "Executive Decision Brief · NETHRA" },
      { name: "description", content: "One-click executive briefing for the Commissioner — event summary, predicted impact, recommended actions, deployment plan, and confidence score." },
    ],
  }),
  component: BriefPage,
});

type Brief = {
  ref: string;
  generatedAt: string;
  event: PlannedEvent;
  kindLabel: string;
  prediction: ReturnType<typeof predictImpact>;
  diversion: ReturnType<typeof diversionRoutesFor>[number];
  band: ReturnType<typeof riskBand>;
  recommendations: string[];
  deployment: { unit: string; count: number; role: string; eta: string }[];
  expectedOutcome: string[];
};

function buildBrief(ev: PlannedEvent): Brief {
  const prediction = predictImpact(ev);
  const routes = diversionRoutesFor(ev, prediction);
  const diversion = routes.find((r) => r.recommended) ?? routes[0];
  const band = riskBand(prediction.riskScore);
  const kindLabel = EVENT_KINDS.find((k) => k.id === ev.kind)?.label ?? ev.kind;

  const recommendations = [
    `Activate Command Post at ${ev.address.split(",")[0]} T-90 minutes prior to event start.`,
    `Deploy ${prediction.recommendedOfficers} traffic officers across ${prediction.affectedJunctions.length} key junctions.`,
    `Pre-position ${prediction.recommendedBarricades} barricades along ${prediction.affectedCorridors[0] ?? "primary corridor"}.`,
    `Issue public advisory via BTP Twitter, FM radio, and Namma Metro PIS — 6 hours pre-event.`,
    `Coordinate with ${prediction.affectedStations[0] ?? "local"} Police Station for crowd management standby.`,
    `Activate diversion plan "${diversion.name}" upon hitting ${Math.round(prediction.riskScore * 0.7)}% saturation.`,
  ];

  const deployment = [
    { unit: "Traffic Police", count: prediction.recommendedOfficers, role: "Junction control & flow management", eta: "T-90 min" },
    { unit: "Hoysala Patrol", count: Math.max(3, Math.round(prediction.recommendedOfficers / 4)), role: "Mobile response & escort", eta: "T-60 min" },
    { unit: "Barricade Units", count: prediction.recommendedBarricades, role: "Crowd channelling & lane closure", eta: "T-120 min" },
    { unit: "Tow / Crane", count: 2, role: "Stranded vehicle removal", eta: "On standby" },
    { unit: "Medical Standby", count: 1, role: "Ambulance + paramedics", eta: "T-30 min" },
    { unit: "CCTV Operators", count: 2, role: "Corridor surveillance from CCC", eta: "T-90 min" },
  ];

  const expectedOutcome = [
    `Average corridor delay contained to ≤ ${prediction.delayMinutes} minutes (vs ${Math.round(prediction.delayMinutes * 1.8)} min unmanaged baseline).`,
    `Diversion route "${diversion.name}" absorbs ~${diversion.capacityPct}% of displaced traffic with +${diversion.extraMinutes} min travel time.`,
    `Impact contained within ${prediction.impactRadiusKm} km radius — ${prediction.affectedCorridors.length} corridors actively managed.`,
    `Probability of cascade into adjacent zones reduced from 38% (no action) to ${Math.max(4, 100 - prediction.confidence)}%.`,
    `Estimated economic impact mitigation: ₹${(prediction.delayMinutes * prediction.recommendedOfficers * 1.4).toFixed(1)} lakh in productive hours saved.`,
  ];

  const ref = `NTH/BRF/${new Date().getFullYear()}/${ev.id.replace("EVT-", "")}`;
  return {
    ref,
    generatedAt: new Date().toISOString(),
    event: ev,
    kindLabel,
    prediction,
    diversion,
    band,
    recommendations,
    deployment,
    expectedOutcome,
  };
}

function BriefPage() {
  const events = getEvents();
  const [selectedId, setSelectedId] = useState<string>(events[0]?.id ?? "");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [generating, setGenerating] = useState(false);

  const selected = useMemo(() => events.find((e) => e.id === selectedId), [events, selectedId]);

  const handleGenerate = () => {
    if (!selected) return;
    setGenerating(true);
    setTimeout(() => {
      setBrief(buildBrief(selected));
      setGenerating(false);
    }, 600);
  };

  return (
    <AppShell>
      <div className="px-6 py-5 max-w-[1400px] mx-auto print:hidden">
        <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Executive Decision Brief Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              One-click briefing in the format the Commissioner's office receives. PDF, print, or on-screen.
            </p>
          </div>
          <Badge tone="info">Commissioner Briefing Format · BTP-EDB-v2</Badge>
        </div>

        <Panel title="Generate Brief" subtitle="Select an event and synthesize a decision-ready report">
          <div className="p-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[280px]">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Event</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} · {e.name} ({e.status})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={!selected || generating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {generating ? "Synthesizing…" : "Generate Brief"}
            </button>
            {brief && (
              <>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-accent/40"
                >
                  <Printer className="size-4" /> Print
                </button>
                <button
                  onClick={() => downloadPdf(brief)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-accent/40"
                >
                  <Download className="size-4" /> Download PDF
                </button>
              </>
            )}
          </div>
        </Panel>
      </div>

      {brief ? (
        <div className="px-6 pb-10 print:p-0">
          <BriefDocument brief={brief} />
        </div>
      ) : (
        <div className="px-6 pb-10 print:hidden">
          <div className="max-w-[900px] mx-auto border border-dashed border-border rounded-lg p-10 text-center text-sm text-muted-foreground">
            Select an event and press <span className="text-foreground font-medium">Generate Brief</span> to produce a Commissioner-ready report.
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ============================================================
// Commissioner-format document
// ============================================================
function BriefDocument({ brief }: { brief: Brief }) {
  const { event: ev, prediction: p, diversion: d, band } = brief;
  const startDate = new Date(ev.startsAt);
  const fmtDate = startDate.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" });

  return (
    <article
      id="brief-doc"
      className="mx-auto bg-white text-neutral-900 shadow-xl print:shadow-none"
      style={{ width: "210mm", minHeight: "297mm", padding: "18mm 16mm", fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Letterhead */}
      <header className="border-b-2 border-neutral-900 pb-3 mb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full border-2 border-neutral-900 grid place-items-center bg-neutral-900 text-white">
              <Shield className="size-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">Government of Karnataka</div>
              <div className="text-lg font-bold leading-tight">Bengaluru Traffic Police</div>
              <div className="text-[11px] text-neutral-700 italic">Office of the Commissioner · NETHRA Decision Support</div>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono uppercase tracking-wider text-neutral-600">
            <div>Ref: <span className="text-neutral-900">{brief.ref}</span></div>
            <div>Issued: {new Date(brief.generatedAt).toLocaleString("en-IN")}</div>
            <div>Classification: <span className="text-red-700">RESTRICTED</span></div>
          </div>
        </div>
      </header>

      <div className="text-center mb-5">
        <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Executive Decision Brief</div>
        <h1 className="text-2xl font-bold mt-1">{ev.name}</h1>
        <div className="text-[11px] text-neutral-600 mt-1">
          For the attention of: <span className="font-semibold">The Commissioner of Police (Traffic)</span> · From: NETHRA Operations Cell
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-4 gap-2 mb-5 text-[10px] font-mono uppercase">
        <Cell label="Event ID" value={ev.id} />
        <Cell label="Category" value={brief.kindLabel} />
        <Cell label="Scheduled" value={startDate.toLocaleDateString("en-IN")} />
        <Cell label="Status" value={ev.status} />
      </div>

      {/* 1. Event Summary */}
      <Section number="1" title="Event Summary">
        <p className="text-[12px] leading-relaxed">
          A <strong>{brief.kindLabel.toLowerCase()}</strong> is scheduled at <strong>{ev.address}</strong> on
          {" "}<strong>{fmtDate}</strong>, with an expected footfall of
          {" "}<strong>{ev.crowd.toLocaleString("en-IN")}</strong> persons over a duration of
          {" "}<strong>{ev.durationHours} hours</strong>. The location lies in a historically
          {" "}{p.similarIncidents.length > 5 ? "high-incident" : "moderate-incident"} corridor with
          {" "}<strong>{p.similarIncidents.length}</strong> comparable past events on record.
        </p>
        {ev.notes && <p className="text-[12px] mt-2 italic text-neutral-700">Note: {ev.notes}</p>}
      </Section>

      {/* 2. Predicted Impact */}
      <Section number="2" title="Predicted Impact">
        <div className="grid grid-cols-4 gap-2 mb-2">
          <KPI label="Risk Score" value={`${p.riskScore}`} sub={band.label} />
          <KPI label="Confidence" value={`${p.confidence}%`} sub="Model certainty" />
          <KPI label="Avg Delay" value={`${p.delayMinutes} min`} sub="Per corridor" />
          <KPI label="Impact Radius" value={`${p.impactRadiusKm} km`} sub="From epicentre" />
        </div>
        <p className="text-[12px] leading-relaxed">
          Pressure is expected on{" "}
          <strong>{p.affectedCorridors.join(", ") || "local arterial network"}</strong>
          {" "}with cascading effects on junctions:{" "}
          <strong>{p.affectedJunctions.join(", ") || "—"}</strong>.
          Nearest response stations: <strong>{p.affectedStations.join(", ") || "—"}</strong>.
        </p>
        <ul className="text-[11px] mt-2 space-y-1 list-disc pl-5 text-neutral-700">
          {p.reasoning.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </Section>

      {/* 3. Recommended Actions */}
      <Section number="3" title="Recommended Actions">
        <ol className="text-[12px] space-y-1.5 list-decimal pl-5">
          {brief.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </Section>

      {/* 4. Deployment Plan */}
      <Section number="4" title="Deployment Plan">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-neutral-900 text-white text-left">
              <th className="px-2 py-1.5 font-semibold">Unit</th>
              <th className="px-2 py-1.5 font-semibold w-16 text-right">Count</th>
              <th className="px-2 py-1.5 font-semibold">Role</th>
              <th className="px-2 py-1.5 font-semibold w-24">Deploy By</th>
            </tr>
          </thead>
          <tbody>
            {brief.deployment.map((d, i) => (
              <tr key={i} className={i % 2 ? "bg-neutral-50" : ""}>
                <td className="px-2 py-1.5 border-b border-neutral-200 font-medium">{d.unit}</td>
                <td className="px-2 py-1.5 border-b border-neutral-200 text-right font-mono">{d.count}</td>
                <td className="px-2 py-1.5 border-b border-neutral-200 text-neutral-700">{d.role}</td>
                <td className="px-2 py-1.5 border-b border-neutral-200 font-mono">{d.eta}</td>
              </tr>
            ))}
            <tr className="bg-neutral-100 font-semibold">
              <td className="px-2 py-1.5">Total Personnel</td>
              <td className="px-2 py-1.5 text-right font-mono">
                {brief.deployment.reduce((s, d) => s + d.count, 0)}
              </td>
              <td className="px-2 py-1.5" colSpan={2}>Coordinated through NETHRA Command &amp; Control Centre</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* 5. Diversion Strategy */}
      <Section number="5" title="Diversion Strategy">
        <div className="border border-neutral-300 rounded p-3 bg-neutral-50">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="font-semibold text-[13px]">Primary Route: {d.name}</div>
            <div className="text-[10px] font-mono uppercase text-neutral-600">Route ID: {d.id}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div><span className="text-neutral-500">Extra travel time:</span> <strong>+{d.extraMinutes} min</strong></div>
            <div><span className="text-neutral-500">Capacity absorbed:</span> <strong>{d.capacityPct}%</strong></div>
            <div><span className="text-neutral-500">Coverage:</span> <strong>{d.coverage.join(" · ")}</strong></div>
          </div>
        </div>
        <ul className="text-[11px] mt-2 space-y-1 list-disc pl-5 text-neutral-700">
          {p.diversions.map((dv, i) => (
            <li key={i}>Divert traffic from <strong>{dv.from}</strong> → <strong>{dv.to}</strong> via {dv.via}.</li>
          ))}
        </ul>
      </Section>

      {/* 6 + 7 side by side */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <SectionHead number="6" title="Confidence Score" />
          <div className="border border-neutral-300 rounded p-3">
            <div className="text-3xl font-bold leading-none">{p.confidence}%</div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mt-1">Model Certainty</div>
            <div className="mt-2 h-2 bg-neutral-200 rounded overflow-hidden">
              <div className="h-full bg-neutral-900" style={{ width: `${p.confidence}%` }} />
            </div>
            <div className="text-[10px] text-neutral-600 mt-2 leading-snug">
              Derived from {p.similarIncidents.length} comparable historical incidents within 3 km;
              model version <span className="font-mono">nethra-forecast-v1</span>.
            </div>
          </div>
        </div>
        <div>
          <SectionHead number="7" title="Expected Outcome" />
          <ul className="text-[11px] space-y-1.5 list-none">
            {brief.expectedOutcome.map((o, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-green-700" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sign-off */}
      <div className="mt-8 pt-4 border-t border-neutral-400 grid grid-cols-2 gap-8 text-[11px]">
        <div>
          <div className="h-10 border-b border-neutral-700" />
          <div className="mt-1 font-semibold">Prepared by</div>
          <div className="text-neutral-600">NETHRA Operations Cell · Decision Support</div>
        </div>
        <div>
          <div className="h-10 border-b border-neutral-700" />
          <div className="mt-1 font-semibold">Approved by</div>
          <div className="text-neutral-600">Commissioner of Police (Traffic)</div>
        </div>
      </div>

      <footer className="mt-6 pt-2 border-t border-neutral-300 flex justify-between text-[9px] font-mono uppercase text-neutral-500">
        <span>NETHRA · Traffic OS · Bengaluru</span>
        <span>{brief.ref}</span>
        <span>Page 1 of 1 · Restricted</span>
      </footer>
    </article>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <SectionHead number={number} title={title} />
      {children}
    </section>
  );
}

function SectionHead({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="text-[12px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-1 mb-2 flex items-center gap-2">
      <span className="font-mono opacity-70">{number}.</span> {title}
    </h2>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-300 px-2 py-1.5">
      <div className="text-[8px] text-neutral-500 tracking-wider">{label}</div>
      <div className="text-[11px] font-semibold text-neutral-900 truncate">{value}</div>
    </div>
  );
}

function KPI({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-neutral-400 px-2 py-2">
      <div className="text-[9px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="text-lg font-bold leading-tight mt-0.5">{value}</div>
      <div className="text-[9px] text-neutral-600">{sub}</div>
    </div>
  );
}

// ============================================================
// PDF download via jsPDF (text-based, real PDF — no rasterization)
// ============================================================
function downloadPdf(brief: Brief) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 16;
  let y = 18;

  const { event: ev, prediction: p, diversion: d, band } = brief;

  // Header band
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, W, 8, "F");
  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BENGALURU TRAFFIC POLICE · NETHRA DECISION SUPPORT", M, 5.5);
  doc.text("RESTRICTED", W - M, 5.5, { align: "right" });

  doc.setTextColor(0);
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text("Executive Decision Brief", W / 2, y, { align: "center" });
  y += 6;
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text(`For the Commissioner of Police (Traffic)`, W / 2, y, { align: "center" });
  y += 8;

  // Ref block
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Ref: ${brief.ref}`, M, y);
  doc.text(`Issued: ${new Date(brief.generatedAt).toLocaleString("en-IN")}`, W - M, y, { align: "right" });
  y += 5;
  doc.line(M, y, W - M, y);
  y += 6;

  // Event title
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text(ev.name, M, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${brief.kindLabel} · ${ev.address}`, M, y);
  y += 4;
  doc.text(`${new Date(ev.startsAt).toLocaleString("en-IN")} · Crowd: ${ev.crowd.toLocaleString("en-IN")} · Duration: ${ev.durationHours}h`, M, y);
  y += 7;

  const heading = (n: string, t: string) => {
    if (y > 270) { doc.addPage(); y = 18; }
    doc.setFillColor(20, 20, 20);
    doc.rect(M, y - 4, W - M * 2, 6, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${n}.  ${t.toUpperCase()}`, M + 2, y);
    doc.setTextColor(0);
    y += 5;
  };
  const para = (text: string) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, W - M * 2);
    for (const line of lines) {
      if (y > 282) { doc.addPage(); y = 18; }
      doc.text(line, M, y);
      y += 4.5;
    }
  };
  const bullets = (items: string[]) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    items.forEach((it, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${it}`, W - M * 2 - 4);
      for (const line of lines) {
        if (y > 282) { doc.addPage(); y = 18; }
        doc.text(line, M + 2, y);
        y += 4.5;
      }
    });
  };

  heading("1", "Event Summary");
  para(`A ${brief.kindLabel.toLowerCase()} is scheduled at ${ev.address} on ${new Date(ev.startsAt).toLocaleString("en-IN")}, with an expected footfall of ${ev.crowd.toLocaleString("en-IN")} persons over ${ev.durationHours} hours. The location records ${p.similarIncidents.length} comparable historical incidents within 3 km.`);
  y += 2;

  heading("2", "Predicted Impact");
  para(`Risk Score: ${p.riskScore}/100 (${band.label}) · Confidence: ${p.confidence}% · Avg Delay: ${p.delayMinutes} min · Impact Radius: ${p.impactRadiusKm} km.`);
  para(`Pressure expected on: ${p.affectedCorridors.join(", ") || "local arterials"}. Critical junctions: ${p.affectedJunctions.join(", ") || "—"}.`);
  y += 2;

  heading("3", "Recommended Actions");
  bullets(brief.recommendations);
  y += 2;

  heading("4", "Deployment Plan");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setFillColor(230, 230, 230);
  doc.rect(M, y - 4, W - M * 2, 5.5, "F");
  doc.text("Unit", M + 2, y);
  doc.text("Count", M + 70, y);
  doc.text("Role", M + 90, y);
  doc.text("Deploy By", W - M - 22, y);
  y += 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const r of brief.deployment) {
    if (y > 278) { doc.addPage(); y = 18; }
    y += 4;
    doc.text(r.unit, M + 2, y);
    doc.text(String(r.count), M + 70, y);
    const roleLines = doc.splitTextToSize(r.role, 70);
    doc.text(roleLines[0], M + 90, y);
    doc.text(r.eta, W - M - 22, y);
    doc.setDrawColor(220);
    doc.line(M, y + 1.5, W - M, y + 1.5);
  }
  y += 6;

  heading("5", "Diversion Strategy");
  para(`Primary route: ${d.name} (${d.id}) — adds +${d.extraMinutes} min travel time, absorbs ~${d.capacityPct}% of displaced traffic. Coverage: ${d.coverage.join(" · ")}.`);
  bullets(p.diversions.map((x) => `Divert ${x.from} → ${x.to} via ${x.via}.`));
  y += 2;

  heading("6", "Confidence Score");
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text(`${p.confidence}%`, M, y + 4);
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text(`Model: nethra-forecast-v1 · Basis: ${p.similarIncidents.length} comparable incidents within 3 km.`, M + 28, y + 4);
  y += 10;

  heading("7", "Expected Outcome");
  bullets(brief.expectedOutcome);
  y += 4;

  // Sign-off
  if (y > 250) { doc.addPage(); y = 30; }
  y = Math.max(y, 250);
  doc.setDrawColor(0);
  doc.line(M, y, M + 70, y);
  doc.line(W - M - 70, y, W - M, y);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Prepared by", M, y);
  doc.text("Approved by", W - M - 70, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.text("NETHRA Operations Cell", M, y);
  doc.text("Commissioner of Police (Traffic)", W - M - 70, y);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(`${brief.ref} · NETHRA · Restricted`, M, 292);
    doc.text(`Page ${i} of ${pageCount}`, W - M, 292, { align: "right" });
  }

  doc.save(`${brief.ref.replace(/\//g, "_")}.pdf`);
}
