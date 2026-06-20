import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell, Panel, Badge } from "@/components/nethra/AppShell";
import { EVENT_KINDS, getEvents, INCIDENTS, nearbyIncidents, predictImpact, riskBand } from "@/lib/intel";
import { Bot, Send, Sparkles, User } from "lucide-react";

export const Route = createFileRoute("/strategist")({
  head: () => ({ meta: [{ title: "AI Strategist · NETHRA" }, { name: "description", content: "Ask the NETHRA AI Strategist about risks, deployments and operational decisions." }] }),
  component: StrategistPage,
});

type Msg = { role: "user" | "assistant"; text: string; cites?: string[] };

function answer(q: string): Msg {
  const ql = q.toLowerCase();
  const events = getEvents();

  if (ql.includes("highest risk") || ql.includes("riskiest") || ql.includes("top risk")) {
    const ranked = events.map((e) => ({ e, p: predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours }) }))
      .sort((a, b) => b.p.riskScore - a.p.riskScore);
    const top = ranked[0];
    if (!top) return { role: "assistant", text: "No active events in the queue right now." };
    return {
      role: "assistant",
      text: `**${top.e.name}** is the highest-risk event right now with a risk score of **${top.p.riskScore}/100** (${riskBand(top.p.riskScore).label}). It will pull ${top.e.crowd.toLocaleString()} people near ${top.e.address}. Expected delay around the perimeter is ~${top.p.delayMinutes} min and the impact radius is ${top.p.impactRadiusKm} km. I recommend pre-staging **${top.p.recommendedOfficers} officers** and **${top.p.recommendedBarricades} barricades**, with diversions through ${top.p.affectedCorridors.slice(0,2).join(" and ") || "local connectors"}.`,
      cites: top.p.similarIncidents.slice(0, 3).map((s) => s.id),
    };
  }

  for (const k of EVENT_KINDS) {
    if (ql.includes(k.id) || ql.includes(k.label.toLowerCase().split(" ")[0])) {
      const matches = events.filter((e) => e.kind === k.id);
      if (matches.length) {
        const e = matches[0];
        const p = predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours });
        return { role: "assistant", text: `For **${e.name}** (${k.label}): risk ${p.riskScore}, delay ${p.delayMinutes}min, ${p.recommendedOfficers} officers recommended. Stress corridors: ${p.affectedCorridors.join(", ") || "local"}.`, cites: p.similarIncidents.slice(0,3).map(s=>s.id) };
      }
    }
  }

  if (ql.includes("how many") || ql.includes("history") || ql.includes("historical")) {
    return { role: "assistant", text: `The intelligence layer holds **${INCIDENTS.length.toLocaleString()} historical incidents** across Bengaluru. The most common cause is vehicle breakdown (≈60%), followed by potholes, construction and waterlogging. High-priority events cluster around ORR East, Mysore Road and Bellary Road corridors.` };
  }

  if (ql.includes("silk board") || ql.includes("orr") || ql.includes("mysore") || ql.includes("hosur") || ql.includes("tumkur")) {
    const corridor = ql.includes("silk") ? "ORR East 1" : ql.includes("orr") ? "ORR East 1" : ql.includes("mysore") ? "Mysore Road" : ql.includes("hosur") ? "Hosur Road" : "Tumkur Road";
    const hits = INCIDENTS.filter((i) => i.corridor === corridor);
    return { role: "assistant", text: `**${corridor}** has ${hits.length} historical incidents on record. ${Math.round(hits.filter(h=>h.priority==="High").length/Math.max(1,hits.length)*100)}% were classified high-priority. Top causes: ${[...new Set(hits.map(h=>h.cause))].slice(0,3).join(", ")}. I'd keep at least 2 patrol units on standby during peak hours.`, cites: hits.slice(0,3).map(h=>h.id) };
  }

  if (ql.includes("deploy") || ql.includes("officer") || ql.includes("resource")) {
    const total = events.reduce((s, e) => s + predictImpact({ kind: e.kind, lat: e.lat, lng: e.lng, crowd: e.crowd, durationHours: e.durationHours }).recommendedOfficers, 0);
    return { role: "assistant", text: `Across the current queue, optimal deployment is **${total} officers** total. Prioritize live events first, then anything in the next 6h window. I can break this down per event — ask "show me deployment for [event name]".` };
  }

  // Fallback: nearby intelligence
  const sample = nearbyIncidents(12.97, 77.59, 4).slice(0, 3);
  return {
    role: "assistant",
    text: `I can reason over **${INCIDENTS.length.toLocaleString()}** historical traffic events and the live operational queue. Try asking:\n\n• "What's the highest risk event right now?"\n• "Tell me about Silk Board / ORR / Mysore Road"\n• "How many officers should we deploy today?"\n• "How risky is the cricket match?"`,
    cites: sample.map((s) => s.i.id),
  };
}

function StrategistPage() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "I'm the NETHRA Traffic Strategist. I read every event in the queue and 8,000+ historical incidents. Ask me what to do next." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  function send(text: string) {
    const q = text.trim(); if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, answer(q)]), 350);
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-6 grid grid-cols-12 gap-4 h-[calc(100vh-3rem)]">
        <div className="col-span-12">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">AI Strategist</div>
          <h1 className="text-2xl font-semibold mt-1">Operational reasoning, on demand</h1>
        </div>

        <Panel title="Conversation" className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="size-8 shrink-0 rounded-md bg-primary/15 border border-primary/30 grid place-items-center">
                    <Bot className="size-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed border ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card/60 border-border"
                }`}>
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                  {m.cites && m.cites.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                      cites: {m.cites.join(" · ")}
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="size-8 shrink-0 rounded-md bg-accent border border-border grid place-items-center">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border p-3 flex gap-2"
          >
            <input
              autoFocus value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about risks, deployments, corridors, or specific events…"
              className="flex-1 rounded-md bg-input/60 border border-border px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90">
              <Send className="size-4" /> Send
            </button>
          </form>
        </Panel>

        <Panel title="Suggested questions" className="col-span-12 lg:col-span-4">
          <div className="p-3 space-y-2">
            {[
              "What's the highest risk event right now?",
              "How risky is the cricket match?",
              "Tell me about Silk Board congestion history",
              "How many officers should we deploy today?",
              "What's happening on Mysore Road?",
            ].map((q) => (
              <button
                key={q} onClick={() => send(q)}
                className="w-full text-left text-sm rounded-md border border-border bg-card/40 px-3 py-2 hover:border-primary/40 hover:bg-accent/40 transition"
              >
                <Sparkles className="inline size-3.5 text-primary mr-1.5" />{q}
              </button>
            ))}
            <div className="pt-3 border-t border-border mt-3">
              <Badge tone="info">Powered by {INCIDENTS.length.toLocaleString()} incidents</Badge>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
