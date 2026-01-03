import { ObjectId } from 'mongodb';

export type AuditEntityType = 'user' | 'attendance' | 'leave' | 'payroll';

export interface AuditLogMetadata {
  ip: string | null;
  userAgent: string | null;
  reason: string | null;
}

export interface AuditLog {
  _id?: ObjectId;
  actor: ObjectId;
  action: string;
  entityType: AuditEntityType;
  entityId: ObjectId;
  changes: {
    before: any | null;
    after: any;
  };
  metadata: AuditLogMetadata;
  timestamp: Date;
}
