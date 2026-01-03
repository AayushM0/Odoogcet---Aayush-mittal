import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const db = await getDb();

    const notification = await db.collection('notifications').findOne({
      _id: new ObjectId(params.id),
      userId: user._id,
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await db.collection('notifications').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
