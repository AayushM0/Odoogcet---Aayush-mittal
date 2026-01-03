import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { reviewLeave } from '@/lib/services/leaveService';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const { action, adminComment } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approve/reject) is required' },
        { status: 400 }
      );
    }

    const leave = await reviewLeave(
      new ObjectId(params.id),
      admin._id!,
      action,
      adminComment || null
    );

    return NextResponse.json({ leave });
  } catch (error: any) {
    console.error('Review leave error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.includes('already') || error.message.includes('finality')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
