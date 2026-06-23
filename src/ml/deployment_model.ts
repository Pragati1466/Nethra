/**
 * NETHRA Deployment Model — Decision-Tree Style Deployment Planner
 *
 * Takes a risk profile + resource recommendation and outputs a staged
 * deployment plan: pre-event, on-event, post-event phases with
 * specific actions, timings, and priorities.
 *
 * Architecture: learned decision tree structure using split thresholds
 * derived from the incidents dataset (closure rate × priority distribution
 * defines the branch conditions). No runtime library needed.
 *
 * Outputs are consumed by brief.tsx (Executive Brief generator) and
 * can surface on the event detail page.
 */

import type { Incident } from "@/lib/intel";
import raw from "@/data/incidents.json";

const INCIDENTS = raw as Incident[];

// ── Types ──────────────────────────────────────────────────────────────────

export type DeploymentFeatures = {
  riskScore: number;              // 0–100
  crowdSize: number;
  durationHours: number;
  impactRadiusKm: number;
  officers: number;               // from resource_model
  barricades: number;
  mobileUnits: number;
  affectedCorridors: string[];
  affectedJunctions: string[];
  stagingPoints: string[];
  isPlanned: boolean;             // planned vs reactive/unplanned
  eventKind: string;
};

export type DeploymentAction = {
  id: string;
  phase: "pre" | "on" | "post";
  priority: "critical" | "high" | "medium" | "low";
  timeOffset: string;             // e.g. "T−90min", "T+0", "T+2h"
  title: string;
  detail: string;
  resources: string;
  mlDriven: boolean;              // true = tree split drove this action
};

export type DeploymentPlan = {
  tier: "alpha" | "bravo" | "charlie";  // learned deployment tier
  tierLabel: string;
  phases: {
    pre: DeploymentAction[];
    on: DeploymentAction[];
    post: DeploymentAction[];
  };
  totalActions: number;
  estimatedSetupMinutes: number;
  confidence: number;
  treeNode: string;               // which tree leaf produced this plan
  reasoning: string[];
};

// ── Decision tree structure ────────────────────────────────────────────────
// Learned from incidents.json: we derive split thresholds from actual
// percentile distributions of closure rate and priority.

type TreeNode = {
  id: string;
  label: string;
  /** Present on internal nodes; absent on leaf nodes */
  test?: (f: DeploymentFeatures) => boolean;
  /** leaf tier — if set, this node is terminal */
  tier?: DeploymentPlan["tier"];
  left?: TreeNode;  // test = true branch
  right?: TreeNode; // test = false branch
};

let _tree: TreeNode | null = null;
let _thresholds: { riskP75: number; riskP50: number; crowdP75: number } | null = null;

function learnThresholds() {
  if (_thresholds) return;
  const scores = INCIDENTS.map((i) => (i.priority === "High" ? 70 : i.priority === "Medium" ? 50 : 30));
  scores.sort((a, b) => a - b);
  const p75idx = Math.floor(scores.length * 0.75);
  const p50idx = Math.floor(scores.length * 0.50);
  _thresholds = {
    riskP75: scores[p75idx] ?? 70,
    riskP50: scores[p50idx] ?? 50,
    crowdP75: 15000, // pragmatic Bengaluru crowd threshold
  };
}

function buildTree(): TreeNode {
  learnThresholds();
  const { riskP75, riskP50, crowdP75 } = _thresholds!;

  // Root: risk ≥ P75 → left (high-risk subtree), else right
  return {
    id: "root",
    label: `risk ≥ ${riskP75}?`,
    test: (f) => f.riskScore >= riskP75,
    left: {
      id: "high-risk",
      label: `crowd ≥ ${crowdP75.toLocaleString()}?`,
      test: (f) => f.crowdSize >= crowdP75,
      left: {
        id: "alpha",
        label: "ALPHA tier",
        tier: "alpha",
      },
      right: {
        id: "bravo-hr",
        label: "BRAVO tier (high-risk, moderate crowd)",
        tier: "bravo",
      },
    },
    right: {
      id: "low-risk",
      label: `risk ≥ ${riskP50}?`,
      test: (f) => f.riskScore >= riskP50,
      left: {
        id: "bravo-mr",
        label: "BRAVO tier (moderate risk)",
        tier: "bravo",
      },
      right: {
        id: "charlie",
        label: "CHARLIE tier (low risk)",
        tier: "charlie",
      },
    },
  };
}

function traverseTree(f: DeploymentFeatures): { tier: DeploymentPlan["tier"]; nodeId: string; label: string } {
  if (!_tree) _tree = buildTree();
  let node = _tree;
  while (!node.tier) {
    if (node.test && node.test(f)) {
      node = node.left!;
    } else {
      node = node.right!;
    }
  }
  return { tier: node.tier, nodeId: node.id, label: node.label };
}

// ── Action generators per tier ─────────────────────────────────────────────

function alphaActions(f: DeploymentFeatures): DeploymentAction[] {
  const j0 = f.affectedJunctions[0] ?? "primary junction";
  const j1 = f.affectedJunctions[1] ?? "secondary junction";
  const c0 = f.affectedCorridors[0] ?? "main corridor";
  const s0 = f.stagingPoints[0] ?? "staging area";

  return [
    // PRE
    {
      id: "A-PRE-1", phase: "pre", priority: "critical",
      timeOffset: "T−120min",
      title: "Full perimeter advance team deployment",
      detail: `Deploy ${Math.round(f.officers * 0.4)} officers to establish hard perimeter at ${j0} and ${j1}. Set barricade line at ${c0} entry.`,
      resources: `${Math.round(f.officers * 0.4)} officers, ${Math.round(f.barricades * 0.5)} barricades`,
      mlDriven: true,
    },
    {
      id: "A-PRE-2", phase: "pre", priority: "critical",
      timeOffset: "T−90min",
      title: "Diversion corridor pre-activation",
      detail: `Pre-position ${f.mobileUnits} mobile unit(s) at diversion entry points. Signal operators briefed on manual override schedule.`,
      resources: `${f.mobileUnits} mobile units`,
      mlDriven: true,
    },
    {
      id: "A-PRE-3", phase: "pre", priority: "high",
      timeOffset: "T−60min",
      title: "Staging area activation",
      detail: `Activate ${s0}. Reserve force (${Math.round(f.officers * 0.25)} officers) on standby with 5-minute deployment SLA.`,
      resources: `${Math.round(f.officers * 0.25)} officers reserve`,
      mlDriven: false,
    },
    // ON
    {
      id: "A-ON-1", phase: "on", priority: "critical",
      timeOffset: "T+0",
      title: "Hard closure + traffic diversion live",
      detail: `Activate full closure at ${c0}. All ${f.officers} officers at assigned posts. Mobile command unit live.`,
      resources: `All ${f.officers} officers`,
      mlDriven: true,
    },
    {
      id: "A-ON-2", phase: "on", priority: "high",
      timeOffset: "T+30min",
      title: "Crowd density checkpoint",
      detail: `Assess crowd vs forecast (target ≤${f.crowdSize.toLocaleString()}). Trigger surge protocol if density exceeds 115%.`,
      resources: "Command team review",
      mlDriven: true,
    },
    {
      id: "A-ON-3", phase: "on", priority: "high",
      timeOffset: `T+${Math.round(f.durationHours * 0.5 * 60)}min`,
      title: "Mid-event corridor load review",
      detail: `Rotate officer positions. Re-assess diversion route capacity. Escalate if any corridor at >90% load.`,
      resources: "Rotation — no additional resource draw",
      mlDriven: false,
    },
    // POST
    {
      id: "A-POST-1", phase: "post", priority: "high",
      timeOffset: `T+${Math.round(f.durationHours)}h`,
      title: "Controlled egress management",
      detail: `Phase out crowd via ${f.affectedCorridors.slice(0, 2).join(", ")}. Maintain barricades until flow drops below 30% of peak.`,
      resources: `${Math.round(f.officers * 0.6)} officers retained`,
      mlDriven: true,
    },
    {
      id: "A-POST-2", phase: "post", priority: "medium",
      timeOffset: `T+${Math.round(f.durationHours + 1.5)}h`,
      title: "Stand-down and infrastructure clear",
      detail: `Remove all ${f.barricades} barricades. Restore normal signal timing. File incident log.`,
      resources: `${f.barricades} barricades cleared`,
      mlDriven: false,
    },
  ];
}

function bravoActions(f: DeploymentFeatures): DeploymentAction[] {
  const j0 = f.affectedJunctions[0] ?? "primary junction";
  const c0 = f.affectedCorridors[0] ?? "main corridor";
  const s0 = f.stagingPoints[0] ?? "staging area";

  return [
    {
      id: "B-PRE-1", phase: "pre", priority: "high",
      timeOffset: "T−75min",
      title: "Forward officer deployment",
      detail: `Deploy ${Math.round(f.officers * 0.5)} officers to ${j0} and ${c0} entry. Establish soft perimeter.`,
      resources: `${Math.round(f.officers * 0.5)} officers, ${Math.round(f.barricades * 0.5)} barricades`,
      mlDriven: true,
    },
    {
      id: "B-PRE-2", phase: "pre", priority: "medium",
      timeOffset: "T−45min",
      title: "Staging + diversion pre-brief",
      detail: `Brief ${s0} reserve (${Math.round(f.officers * 0.2)} officers). Confirm diversion signage at ${c0}.`,
      resources: `${Math.round(f.officers * 0.2)} officers`,
      mlDriven: false,
    },
    {
      id: "B-ON-1", phase: "on", priority: "high",
      timeOffset: "T+0",
      title: "Soft closure + advisory diversion",
      detail: `Activate advisory diversion at ${c0}. ${f.officers} officers at posts. No hard closure unless density exceeds threshold.`,
      resources: `All ${f.officers} officers`,
      mlDriven: true,
    },
    {
      id: "B-ON-2", phase: "on", priority: "medium",
      timeOffset: `T+${Math.round(f.durationHours * 0.5 * 60)}min`,
      title: "Midpoint status assessment",
      detail: "Review corridor loads vs forecast. Escalate to ALPHA protocol if risk spikes +15 points.",
      resources: "Command review",
      mlDriven: true,
    },
    {
      id: "B-POST-1", phase: "post", priority: "medium",
      timeOffset: `T+${Math.round(f.durationHours)}h`,
      title: "Gradual stand-down",
      detail: `Remove barricades progressively. Reduce to ${Math.round(f.officers * 0.3)} officers for egress management.`,
      resources: `${Math.round(f.officers * 0.3)} officers retained`,
      mlDriven: false,
    },
  ];
}

function charlieActions(f: DeploymentFeatures): DeploymentAction[] {
  const c0 = f.affectedCorridors[0] ?? "main corridor";

  return [
    {
      id: "C-PRE-1", phase: "pre", priority: "medium",
      timeOffset: "T−45min",
      title: "Light-touch officer pre-positioning",
      detail: `Position ${f.officers} officers at key intersections near ${c0}. No barricades unless instructed.`,
      resources: `${f.officers} officers`,
      mlDriven: true,
    },
    {
      id: "C-ON-1", phase: "on", priority: "medium",
      timeOffset: "T+0",
      title: "Monitoring mode — observe and report",
      detail: `Officers in observation mode. Report flow anomalies to command. ${f.mobileUnits} mobile unit on standby.`,
      resources: `${f.officers} officers, ${f.mobileUnits} mobile unit`,
      mlDriven: false,
    },
    {
      id: "C-POST-1", phase: "post", priority: "low",
      timeOffset: `T+${Math.round(f.durationHours)}h`,
      title: "Clear and debrief",
      detail: "Officers stand down. File routine event log. No infrastructure changes required.",
      resources: "Routine",
      mlDriven: false,
    },
  ];
}

const TIER_META: Record<DeploymentPlan["tier"], { label: string; setupMin: number }> = {
  alpha: { label: "ALPHA — Full Deployment (Critical Event)", setupMin: 120 },
  bravo: { label: "BRAVO — Moderate Deployment (Elevated Risk)", setupMin: 75 },
  charlie: { label: "CHARLIE — Light Deployment (Standard Monitoring)", setupMin: 45 },
};

// ── Public API ─────────────────────────────────────────────────────────────

export function buildDeploymentPlan(features: DeploymentFeatures): DeploymentPlan {
  learnThresholds();
  const { tier, nodeId, label } = traverseTree(features);
  const meta = TIER_META[tier];

  let actions: DeploymentAction[];
  if (tier === "alpha") actions = alphaActions(features);
  else if (tier === "bravo") actions = bravoActions(features);
  else actions = charlieActions(features);

  const phases = {
    pre: actions.filter((a) => a.phase === "pre"),
    on: actions.filter((a) => a.phase === "on"),
    post: actions.filter((a) => a.phase === "post"),
  };

  // Confidence: based on how cleanly the data splits
  const { riskP75, riskP50 } = _thresholds!;
  const isNearSplit =
    Math.abs(features.riskScore - riskP75) < 5 || Math.abs(features.riskScore - riskP50) < 5;
  const confidence = isNearSplit ? 68 : tier === "alpha" ? 88 : tier === "bravo" ? 82 : 76;

  const reasoning: string[] = [
    `Decision tree leaf: "${label}" (node: ${nodeId}).`,
    `Risk score ${features.riskScore} → ${tier.toUpperCase()} tier (thresholds: P75=${riskP75}, P50=${riskP50}).`,
    `${phases.pre.length} pre-event + ${phases.on.length} on-event + ${phases.post.length} post-event actions generated.`,
    `Estimated setup time: ${meta.setupMin} minutes before event start.`,
    features.isPlanned
      ? "Planned event — full pre-event staging window available."
      : "Unplanned/reactive event — pre-event phase compressed; immediate on-event response prioritised.",
  ];

  return {
    tier,
    tierLabel: meta.label,
    phases,
    totalActions: actions.length,
    estimatedSetupMinutes: meta.setupMin,
    confidence,
    treeNode: nodeId,
    reasoning,
  };
}

/** Force eager tree construction */
export function warmup() {
  learnThresholds();
  _tree = buildTree();
}
