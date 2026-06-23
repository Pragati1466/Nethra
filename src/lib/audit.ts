// Immutable audit trail using IndexedDB via Dexie
// Logs all system actions for accountability and debugging

import Dexie, { Table } from 'dexie';

export type AuditRecord = {
  id?: number;
  timestamp: string;
  eventType: string;
  userId?: string;
  payload: any;
  responseTime?: number; // in milliseconds
};

class AuditDatabase extends Dexie {
  auditLogs!: Table<AuditRecord, number>;

  constructor() {
    super('NethraAuditDB');
    this.version(1).stores({
      auditLogs: '++id, timestamp, eventType, userId',
    });
  }
}

const db = new AuditDatabase();

// Log an audit record (fire-and-forget, doesn't block)
export async function logAudit(eventType: string, payload: any, responseTime?: number): Promise<void> {
  try {
    await db.auditLogs.add({
      timestamp: new Date().toISOString(),
      eventType,
      payload,
      responseTime,
    });
  } catch (error) {
    console.error('Failed to log audit record:', error);
  }
}

// Get audit logs with optional filtering
export async function getAuditLogs(options?: {
  eventType?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditRecord[]> {
  try {
    let query = db.auditLogs.orderBy('timestamp').reverse();

    if (options?.eventType) {
      query = query.filter((log) => log.eventType === options.eventType);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query.toArray();
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

// Get aggregate statistics
export async function getAuditStats(): Promise<{
  totalLogs: number;
  logsByEventType: Record<string, number>;
  averageResponseTime: number;
}> {
  try {
    const logs = await db.auditLogs.toArray();
    
    const logsByEventType: Record<string, number> = {};
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    logs.forEach((log) => {
      logsByEventType[log.eventType] = (logsByEventType[log.eventType] || 0) + 1;
      if (log.responseTime) {
        totalResponseTime += log.responseTime;
        responseTimeCount++;
      }
    });

    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return {
      totalLogs: logs.length,
      logsByEventType,
      averageResponseTime,
    };
  } catch (error) {
    console.error('Failed to fetch audit stats:', error);
    return {
      totalLogs: 0,
      logsByEventType: {},
      averageResponseTime: 0,
    };
  }
}

// Clear old audit logs (keep last 1000)
export async function cleanupOldLogs(): Promise<void> {
  try {
    const allLogs = await db.auditLogs.orderBy('id').reverse().toArray();
    if (allLogs.length > 1000) {
      const toDelete = allLogs.slice(1000);
      await db.auditLogs.bulkDelete(toDelete.map((log) => log.id!));
    }
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
  }
}

// Export audit logs as JSON
export async function exportAuditLogs(): Promise<string> {
  try {
    const logs = await db.auditLogs.toArray();
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    return '[]';
  }
}
