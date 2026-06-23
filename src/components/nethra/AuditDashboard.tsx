import { useEffect, useState } from 'react';
import { getAuditLogs, getAuditStats, exportAuditLogs, type AuditRecord } from '@/lib/audit';
import { Download, Filter, RefreshCw, Database } from 'lucide-react';

export function AuditDashboard() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    logsByEventType: {} as Record<string, number>,
    averageResponseTime: 0,
  });
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        getAuditLogs(filter ? { eventType: filter, limit: 50 } : { limit: 50 }),
        getAuditStats(),
      ]);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const handleExport = async () => {
    const data = await exportAuditLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nethra-audit-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const eventTypeColors: Record<string, string> = {
    'prediction': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'diversion': 'bg-green-500/20 text-green-400 border-green-500/30',
    'deployment': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'patrol_route': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'risk_assessment': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">Audit Trail</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadLogs()}
            className="p-2 rounded-md hover:bg-accent/50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-md hover:bg-accent/50 transition"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground">Total Logs</div>
          <div className="text-lg font-semibold">{stats.totalLogs}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground">Event Types</div>
          <div className="text-lg font-semibold">{Object.keys(stats.logsByEventType).length}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground">Avg Response</div>
          <div className="text-lg font-semibold">{stats.averageResponseTime.toFixed(0)}ms</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm"
        >
          <option value="">All Events</option>
          <option value="prediction">Predictions</option>
          <option value="diversion">Diversions</option>
          <option value="deployment">Deployments</option>
          <option value="patrol_route">Patrol Routes</option>
          <option value="risk_assessment">Risk Assessments</option>
        </select>
      </div>

      {/* Logs */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No audit logs found</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/70 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        eventTypeColors[log.eventType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}
                    >
                      {log.eventType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {JSON.stringify(log.payload).slice(0, 100)}...
                  </div>
                  {log.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Response: {log.responseTime}ms
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event type breakdown */}
      {Object.keys(stats.logsByEventType).length > 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-xs text-muted-foreground mb-2">Event Type Distribution</div>
          <div className="space-y-1">
            {Object.entries(stats.logsByEventType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-xs">
                <span className="capitalize">{type.replace('_', ' ')}</span>
                <span className="font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
