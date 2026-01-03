import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    const db = await getDb();

    const notifications = await db
      .collection('notifications')
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
