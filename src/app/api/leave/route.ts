import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { requestLeave, getLeavesForEmployee, getAllLeaves } from '@/lib/services/leaveService';
import { LeaveType } from '@/models/Leave';

export async function GET() {
  try {
    const user = await requireAuth();

    let leaves;
    if (user.role === 'admin') {
      leaves = await getAllLeaves();
      
      // Populate employee names
      const { getDb } = await import('@/lib/db');
      const db = await getDb();
      const leavesWithEmployees = await db.collection('leaves').aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        { $sort: { createdAt: -1 } },
      ]).toArray();
      
      return NextResponse.json({ leaves: leavesWithEmployees });
    } else {
      leaves = await getLeavesForEmployee(user._id!);
      return NextResponse.json({ leaves });
    }
  } catch (error: any) {
    console.error('Get leaves error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    if (user.role !== 'employee') {
      return NextResponse.json(
        { error: 'Only employees can request leave' },
        { status: 403 }
      );
    }

    const { leaveType, startDate, endDate, reason } = await request.json();

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'leaveType, startDate, endDate, and reason are required' },
        { status: 400 }
      );
    }

    const leave = await requestLeave(
      user._id!,
      leaveType as LeaveType,
      new Date(startDate),
      new Date(endDate),
      reason
    );

    return NextResponse.json({ leave });
  } catch (error: any) {
    console.error('Request leave error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.includes('Insufficient')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
