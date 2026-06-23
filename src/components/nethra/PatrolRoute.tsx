import { useState, useMemo } from 'react';
import { solveTSP, getVisitSequence } from '@/lib/tsp';
import { calculateDistanceMatrix } from '@/lib/dijkstra';
import { createBengaluruRoadGraph, findNearestNode, getPathCoordinates } from '@/lib/graph';
import { getEvents } from '@/lib/intel';
import { logAudit } from '@/lib/audit';
import { Route as RouteIcon, Clock, MapPin, Navigation, Play } from 'lucide-react';

export function PatrolRoute() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [roadGraph] = useState(() => createBengaluruRoadGraph());
  const events = getEvents();

  const availableEvents = events.filter(e => e.status === 'live' || e.status === 'deployed');

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const patrolResult = useMemo(() => {
    if (selectedEvents.length < 2) return null;

    const startTime = performance.now();
    
    // Get nearest nodes for each event
    const nodeIds: string[] = [];
    const eventNodes: Map<string, string> = new Map();
    
    selectedEvents.forEach(eventId => {
      const event = events.find(e => e.id === eventId);
      if (event) {
        const nearestNode = findNearestNode(roadGraph, event.lat, event.lng);
        if (nearestNode) {
          nodeIds.push(nearestNode.id);
          eventNodes.set(nearestNode.id, eventId);
        }
      }
    });

    if (nodeIds.length < 2) return null;

    // Calculate distance matrix
    const distanceMatrix = calculateDistanceMatrix(roadGraph, nodeIds);
    
    // Solve TSP
    const tspResult = solveTSP(distanceMatrix);
    
    // Get visit sequence with event IDs
    const visitSequence = tspResult.route.map(idx => eventNodes.get(nodeIds[idx]));
    
    // Get coordinates for the route
    const routeCoordinates: [number, number][] = [];
    visitSequence.forEach(eventId => {
      if (eventId) {
        const event = events.find(e => e.id === eventId);
        if (event) {
          routeCoordinates.push([event.lat, event.lng]);
        }
      }
    });

    const responseTime = performance.now() - startTime;
    logAudit('patrol_route', {
      eventIds: selectedEvents,
      totalDistance: tspResult.totalDistance,
      travelTime: tspResult.travelTime
    }, responseTime);

    return {
      ...tspResult,
      visitSequence,
      routeCoordinates,
    };
  }, [selectedEvents, events, roadGraph]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Patrol Route Optimizer</h3>
        </div>
        {selectedEvents.length >= 2 && (
          <span className="text-xs text-muted-foreground">
            {selectedEvents.length} events selected
          </span>
        )}
      </div>

      {/* Event Selection */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Select active events to patrol:</div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {availableEvents.map(event => (
            <button
              key={event.id}
              onClick={() => toggleEvent(event.id)}
              className={`w-full text-left px-3 py-2 rounded-md border transition ${
                selectedEvents.includes(event.id)
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-muted/50 border-border/50 hover:bg-muted/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm truncate">{event.name}</span>
                {selectedEvents.includes(event.id) && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">{event.address}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {patrolResult && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Play className="w-4 h-4" />
            <span className="text-sm font-semibold">Optimized Route</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <RouteIcon className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Total Distance</div>
                <div className="text-sm font-semibold">{patrolResult.totalDistance.toFixed(2)} km</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Travel Time</div>
                <div className="text-sm font-semibold">{formatTime(patrolResult.travelTime)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Visit Sequence:</div>
            <div className="space-y-1">
              {patrolResult.visitSequence.map((eventId, index) => {
                if (!eventId) return null;
                const event = events.find(e => e.id === eventId);
                if (!event) return null;
                return (
                  <div key={eventId} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-mono">
                      {index + 1}
                    </div>
                    <span className="truncate">{event.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedEvents.length > 0 && selectedEvents.length < 2 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Select at least 2 events to optimize patrol route
        </div>
      )}

      {availableEvents.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No active events available for patrol routing
        </div>
      )}
    </div>
  );
}
