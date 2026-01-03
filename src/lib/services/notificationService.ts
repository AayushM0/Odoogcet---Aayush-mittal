import { getDb } from '../db';
import { Notification, NotificationType, EntityType } from '@/models/Notification';
import { ObjectId } from 'mongodb';

export async function createNotification(
  userId: ObjectId,
  type: NotificationType,
  title: string,
  message: string,
  relatedEntity?: { entityType: EntityType; entityId: ObjectId }
): Promise<void> {
  const db = await getDb();
  
  const notification: Notification = {
    userId,
    type,
    title,
    message,
    relatedEntity: relatedEntity || null,
    isRead: false,
    createdAt: new Date(),
  };

  await db.collection('notifications').insertOne(notification);
}

export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  relatedEntity?: { entityType: EntityType; entityId: ObjectId }
): Promise<void> {
  const db = await getDb();
  const admins = await db.collection('users').find({ role: 'admin' }).toArray();
  
  for (const admin of admins) {
    await createNotification(admin._id!, type, title, message, relatedEntity);
  }
}
