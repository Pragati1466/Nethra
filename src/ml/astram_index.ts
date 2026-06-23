import type { Incident } from "@/lib/intel";
import { getTrainingData } from "@/lib/intel";

export type AstramIndex = {
  byJunction: Map<string, Incident[]>;
  byCorridor: Map<string, Incident[]>;
  byCause: Map<string, Incident[]>;
  all: Incident[];
};

let cached: AstramIndex | null = null;

function buildIndex(data: Incident[]): AstramIndex {
  const byJunction = new Map<string, Incident[]>();
  const byCorridor = new Map<string, Incident[]>();
  const byCause = new Map<string, Incident[]>();

  for (const inc of data) {
    if (inc.junction && inc.junction !== "NULL") {
      const cur = byJunction.get(inc.junction) ?? [];
      cur.push(inc);
      byJunction.set(inc.junction, cur);
    }
    if (inc.corridor) {
      const cur = byCorridor.get(inc.corridor) ?? [];
      cur.push(inc);
      byCorridor.set(inc.corridor, cur);
    }
    if (inc.cause) {
      const cur = byCause.get(inc.cause) ?? [];
      cur.push(inc);
      byCause.set(inc.cause, cur);
    }
  }

  return { byJunction, byCorridor, byCause, all: data };
}

export function getAstramIndex(): AstramIndex {
  if (cached) return cached;
  const data = getTrainingData();
  cached = buildIndex(data);
  return cached;
}

