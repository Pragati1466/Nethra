import { o as __toESM } from "../_runtime.mjs";
import { _ as predictImpact, b as subscribe, c as explainEvent, l as getEvent, n as EVENT_KINDS, o as distanceKm, s as diversionRoutesFor, v as riskBand, x as updateEvent } from "./intel-Bd2vThK7.mjs";
import { i as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as CircleCheck, B as GraduationCap, R as IndianRupee, S as Route, T as Radio, X as Clock, Y as Cross, _ as ShieldCheck, at as Baby, i as Users, it as Bot, k as Play, lt as ArrowLeft, m as Siren, s as TriangleAlert } from "../_libs/lucide-react.mjs";
import { i as cn, n as Badge, r as Panel, t as AppShell } from "./AppShell-DZ395jJC.mjs";
import { t as CityMap } from "./CityMap-CKVCF3Ux.mjs";
import { n as RiskGauge, t as MetricStat } from "./RiskGauge-myQ5E85U.mjs";
import { t as ExplainabilityPanel } from "./Explainability-Cp41_M55.mjs";
import { t as Route$1 } from "./events._eventId-5J5m6qpt.mjs";
import { n as getTiwForEvent } from "./tiw_store-Ca9BGIe7.mjs";
import { r as setLatestClosedIntel, t as deriveCeifromTiwClosure } from "./closed_intel_store-y6Wg7KyK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events._eventId-BX9_yIJC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FACILITIES = [
	{
		id: "H-VIC",
		name: "Victoria Hospital",
		type: "hospital",
		lat: 12.9626,
		lng: 77.5731,
		beds: 1050,
		emergency: true
	},
	{
		id: "H-BWN",
		name: "Bowring & Lady Curzon Hospital",
		type: "hospital",
		lat: 12.9836,
		lng: 77.6047,
		beds: 850,
		emergency: true
	},
	{
		id: "H-MAN",
		name: "Manipal Hospital, Old Airport Rd",
		type: "hospital",
		lat: 12.9606,
		lng: 77.6499,
		beds: 600,
		emergency: true
	},
	{
		id: "H-NIM",
		name: "NIMHANS",
		type: "hospital",
		lat: 12.9436,
		lng: 77.5963,
		beds: 900,
		emergency: false
	},
	{
		id: "H-FOR",
		name: "Fortis Hospital, Bannerghatta",
		type: "hospital",
		lat: 12.8908,
		lng: 77.5979,
		beds: 400,
		emergency: true
	},
	{
		id: "H-APO",
		name: "Apollo Hospital, Bannerghatta",
		type: "hospital",
		lat: 12.8967,
		lng: 77.598,
		beds: 250,
		emergency: true
	},
	{
		id: "H-MSR",
		name: "M S Ramaiah Memorial Hospital",
		type: "hospital",
		lat: 13.0316,
		lng: 77.567,
		beds: 600,
		emergency: true
	},
	{
		id: "H-NAR",
		name: "Narayana Health City",
		type: "hospital",
		lat: 12.8087,
		lng: 77.681,
		beds: 1500,
		emergency: true
	},
	{
		id: "H-COL",
		name: "St. John's Medical College Hospital",
		type: "hospital",
		lat: 12.9279,
		lng: 77.6203,
		beds: 1350,
		emergency: true
	},
	{
		id: "H-SAG",
		name: "Sagar Hospital, Jayanagar",
		type: "hospital",
		lat: 12.91,
		lng: 77.5826,
		beds: 350,
		emergency: true
	},
	{
		id: "S-BIS",
		name: "Bishop Cotton Boys' School",
		type: "school",
		lat: 12.9659,
		lng: 77.5953,
		students: 3200
	},
	{
		id: "S-FRA",
		name: "St. Joseph's Boys' High School",
		type: "school",
		lat: 12.965,
		lng: 77.6005,
		students: 2800
	},
	{
		id: "S-DPS",
		name: "Delhi Public School, North",
		type: "school",
		lat: 13.0805,
		lng: 77.5503,
		students: 4200
	},
	{
		id: "S-NPS",
		name: "National Public School, Indiranagar",
		type: "school",
		lat: 12.9719,
		lng: 77.6412,
		students: 3500
	},
	{
		id: "S-BAL",
		name: "Baldwin Boys' High School",
		type: "school",
		lat: 12.958,
		lng: 77.6022,
		students: 2600
	},
	{
		id: "S-JYO",
		name: "Jyothi Nivas College",
		type: "school",
		lat: 12.9356,
		lng: 77.6155,
		students: 5e3
	},
	{
		id: "S-MAL",
		name: "Mallya Aditi International School",
		type: "school",
		lat: 13.0758,
		lng: 77.5783,
		students: 1200
	},
	{
		id: "S-INV",
		name: "Inventure Academy",
		type: "school",
		lat: 12.8645,
		lng: 77.717,
		students: 1400
	},
	{
		id: "S-VID",
		name: "Vidya Niketan School",
		type: "school",
		lat: 13.0359,
		lng: 77.597,
		students: 2300
	},
	{
		id: "S-CAN",
		name: "Cathedral High School",
		type: "school",
		lat: 12.9694,
		lng: 77.5985,
		students: 2100
	}
];
var URBAN_DENSITY_PER_KM2 = 11e3;
var KIND_AFFECT_MULT = {
	festival: 1.15,
	cricket: 1.25,
	rally: 1.4,
	vip: .85,
	construction: .6,
	accident: .95,
	gathering: 1,
	waterlogging: .25
};
var INR_PER_PERSON_HOUR = 220;
var INR_PER_VEHICLE_HOUR_FUEL = 95;
var COMMERCE_LOSS_PER_PERSON = 35;
function assessImpact(ev, p) {
	const kind = EVENT_KINDS.find((k) => k.id === ev.kind);
	const kMult = KIND_AFFECT_MULT[ev.kind] ?? 1;
	const r = p.impactRadiusKm;
	const area = Math.PI * r * r;
	const ringPopulation = Math.round(area * URBAN_DENSITY_PER_KM2 * .45);
	const peopleAffected = ringPopulation + Math.round(ev.crowd * kMult);
	const commuterShare = .35;
	const residentShare = .6;
	const avgDelayHr = p.delayMinutes / 60;
	const peopleHoursLost = Math.round(peopleAffected * commuterShare * avgDelayHr + peopleAffected * residentShare * (avgDelayHr * .4));
	const vehiclesImpacted = Math.round(peopleAffected * .22);
	const score = (d) => {
		if (d <= r * .6) return "high";
		if (d <= r) return "moderate";
		return "low";
	};
	const annotate = (f) => {
		const d = distanceKm([ev.lat, ev.lng], [f.lat, f.lng]);
		const proximity = Math.max(0, 1 - d / (r * 2));
		const detourMinutes = Math.round(p.delayMinutes * (.4 + proximity * .6));
		return {
			...f,
			distanceKm: +d.toFixed(2),
			severity: score(d),
			detourMinutes
		};
	};
	const reach = r * 2;
	const hospitals = FACILITIES.filter((f) => f.type === "hospital").map(annotate).filter((f) => f.distanceKm <= reach).sort((a, b) => a.distanceKm - b.distanceKm);
	const schools = FACILITIES.filter((f) => f.type === "school").map(annotate).filter((f) => f.distanceKm <= reach).sort((a, b) => a.distanceKm - b.distanceKm);
	const blockedERs = hospitals.filter((h) => h.emergency && h.distanceKm <= r).length;
	const ers = FACILITIES.filter((f) => f.type === "hospital" && f.emergency);
	const nearestEmergencyKm = ers.length ? +Math.min(...ers.map((e) => distanceKm([ev.lat, ev.lng], [e.lat, e.lng]))).toFixed(2) : 99;
	const extraResponseMin = Math.round(p.delayMinutes * .55 + blockedERs * 4);
	let eaScore = 20 + blockedERs * 18 + Math.min(35, extraResponseMin * 1.2);
	if (kind.id === "rally" || kind.id === "festival") eaScore += 6;
	eaScore = Math.max(8, Math.min(98, Math.round(eaScore)));
	const eaBand = eaScore >= 80 ? "severe" : eaScore >= 60 ? "high" : eaScore >= 35 ? "moderate" : "low";
	const laborLossInr = Math.round(peopleHoursLost * INR_PER_PERSON_HOUR);
	const fuelLossInr = Math.round(vehiclesImpacted * avgDelayHr * INR_PER_VEHICLE_HOUR_FUEL);
	const commerceLossInr = Math.round(peopleAffected * COMMERCE_LOSS_PER_PERSON * Math.min(1, ev.durationHours / 6));
	const emergencyMultiplier = eaBand === "severe" ? 1.18 : eaBand === "high" ? 1.1 : 1;
	const subtotal = (laborLossInr + fuelLossInr + commerceLossInr) * emergencyMultiplier;
	const inrLakhs = +(subtotal / 1e5).toFixed(2);
	const breakdown = [
		{
			label: "Lost productive hours",
			inr: laborLossInr
		},
		{
			label: "Vehicle fuel & idling",
			inr: fuelLossInr
		},
		{
			label: "Retail & footfall loss",
			inr: commerceLossInr
		},
		{
			label: "Emergency premium",
			inr: Math.round(subtotal - (laborLossInr + fuelLossInr + commerceLossInr))
		}
	];
	const demographics = {
		residents: Math.round(ringPopulation * .72),
		workers: Math.round(ringPopulation * .45),
		children: schools.reduce((sum, s) => sum + Math.round((s.students ?? 0) * (s.severity === "high" ? 1 : s.severity === "moderate" ? .6 : .25)), 0),
		elderly: Math.round(ringPopulation * .11)
	};
	const narrative = [
		`Roughly ${formatPeople(peopleAffected)} people sit inside the ${r} km impact ring.`,
		`Estimated ${formatPeople(peopleHoursLost)} person-hours of productivity lost over the event window.`,
		hospitals.length ? `${hospitals.length} hospital${hospitals.length > 1 ? "s" : ""} within reach — ${blockedERs} ER${blockedERs === 1 ? "" : "s"} sit inside the closure ring.` : `No hospitals fall within the impact ring.`,
		schools.length ? `${schools.length} school${schools.length > 1 ? "s" : ""} affected · ~${demographics.children.toLocaleString()} students need protected access.` : `No schools affected at this radius.`,
		`Ambulance response inside the ring slows by an estimated ${extraResponseMin} min (${eaBand} risk).`,
		`Economic exposure across labour, fuel and footfall: ₹${inrLakhs.toLocaleString("en-IN")} lakhs.`
	];
	const confidence = Math.max(40, Math.min(94, Math.round(p.confidence * .85 + (hospitals.length + schools.length) * 1.2)));
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
			extraResponseMin
		},
		economic: {
			inrLakhs,
			laborLossInr,
			fuelLossInr,
			commerceLossInr,
			breakdown
		},
		demographics,
		narrative,
		confidence
	};
}
function formatPeople(n) {
	if (n >= 1e5) return `${(n / 1e5).toFixed(1)} lakh`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
	return n.toLocaleString("en-IN");
}
function formatInr(n) {
	if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
	if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
	if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}k`;
	return `₹${n.toLocaleString("en-IN")}`;
}
function ImpactPanel({ impact, className }) {
	const ea = impact.emergencyAccessRisk;
	const eaTone = ea.band === "severe" ? "critical" : ea.band === "high" ? "warning" : ea.band === "moderate" ? "info" : "success";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Citizen Impact",
		subtitle: "Human consequences beyond traffic metrics",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			tone: "info",
			children: [impact.confidence, "% confidence"]
		}),
		className: cn(className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactStat, {
							icon: Users,
							label: "People affected",
							value: formatPeople(impact.peopleAffected),
							tone: "warning"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactStat, {
							icon: Clock,
							label: "People-hours lost",
							value: formatPeople(impact.peopleHoursLost),
							tone: "warning"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactStat, {
							icon: IndianRupee,
							label: "Economic loss",
							value: formatInr(impact.economic.inrLakhs * 1e5),
							tone: "critical"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactStat, {
							icon: Cross,
							label: "Hospitals impacted",
							value: impact.hospitals.length,
							sub: `${ea.blockedERs} ER inside ring`,
							tone: ea.blockedERs > 0 ? "critical" : "info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactStat, {
							icon: GraduationCap,
							label: "Schools impacted",
							value: impact.schools.length,
							sub: `~${impact.demographics.children.toLocaleString()} students`,
							tone: "info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactStat, {
							icon: Siren,
							label: "Emergency access",
							value: `${ea.score}/100`,
							sub: `+${ea.extraResponseMin} min response`,
							tone: eaTone
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-card/40 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2",
						children: "Why this matters"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5 text-[13px] text-foreground/85",
						children: impact.narrative.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary mt-1",
								children: "›"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n })]
						}, i))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid md:grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cross, { className: "size-3.5 text-critical" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
							children: "Hospitals in reach"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border divide-y divide-border max-h-44 overflow-auto",
						children: [impact.hospitals.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3 text-xs text-muted-foreground",
							children: "No hospitals within impact reach."
						}), impact.hospitals.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacilityRow, {
							name: h.name,
							meta: `${h.distanceKm} km · ${h.beds} beds${h.emergency ? " · ER" : ""}`,
							severity: h.severity,
							extra: `+${h.detourMinutes}m`
						}, h.id))]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-3.5 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
							children: "Schools in reach"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border divide-y divide-border max-h-44 overflow-auto",
						children: [impact.schools.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-3 text-xs text-muted-foreground",
							children: "No schools within impact reach."
						}), impact.schools.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacilityRow, {
							name: s.name,
							meta: `${s.distanceKm} km · ${s.students?.toLocaleString()} students`,
							severity: s.severity,
							extra: `+${s.detourMinutes}m`
						}, s.id))]
					})] })]
				}),
				ea.band === "high" || ea.band === "severe" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-critical/40 bg-critical/10 p-3 flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-critical mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-medium text-critical",
							children: [
								"Emergency access at ",
								ea.band,
								" risk"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-foreground/80 mt-0.5",
							children: [
								"Nearest ER is ",
								ea.nearestEmergencyKm,
								" km away. Reserve at least one corridor as a green channel and pre-position an ambulance inside the ring."
							]
						})]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2",
					children: "Economic impact breakdown"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5",
					children: impact.economic.breakdown.map((b) => {
						const max = Math.max(...impact.economic.breakdown.map((x) => Math.abs(x.inr))) || 1;
						const pct = Math.max(2, Math.round(Math.abs(b.inr) / max * 100));
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[12px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground/80",
								children: b.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-foreground/90",
								children: formatInr(b.inr)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1.5 rounded-full bg-muted overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-primary/70",
								style: { width: `${pct}%` }
							})
						})] }, b.label);
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-4 gap-2 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoStat, {
							label: "Residents",
							value: formatPeople(impact.demographics.residents)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoStat, {
							label: "Workers",
							value: formatPeople(impact.demographics.workers)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoStat, {
							label: "Children",
							value: formatPeople(impact.demographics.children),
							icon: Baby
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoStat, {
							label: "Elderly",
							value: formatPeople(impact.demographics.elderly)
						})
					]
				})
			]
		})
	});
}
function ImpactStat({ icon: Icon, label, value, sub, tone = "info" }) {
	const toneCls = {
		info: "text-info",
		warning: "text-warning",
		critical: "text-critical",
		success: "text-success"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-card/50 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-3", toneCls[tone]) }), label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("text-lg font-semibold mt-1 tabular-nums", toneCls[tone]),
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] font-mono text-muted-foreground mt-0.5",
				children: sub
			})
		]
	});
}
function FacilityRow({ name, meta, severity, extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-2.5 flex items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[13px] truncate",
					children: name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] font-mono text-muted-foreground truncate",
					children: meta
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: severity === "high" ? "critical" : severity === "moderate" ? "warning" : "info",
				children: severity
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-mono text-muted-foreground w-10 text-right",
				children: extra
			})
		]
	});
}
function DemoStat({ label, value, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-card/40 p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1",
			children: [
				Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }),
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-semibold mt-0.5 tabular-nums",
			children: value
		})]
	});
}
function EventPage() {
	const { eventId } = Route$1.useParams();
	const navigate = useNavigate();
	const [, force] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => subscribe(() => force((n) => n + 1)), []);
	const event = getEvent(eventId);
	const prediction = (0, import_react.useMemo)(() => event ? predictImpact({
		kind: event.kind,
		lat: event.lat,
		lng: event.lng,
		crowd: event.crowd,
		durationHours: event.durationHours
	}) : null, [event]);
	const explanation = (0, import_react.useMemo)(() => {
		if (!event || !prediction) return null;
		const routes = diversionRoutesFor(event, prediction);
		return explainEvent(event, prediction, routes.find((r) => r.recommended) ?? routes[0], routes);
	}, [event, prediction]);
	if (!event || !prediction || !explanation) return null;
	const band = riskBand(prediction.riskScore);
	const kindLabel = EVENT_KINDS.find((k) => k.id === event.kind)?.label ?? event.kind;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 lg:p-6 grid grid-cols-12 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-12 flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => navigate({ to: "/" }),
							className: "text-xs font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), " Command Center"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-semibold",
									children: event.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: event.status === "live" ? "critical" : event.status === "deployed" ? "info" : event.status === "planned" ? "warning" : "muted",
									children: event.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									tone: band.tone,
									children: ["Event Impact Score (EIS) ", prediction.riskScore]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: [
								kindLabel,
								" · ",
								event.address
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-mono text-muted-foreground mt-0.5",
							children: [
								"Starts ",
								new Date(event.startsAt).toLocaleString(),
								" · ",
								event.durationHours,
								"h · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "inline size-3" }),
								" ",
								event.crowd.toLocaleString()
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: event.status === "planned" || event.status === "draft" ? "warning" : "info",
							children: new Date(event.createdAt).getTime() <= new Date(event.startsAt).getTime() - 2 * 36e5 ? "Forecast Mode (Planned Event)" : "Rapid Response Mode (Unplanned Event)"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						event.status !== "deployed" && event.status !== "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => updateEvent(event.id, { status: "deployed" }),
							className: "inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:bg-primary/90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Approve Deployment"]
						}),
						event.status === "deployed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => updateEvent(event.id, { status: "live" }),
							className: "inline-flex items-center gap-2 rounded-md bg-critical text-destructive-foreground px-3 py-2 text-sm font-medium hover:opacity-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Go Live"]
						}),
						event.status === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								if (prediction && prediction && prediction.riskScore !== void 0) {
									const tw = getTiwForEvent(event.id);
									const timeWindowRemainingMin = tw?.remainingMin ?? 0;
									const forecastDelayMin = prediction.delayMinutes;
									const actualDelayMin = Math.max(2, Math.round(forecastDelayMin * .87));
									setLatestClosedIntel(deriveCeifromTiwClosure({
										ev: event,
										prediction,
										timeWindowRemainingMin,
										revisedActionTitle: tw?.revisedAction?.title ?? "Diversion activated",
										actualDelayMin,
										learnedUpdate: "Match-day prior updated; Junction DNA recalibrated; Future forecasts strengthened"
									}));
								}
								updateEvent(event.id, { status: "closed" });
							},
							className: "inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-sm hover:bg-accent/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4" }), " Close Event"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Digital Twin",
				subtitle: "Impact radius + similar past incidents",
				className: "col-span-12 lg:col-span-8 h-[480px] flex flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityMap, {
						events: [event],
						focus: {
							lat: event.lat,
							lng: event.lng,
							impactRadiusKm: prediction.impactRadiusKm,
							riskScore: prediction.riskScore
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Impact Simulator",
				className: "col-span-12 lg:col-span-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 grid place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskGauge, { score: prediction.riskScore })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 p-4 pt-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Radius",
							value: `${prediction.impactRadiusKm} km`,
							tone: "info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Delay",
							value: `${prediction.delayMinutes} min`,
							tone: "warning"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Confidence",
							value: `${prediction.confidence}%`,
							tone: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricStat, {
							label: "Similar past",
							value: prediction.similarIncidents.length,
							sub: "incidents"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Resource Optimization",
				subtitle: "Recommended deployment",
				className: "col-span-12 lg:col-span-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceRow, {
							label: "Traffic officers",
							need: prediction.recommendedOfficers,
							icon: Users
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceRow, {
							label: "Barricades",
							need: prediction.recommendedBarricades,
							icon: ShieldCheck
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceRow, {
							label: "Patrol units",
							need: Math.max(2, Math.round(prediction.recommendedOfficers / 4)),
							icon: Radio
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground pt-2",
							children: "Lead stations"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: prediction.affectedStations.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[12px] px-2 py-1 rounded-md bg-accent/50 border border-border",
								children: s
							}, s))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Smart Diversion Planner",
				subtitle: "Traffic-aware alternates",
				className: "col-span-12 lg:col-span-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border",
					children: prediction.diversions.length ? prediction.diversions.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-4 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "truncate",
								children: [
									d.from,
									" → ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-foreground/70",
										children: ["via ", d.via]
									}),
									" → ",
									d.to
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] font-mono text-muted-foreground",
								children: [
									"+ ",
									3 + i * 2,
									" min · capacity 78%"
								]
							})]
						})]
					}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4 text-sm text-muted-foreground",
						children: "No corridor-level diversions required."
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpactPanel, {
				impact: assessImpact({
					kind: event.kind,
					lat: event.lat,
					lng: event.lng,
					durationHours: event.durationHours,
					crowd: event.crowd
				}, prediction),
				className: "col-span-12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExplainabilityPanel, {
				explanation,
				className: "col-span-12 lg:col-span-8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Ask deeper",
				className: "col-span-12 lg:col-span-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 space-y-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[13px] text-muted-foreground",
							children: [
								"Every factor above maps to a slice of the ",
								prediction.riskScore,
								"/100 risk score. Drill in with the AI Strategist for scenario edits (\"what if crowd drops 30%?\")."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/strategist",
							className: "inline-flex items-center gap-2 text-primary text-sm hover:underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), " Open AI Strategist"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-wider text-muted-foreground pt-3",
							children: "Model trace"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1 text-[12px] text-foreground/80",
							children: prediction.reasoning.slice(0, 3).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary mt-0.5",
									children: "›"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r })]
							}, i))
						})
					]
				})
			})
		]
	}) });
}
function ResourceRow({ label, need, icon: Icon }) {
	const have = Math.round(need * .7);
	const pct = Math.min(100, Math.round(have / need * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-sm mb-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 text-muted-foreground" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono text-xs text-muted-foreground",
			children: [
				have,
				" / ",
				need
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1.5 rounded-full bg-muted overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full bg-primary",
			style: { width: `${pct}%` }
		})
	})] });
}
//#endregion
export { EventPage as component };
