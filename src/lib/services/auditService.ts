import { getDb } from '../db';
import { AuditLog, AuditEntityType } from '@/models/AuditLog';
import { ObjectId } from 'mongodb';

export async function createAuditLog(
  actor: ObjectId,
  action: string,
  entityType: AuditEntityType,
  entityId: ObjectId,
  changes: { before: any | null; after: any },
  metadata: { ip?: string; userAgent?: string; reason?: string } = {}
): Promise<void> {
  const db = await getDb();
  
  const auditLog: AuditLog = {
    actor,
    action,
    entityType,
    entityId,
    changes,
    metadata: {
      ip: metadata.ip || null,
      userAgent: metadata.userAgent || null,
      reason: metadata.reason || null,
    },
    timestamp: new Date(),
  };

  await db.collection('auditLogs').insertOne(auditLog);
}
