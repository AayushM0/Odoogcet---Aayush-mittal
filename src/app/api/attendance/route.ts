import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { markAttendance, getAttendanceForEmployee } from '@/lib/services/attendanceService';
import { ObjectId } from 'mongodb';
import { AttendanceStatus } from '@/models/Attendance';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let targetEmployeeId: ObjectId;

    if (user.role === 'admin') {
      // Admin can view any employee's attendance
      if (employeeId) {
        targetEmployeeId = new ObjectId(employeeId);
      } else {
        // Return all attendance
        const db = await getDb();
        const attendance = await db
          .collection('attendance')
          .aggregate([
            {
              $lookup: {
                from: 'users',
                localField: 'employeeId',
                foreignField: '_id',
                as: 'employee',
              },
            },
            { $unwind: '$employee' },
            { $sort: { date: -1 } },
          ])
          .toArray();
        return NextResponse.json({ attendance });
      }
    } else {
      // Employees can only view their own attendance
      targetEmployeeId = user._id!;
    }

    const attendance = await getAttendanceForEmployee(
      targetEmployeeId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({ attendance });
  } catch (error: any) {
    console.error('Get attendance error:', error);
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
    const admin = await requireAdmin();
    const { employeeId, date, status, notes } = await request.json();

    if (!employeeId || !date || !status) {
      return NextResponse.json(
        { error: 'employeeId, date, and status are required' },
        { status: 400 }
      );
    }

    const attendance = await markAttendance(
      new ObjectId(employeeId),
      new Date(date),
      status as AttendanceStatus,
      admin._id!,
      notes || null
    );

    return NextResponse.json({ attendance });
  } catch (error: any) {
    console.error('Mark attendance error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
