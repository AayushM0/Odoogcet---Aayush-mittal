import { ObjectId } from 'mongodb';

export type NotificationType = 'leave' | 'payroll' | 'system';
export type EntityType = 'leave' | 'payroll' | 'user';

export interface NotificationRelatedEntity {
  entityType: EntityType;
  entityId: ObjectId;
}

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity: NotificationRelatedEntity | null;
  isRead: boolean;
  createdAt: Date;
}
