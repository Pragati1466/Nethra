# NETHRA Gridlock Hackathon 2.0 — Implementation TODO

## Goal
Align the codebase to the NETHRA narrative: **EIS → MEI → T−IW drift alerts → Post-event learning loop**.

## Steps
- [ ] Inspect `src/lib/pulse.ts` and any event lifecycle/replay pages to find where live alerts are generated.
- [ ] Implement deterministic **T−IW countdown** logic derived from the active event’s forecast (EIS) and a drift condition fed by the existing pulse layer.
- [ ] Update **Brief Generator** (`src/routes/brief.tsx`) labels/sections to explicitly present **EIS (Event Impact Score)** and **MEI (Deployment Plan)**, plus a computed **T−IW (Intervention Window)** line.
- [ ] Update **Live Ops UI** (`src/components/nethra/LiveOps.tsx`) to display a dedicated **T−IW Alert** card when drift triggers, including the revised action and the remaining minutes.
- [ ] Update **Diversion planner** (`src/routes/diversion.tsx`) to surface the “planned intervention timing” (EIS-consistency) for the selected event.
- [ ] Update **Learning dashboard** (`src/routes/learn.tsx`) to show a per-event “close-the-loop record” matching the narrative fields (forecast vs actual, deployment vs actual, genome match accuracy, routing outcome flag).
- [ ] Adjust wording across **RiskGauge** and related panels for consistent terminology: EIS/MEI/T−IW.
- [ ] Run TypeScript build (`npm run build`) to confirm everything compiles.

