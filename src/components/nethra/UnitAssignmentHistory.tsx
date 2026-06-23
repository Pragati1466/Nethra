import { usePulse, type UnitAssignment } from "@/lib/pulse";
import { Clock, User, MapPin, CheckCircle, XCircle } from "lucide-react";

type Props = {
  eventId: string;
  eventName: string;
};

export function UnitAssignmentHistory({ eventId, eventName }: Props) {
  const pulse = usePulse();
  
  const eventAssignments = pulse.assignments.filter(a => a.eventId === eventId);
  
  if (eventAssignments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No unit assignments recorded yet</p>
      </div>
    );
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status: UnitAssignment["status"]) => {
    switch (status) {
      case "assigned":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "arrived":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "released":
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: UnitAssignment["status"]) => {
    switch (status) {
      case "assigned":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">En Route</span>;
      case "arrived":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">On Scene</span>;
      case "released":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Released</span>;
    }
  };

  const sortedAssignments = [...eventAssignments].sort((a, b) => b.assignedAt - a.assignedAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Unit Assignment History</h3>
        <span className="text-xs text-muted-foreground">{eventAssignments.length} assignments</span>
      </div>
      
      <div className="space-y-2">
        {sortedAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(assignment.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {assignment.unitCallsign}
                    </span>
                    {getStatusBadge(assignment.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Assigned: {formatTimestamp(assignment.assignedAt)}</span>
                  </div>
                  
                  {assignment.releasedAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <XCircle className="w-3 h-3" />
                      <span>Released: {formatTimestamp(assignment.releasedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-muted-foreground">
                  {assignment.status === "released" && assignment.releasedAt
                    ? `Duration: ${Math.round((assignment.releasedAt - assignment.assignedAt) / 60000)}m`
                    : "Active"
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
