// Traveling Salesman Problem (TSP) solver for patrol route optimization
// Uses greedy nearest-neighbor initialization with 2-opt local search refinement

export type TSPResult = {
  route: number[]; // indices of nodes in visit order
  totalDistance: number;
  travelTime: number; // in seconds
};

// Greedy nearest-neighbor initialization
function greedyNearestNeighbor(distanceMatrix: number[][]): number[] {
  const n = distanceMatrix.length;
  const visited = new Set<number>();
  const route: number[] = [0]; // Start from first node
  visited.add(0);

  let current = 0;
  while (visited.size < n) {
    let nearest = -1;
    let minDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distanceMatrix[current][i] < minDist) {
        minDist = distanceMatrix[current][i];
        nearest = i;
      }
    }

    if (nearest !== -1) {
      route.push(nearest);
      visited.add(nearest);
      current = nearest;
    } else {
      break;
    }
  }

  return route;
}

// Calculate total distance of a route
function calculateRouteDistance(route: number[], distanceMatrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += distanceMatrix[route[i]][route[i + 1]];
  }
  // Return to start
  total += distanceMatrix[route[route.length - 1]][route[0]];
  return total;
}

// 2-opt local search refinement
function twoOpt(route: number[], distanceMatrix: number[][], maxIterations: number = 100): number[] {
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(bestRoute, distanceMatrix);
  let improved = true;
  let iterations = 0;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < route.length - 1; i++) {
      for (let j = i + 2; j < route.length; j++) {
        // Skip if the swap would reverse the entire route
        if (i === 0 && j === route.length - 1) continue;

        // Create new route by reversing segment between i and j
        const newRoute = [...bestRoute];
        const segment = newRoute.slice(i + 1, j + 1).reverse();
        newRoute.splice(i + 1, segment.length, ...segment);

        const newDistance = calculateRouteDistance(newRoute, distanceMatrix);

        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

// Main TSP solver
export function solveTSP(distanceMatrix: number[][]): TSPResult {
  if (distanceMatrix.length === 0) {
    return { route: [], totalDistance: 0, travelTime: 0 };
  }

  if (distanceMatrix.length === 1) {
    return { route: [0], totalDistance: 0, travelTime: 0 };
  }

  // Initialize with greedy NN
  const initialRoute = greedyNearestNeighbor(distanceMatrix);
  
  // Refine with 2-opt
  const optimizedRoute = twoOpt(initialRoute, distanceMatrix);
  
  const totalDistance = calculateRouteDistance(optimizedRoute, distanceMatrix);
  
  // Assume average speed of 40 km/h for patrol
  const travelTime = (totalDistance / 40) * 3600; // Convert to seconds

  return {
    route: optimizedRoute,
    totalDistance,
    travelTime,
  };
}

// Get ordered visit sequence from TSP result
export function getVisitSequence(tspResult: TSPResult, nodeIds: string[]): string[] {
  return tspResult.route.map((index) => nodeIds[index]);
}
