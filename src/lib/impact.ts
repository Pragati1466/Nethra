// Citizen Impact Engine — translates traffic predictions into human consequences.
// All estimates are deterministic functions of event + prediction inputs so the
// same inputs always produce the same Impact Assessment (no random drift).
import { distanceKm, EVENT_KINDS, type EventKindId, type Prediction } from "./intel";

// Static city facility map (Bengaluru landmarks; lightweight on purpose).
// Each entry is a defensible reference point so officers see *which* hospital
// or school is at risk, not just a count.
export type Facility = {
  id: string;
  name: string;
  type: "hospital" | "school";
  lat: number;
  lng: number;
  beds?: number;       // hospitals
  students?: number;   // schools
  emergency?: boolean; // hospital with trauma/ER
};

export const FACILITIES: Facility[] = [
  // Hospitals
  { id: "H-VIC", name: "Victoria Hospital", type: "hospital", lat: 12.9626, lng: 77.5731, beds: 1050, emergency: true },
  { id: "H-BWN", name: "Bowring & Lady Curzon Hospital", type: "hospital", lat: 12.9836, lng: 77.6047, beds: 850, emergency: true },
  { id: "H-MAN", name: "Manipal Hospital, Old Airport Rd", type: "hospital", lat: 12.9606, lng: 77.6499, beds: 600, emergency: true },
  { id: "H-NIM", name: "NIMHANS", type: "hospital", lat: 12.9436, lng: 77.5963, beds: 900, emergency: false },
  { id: "H-FOR", name: "Fortis Hospital, Bannerghatta", type: "hospital", lat: 12.8908, lng: 77.5979, beds: 400, emergency: true },
  { id: "H-APO", name: "Apollo Hospital, Bannerghatta", type: "hospital", lat: 12.8967, lng: 77.5980, beds: 250, emergency: true },
  { id: "H-MSR", name: "M S Ramaiah Memorial Hospital", type: "hospital", lat: 13.0316, lng: 77.5670, beds: 600, emergency: true },
  { id: "H-NAR", name: "Narayana Health City", type: "hospital", lat: 12.8087, lng: 77.6810, beds: 1500, emergency: true },
  { id: "H-COL", name: "St. John's Medical College Hospital", type: "hospital", lat: 12.9279, lng: 77.6203, beds: 1350, emergency: true },
  { id: "H-SAG", name: "Sagar Hospital, Jayanagar", type: "hospital", lat: 12.9100, lng: 77.5826, beds: 350, emergency: true },
  // Schools
  { id: "S-BIS", name: "Bishop Cotton Boys' School", type: "school", lat: 12.9659, lng: 77.5953, students: 3200 },
  { id: "S-FRA", name: "St. Joseph's Boys' High School", type: "school", lat: 12.9650, lng: 77.6005, students: 2800 },
  { id: "S-DPS", name: "Delhi Public School, North", type: "school", lat: 13.0805, lng: 77.5503, students: 4200 },
  { id: "S-NPS", name: "National Public School, Indiranagar", type: "school", lat: 12.9719, lng: 77.6412, students: 3500 },
  { id: "S-BAL", name: "Baldwin Boys' High School", type: "school", lat: 12.9580, lng: 77.6022, students: 2600 },
  { id: "S-JYO", name: "Jyothi Nivas College", type: "school", lat: 12.9356, lng: 77.6155, students: 5000 },
  { id: "S-MAL", name: "Mallya Aditi International School", type: "school", lat: 13.0758, lng: 77.5783, students: 1200 },
  { id: "S-INV", name: "Inventure Academy", type: "school", lat: 12.8645, lng: 77.7170, students: 1400 },
  { id: "S-VID", name: "Vidya Niketan School", type: "school", lat: 13.0359, lng: 77.5970, students: 2300 },
  { id: "S-CAN", name: "Cathedral High School", type: "school", lat: 12.9694, lng: 77.5985, students: 2100 },
];

export type FacilityImpact = Facility & {
  distanceKm: number;
  severity: "high" | "moderate" | "low";
  detourMinutes: number;
};

export type ImpactAssessment = {
  // Headline humans
  peopleAffected: number;          // residents + commuters in impact ring
  peopleHoursLost: number;         // aggregate productive hours lost
  vehiclesImpacted: number;        // approximate vehicles delayed

  // Civic facilities
  hospitals: FacilityImpact[];
  schools: FacilityImpact[];

  // Emergency access
  emergencyAccessRisk: {
    score: number;                 // 0–100
    band: "low" | "moderate" | "high" | "severe";
    blockedERs: number;            // ERs inside impact ring
    nearestEmergencyKm: number;    // distance to nearest ER from event
    extraResponseMin: number;      // est. added ambulance response time
  };

  // Economic
  economic: {
    inrLakhs: number;              // total estimated loss in ₹ lakhs
    laborLossInr: number;
    fuelLossInr: number;
    commerceLossInr: number;
    breakdown: { label: string; inr: number }[];
  };

  // Demographics inside impact ring (estimated)
  demographics: {
    residents: number;
    workers: number;
    children: number;              // school-age inside ring
    elderly: number;
  };

  // Narrative bullets for the panel
  narrative: string[];

  // Confidence in this assessment (derived from prediction confidence + data density)
  confidence: number;
};

// Bengaluru-ish density: ~11,000 people/km² urban core. We taper for radius.
const URBAN_DENSITY_PER_KM2 = 11000;

const KIND_AFFECT_MULT: Record<EventKindId, number> = {
  festival: 1.15,
  cricket: 1.25,
  rally: 1.4,
  vip: 0.85,
  construction: 0.6,
  accident: 0.95,
  gathering: 1.0,
  waterlogging: 0.25,
};


const INR_PER_PERSON_HOUR = 220;     // avg productive hour value, ₹
const INR_PER_VEHICLE_HOUR_FUEL = 95; // idling fuel ₹/hr
const COMMERCE_LOSS_PER_PERSON = 35;  // ₹ per affected person, retail/footfall

export function assessImpact(
  ev: { kind: EventKindId; lat: number; lng: number; durationHours: number; crowd: number },
  p: Prediction,
): ImpactAssessment {
  const kind = EVENT_KINDS.find((k) => k.id === ev.kind)!;
  const kMult = KIND_AFFECT_MULT[ev.kind] ?? 1;
  const r = p.impactRadiusKm;
  const area = Math.PI * r * r;

  // People inside impact ring (capped — Bengaluru core saturates around 130k/km²·radius taper)
  const ringPopulation = Math.round(area * URBAN_DENSITY_PER_KM2 * 0.45); // 45% effective exposure
  const transientCrowd = Math.round(ev.crowd * kMult);
  const peopleAffected = ringPopulation + transientCrowd;

  // Hours lost — average commuter delayed by delayMinutes; residents lose
  // a fraction of an hour due to detours, errands, noise.
  const commuterShare = 0.35;
  const residentShare = 0.6;
  const avgDelayHr = p.delayMinutes / 60;
  const peopleHoursLost = Math.round(
    peopleAffected * commuterShare * avgDelayHr +
    peopleAffected * residentShare * (avgDelayHr * 0.4),
  );

  const vehiclesImpacted = Math.round(peopleAffected * 0.22); // ~1 vehicle per 4–5 people

  // Facility impact — anything inside the ring is impacted; outside but within
  // 2× radius is "secondary" (moderate detour).
  const score = (d: number): FacilityImpact["severity"] => {
    if (d <= r * 0.6) return "high";
    if (d <= r) return "moderate";
    return "low";
  };
  const annotate = (f: Facility): FacilityImpact => {
    const d = distanceKm([ev.lat, ev.lng], [f.lat, f.lng]);
    // Detour time scales with delay and how deep facility sits in impact ring
    const proximity = Math.max(0, 1 - d / (r * 2));
    const detourMinutes = Math.round(p.delayMinutes * (0.4 + proximity * 0.6));
    return { ...f, distanceKm: +d.toFixed(2), severity: score(d), detourMinutes };
  };
  const reach = r * 2;
  const hospitals = FACILITIES
    .filter((f) => f.type === "hospital")
    .map(annotate)
    .filter((f) => f.distanceKm <= reach)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const schools = FACILITIES
    .filter((f) => f.type === "school")
    .map(annotate)
    .filter((f) => f.distanceKm <= reach)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Emergency access
  const blockedERs = hospitals.filter((h) => h.emergency && h.distanceKm <= r).length;
  const ers = FACILITIES.filter((f) => f.type === "hospital" && f.emergency);
  const nearestEmergencyKm = ers.length
    ? +Math.min(...ers.map((e) => distanceKm([ev.lat, ev.lng], [e.lat, e.lng]))).toFixed(2)
    : 99;
  const extraResponseMin = Math.round(p.delayMinutes * 0.55 + blockedERs * 4);
  let eaScore = 20 + blockedERs * 18 + Math.min(35, extraResponseMin * 1.2);
  if (kind.id === "rally" || kind.id === "festival") eaScore += 6;
  eaScore = Math.max(8, Math.min(98, Math.round(eaScore)));
  const eaBand: "low" | "moderate" | "high" | "severe" =
    eaScore >= 80 ? "severe" : eaScore >= 60 ? "high" : eaScore >= 35 ? "moderate" : "low";

  // Economic estimate
  const laborLossInr = Math.round(peopleHoursLost * INR_PER_PERSON_HOUR);
  const fuelLossInr = Math.round(vehiclesImpacted * avgDelayHr * INR_PER_VEHICLE_HOUR_FUEL);
  const commerceLossInr = Math.round(peopleAffected * COMMERCE_LOSS_PER_PERSON * Math.min(1, ev.durationHours / 6));
  const emergencyMultiplier = eaBand === "severe" ? 1.18 : eaBand === "high" ? 1.1 : 1.0;
  const subtotal = (laborLossInr + fuelLossInr + commerceLossInr) * emergencyMultiplier;
  const inrLakhs = +(subtotal / 100000).toFixed(2);

  const breakdown = [
    { label: "Lost productive hours", inr: laborLossInr },
    { label: "Vehicle fuel & idling", inr: fuelLossInr },
    { label: "Retail & footfall loss", inr: commerceLossInr },
    { label: "Emergency premium", inr: Math.round(subtotal - (laborLossInr + fuelLossInr + commerceLossInr)) },
  ];

  // Demographics — rough urban splits
  const demographics = {
    residents: Math.round(ringPopulation * 0.72),
    workers: Math.round(ringPopulation * 0.45),
    children: schools.reduce((sum, s) => sum + Math.round((s.students ?? 0) * (s.severity === "high" ? 1 : s.severity === "moderate" ? 0.6 : 0.25)), 0),
    elderly: Math.round(ringPopulation * 0.11),
  };

  const narrative: string[] = [
    `Roughly ${formatPeople(peopleAffected)} people sit inside the ${r} km impact ring.`,
    `Estimated ${formatPeople(peopleHoursLost)} person-hours of productivity lost over the event window.`,
    hospitals.length
      ? `${hospitals.length} hospital${hospitals.length > 1 ? "s" : ""} within reach — ${blockedERs} ER${blockedERs === 1 ? "" : "s"} sit inside the closure ring.`
      : `No hospitals fall within the impact ring.`,
    schools.length
      ? `${schools.length} school${schools.length > 1 ? "s" : ""} affected · ~${demographics.children.toLocaleString()} students need protected access.`
      : `No schools affected at this radius.`,
    `Ambulance response inside the ring slows by an estimated ${extraResponseMin} min (${eaBand} risk).`,
    `Economic exposure across labour, fuel and footfall: ₹${inrLakhs.toLocaleString("en-IN")} lakhs.`,
  ];

  const confidence = Math.max(40, Math.min(94, Math.round(p.confidence * 0.85 + (hospitals.length + schools.length) * 1.2)));

  return {
    peopleAffected,
    peopleHoursLost,
    vehiclesImpacted,
    hospitals,
    schools,
    emergencyAccessRisk: {
      score: eaScore,
      band: eaBand,
      blockedERs,
      nearestEmergencyKm,
      extraResponseMin,
    },
    economic: { inrLakhs, laborLossInr, fuelLossInr, commerceLossInr, breakdown },
    demographics,
    narrative,
    confidence,
  };
}

export function formatPeople(n: number): string {
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)} lakh`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("en-IN");
}

export function formatInr(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n.toLocaleString("en-IN")}`;
}
