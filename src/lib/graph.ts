// Road graph structure for diversion routing
// Uses ngraph.graph for efficient graph operations

import createGraph from 'ngraph.graph';

export type GraphNode = {
  id: string;
  lat: number;
  lng: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight: number; // travel time in seconds
  roadName?: string;
};

export type RoadGraph = {
  graph: any;
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
};

// Create a simplified road graph for Bengaluru
// In production, this would fetch from OSM via Overpass API
export function createBengaluruRoadGraph(): RoadGraph {
  const graph = createGraph();
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  // Major Bengaluru corridors as a simplified graph
  // This is a placeholder - production would use real OSM data
  const corridors = [
    // ORR (Outer Ring Road)
    { from: [12.85, 77.55], to: [12.95, 77.50], name: "ORR West" },
    { from: [12.95, 77.50], to: [13.05, 77.50], name: "ORR North" },
    { from: [13.05, 77.50], to: [13.10, 77.60], name: "ORR East" },
    { from: [13.10, 77.60], to: [13.06, 77.72], name: "ORR Northeast" },
    { from: [13.06, 77.72], to: [12.95, 77.76], name: "ORR Southeast" },
    { from: [12.95, 77.76], to: [12.85, 77.70], name: "ORR South" },
    { from: [12.85, 77.70], to: [12.85, 77.55], name: "ORR Southwest" },
    
    // Radial roads
    { from: [12.97, 77.59], to: [13.18, 77.45], name: "Tumkur Road" },
    { from: [12.97, 77.59], to: [13.18, 77.59], name: "Bellary Road" },
    { from: [12.97, 77.59], to: [12.99, 77.78], name: "Old Madras Road" },
    { from: [12.97, 77.59], to: [12.82, 77.70], name: "Hosur Road" },
    { from: [12.97, 77.59], to: [12.85, 77.45], name: "Mysore Road" },
    { from: [12.97, 77.59], to: [12.99, 77.46], name: "Magadi Road" },
    { from: [12.97, 77.59], to: [12.82, 77.58], name: "Bannerghatta Road" },
    
    // Inner ring
    { from: [12.95, 77.50], to: [12.97, 77.59], name: "Inner Ring West" },
    { from: [12.97, 77.59], to: [12.99, 77.78], name: "Inner Ring East" },
    { from: [12.99, 77.78], to: [12.95, 77.76], name: "Inner Ring Southeast" },
    { from: [12.95, 77.76], to: [12.85, 77.70], name: "Inner Ring South" },
    { from: [12.85, 77.70], to: [12.85, 77.55], name: "Inner Ring Southwest" },
    { from: [12.85, 77.55], to: [12.95, 77.50], name: "Inner Ring Northwest" },
  ];

  // Add nodes and edges
  corridors.forEach((corridor, idx) => {
    const fromId = `node-${idx * 2}`;
    const toId = `node-${idx * 2 + 1}`;
    
    const fromNode: GraphNode = {
      id: fromId,
      lat: corridor.from[0] as number,
      lng: corridor.from[1] as number,
    };
    
    const toNode: GraphNode = {
      id: toId,
      lat: corridor.to[0] as number,
      lng: corridor.to[1] as number,
    };
    
    nodes.set(fromId, fromNode);
    nodes.set(toId, toNode);
    
    graph.addNode(fromId, fromNode);
    graph.addNode(toId, toNode);
    
    // Calculate weight (approximate travel time based on distance)
    const distance = haversineDistance(corridor.from as [number, number], corridor.to as [number, number]);
    const weight = (distance / 40) * 3600; // Assume 40 km/h average speed
    
    const edge: GraphEdge = {
      from: fromId,
      to: toId,
      weight,
      roadName: corridor.name,
    };
    
    edges.push(edge);
    graph.addLink(fromId, toId, weight);
    
    // Add reverse edge for bidirectional roads
    graph.addLink(toId, fromId, weight);
  });

  // Add some intersection nodes for connectivity
  const intersections = [
    { lat: 12.97, lng: 77.59, name: "City Center" },
    { lat: 12.95, lng: 77.50, name: "ORR West Junction" },
    { lat: 13.05, lng: 77.50, name: "ORR North Junction" },
    { lat: 12.85, lng: 77.70, name: "ORR South Junction" },
  ];

  intersections.forEach((intersection, idx) => {
    const id = `intersection-${idx}`;
    const node: GraphNode = {
      id,
      lat: intersection.lat,
      lng: intersection.lng,
    };
    nodes.set(id, node);
    graph.addNode(id, node);
  });

  return { graph, nodes, edges };
}

// Find nearest node to a given lat/lng
export function findNearestNode(graph: RoadGraph, lat: number, lng: number): GraphNode | null {
  let nearest: GraphNode | null = null;
  let minDist = Infinity;

  graph.nodes.forEach((node) => {
    const dist = haversineDistance([node.lat, node.lng], [lat, lng]);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  });

  return nearest;
}

// Sever edges at a given location (simulating road blockage)
export function severEdgesAtLocation(graph: RoadGraph, lat: number, lng: number, radiusKm: number = 0.5): string[] {
  const severedEdges: string[] = [];
  const nearestNode = findNearestNode(graph, lat, lng);

  if (!nearestNode) return severedEdges;

  // Remove all edges connected to the nearest node
  const links = graph.graph.getLinks(nearestNode.id);
  links?.forEach((link: any) => {
    severedEdges.push(`${link.fromId}-${link.toId}`);
    graph.graph.removeLink(link.fromId, link.toId);
  });

  return severedEdges;
}

// Restore severed edges
export function restoreEdges(graph: RoadGraph, edges: GraphEdge[]): void {
  edges.forEach((edge) => {
    graph.graph.addLink(edge.from, edge.to, edge.weight);
  });
}

// Haversine distance calculation
function haversineDistance(from: [number, number], to: [number, number]): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((to[0] - from[0]) * Math.PI) / 180;
  const dLng = ((to[1] - from[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from[0] * Math.PI) / 180) *
      Math.cos((to[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get path coordinates from node IDs
export function getPathCoordinates(graph: RoadGraph, path: string[]): [number, number][] {
  const coordinates: [number, number][] = [];
  path.forEach((nodeId) => {
    const node = graph.nodes.get(nodeId);
    if (node) {
      coordinates.push([node.lat, node.lng]);
    }
  });
  return coordinates;
}
