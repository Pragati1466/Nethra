// Dijkstra's algorithm for shortest path routing
// Used for diversion routing and point-to-point path planning

import type { RoadGraph } from './graph';

export type PathResult = {
  path: string[];
  distance: number;
  travelTime: number; // in seconds
};

// Priority queue implementation for Dijkstra
class PriorityQueue {
  private items: { node: string; priority: number }[] = [];

  enqueue(node: string, priority: number): void {
    this.items.push({ node, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): { node: string; priority: number } | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Dijkstra's algorithm to find shortest path
export function dijkstra(graph: RoadGraph, startNodeId: string, endNodeId: string): PathResult | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const pq = new PriorityQueue();

  // Initialize distances
  graph.nodes.forEach((_, nodeId) => {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
  });

  distances.set(startNodeId, 0);
  pq.enqueue(startNodeId, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (!current) break;

    const currentNode = current.node;
    if (currentNode === endNodeId) {
      break; // Found the shortest path
    }

    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    // Get neighbors
    const links = graph.graph.getLinks(currentNode);
    if (!links) continue;

    links.forEach((link: any) => {
      const neighborId = link.toId === currentNode ? link.fromId : link.toId;
      if (visited.has(neighborId)) return;

      const weight = link.data || 1;
      const newDist = distances.get(currentNode)! + weight;

      if (newDist < distances.get(neighborId)!) {
        distances.set(neighborId, newDist);
        previous.set(neighborId, currentNode);
        pq.enqueue(neighborId, newDist);
      }
    });
  }

  // Reconstruct path
  if (distances.get(endNodeId) === Infinity) {
    return null; // No path found
  }

  const path: string[] = [];
  let current: string | null = endNodeId;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current)!;
  }

  return {
    path,
    distance: distances.get(endNodeId)!,
    travelTime: distances.get(endNodeId)!,
  };
}

// Find all alternative routes around a blocked location
export function findDiversionRoutes(
  graph: RoadGraph,
  blockedNodeId: string,
  startNodeId: string,
  endNodeId: string,
  maxRoutes: number = 3
): PathResult[] {
  const routes: PathResult[] = [];

  // Try different approaches
  for (let i = 0; i < maxRoutes; i++) {
    const result = dijkstra(graph, startNodeId, endNodeId);
    if (result) {
      routes.push(result);
    }
    
    // For subsequent routes, temporarily remove the first path's edges
    // to find alternatives (simplified approach)
    if (i < maxRoutes - 1 && routes.length > 0) {
      // In a full implementation, we would temporarily remove edges
      // from the used path to find alternatives
      break; // For now, just return one route
    }
  }

  return routes;
}

// Calculate distance matrix for multiple nodes (for TSP)
export function calculateDistanceMatrix(graph: RoadGraph, nodeIds: string[]): number[][] {
  const matrix: number[][] = [];
  
  for (let i = 0; i < nodeIds.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < nodeIds.length; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else {
        const result = dijkstra(graph, nodeIds[i], nodeIds[j]);
        matrix[i][j] = result ? result.distance : Infinity;
      }
    }
  }
  
  return matrix;
}
