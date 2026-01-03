import { getDb } from '../db';
import { Leave, LeaveType, LeaveStatus } from '@/models/Leave';
import { ObjectId } from 'mongodb';
import { createAuditLog } from './auditService';
import { createNotification, notifyAdmins } from './notificationService';

function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

export async function requestLeave(
  employeeId: ObjectId,
  leaveType: LeaveType,
  startDate: Date,
  endDate: Date,
  reason: string
): Promise<Leave> {
  const db = await getDb();
  
  // Validate balance
  const user = await db.collection('users').findOne({ _id: employeeId });
  if (!user) {
    throw new Error('Employee not found');
  }

  const daysRequested = calculateLeaveDays(startDate, endDate);
  
  if (user.leaveBalances[leaveType] < daysRequested) {
    throw new Error(`Insufficient ${leaveType} leave balance. Available: ${user.leaveBalances[leaveType]}, Requested: ${daysRequested}`);
  }

  const leave: Leave = {
    employeeId,
    leaveType,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    adminComment: null,
    daysRequested,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('leaves').insertOne(leave);
  leave._id = result.insertedId;

  // Create audit log
  await createAuditLog(
    employeeId,
    'leave.requested',
    'leave',
    leave._id,
    { before: null, after: leave }
  );

  // Notify admins
  await notifyAdmins(
    'leave',
    'New Leave Request',
    `${user.name} has requested ${daysRequested} day(s) of ${leaveType} leave`,
    { entityType: 'leave', entityId: leave._id }
  );

  return leave;
}

export async function reviewLeave(
  leaveId: ObjectId,
  reviewedBy: ObjectId,
  action: 'approve' | 'reject',
  adminComment: string | null = null
): Promise<Leave> {
  const db = await getDb();
  
  const leave = await db.collection<Leave>('leaves').findOne({ _id: leaveId });
  if (!leave) {
    throw new Error('Leave request not found');
  }

  // Enforce leave finality
  if (leave.status !== 'pending') {
    throw new Error(`Leave already ${leave.status}. Cannot change status (leave finality rule)`);
  }

  const beforeState = { ...leave };
  const newStatus: LeaveStatus = action === 'approve' ? 'approved' : 'rejected';

  if (action === 'approve') {
    // Double-check balance
    const user = await db.collection('users').findOne({ _id: leave.employeeId });
    if (!user) {
      throw new Error('Employee not found');
    }

    if (user.leaveBalances[leave.leaveType] < leave.daysRequested) {
      throw new Error('Insufficient leave balance');
    }

    // Start transaction: update leave and deduct balance atomically
    const session = db.client.startSession();
    try {
      await session.withTransaction(async () => {
        // Update leave status
        await db.collection('leaves').updateOne(
          { _id: leaveId },
          {
            $set: {
              status: newStatus,
              reviewedBy,
              reviewedAt: new Date(),
              adminComment,
              updatedAt: new Date(),
            },
          },
          { session }
        );

        // Deduct from balance
        const updateKey = `leaveBalances.${leave.leaveType}`;
        await db.collection('users').updateOne(
          { _id: leave.employeeId },
          { $inc: { [updateKey]: -leave.daysRequested } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  } else {
    // Reject: just update status
    await db.collection('leaves').updateOne(
      { _id: leaveId },
      {
        $set: {
          status: newStatus,
          reviewedBy,
          reviewedAt: new Date(),
          adminComment,
          updatedAt: new Date(),
        },
      }
    );
  }

  const updatedLeave = await db.collection<Leave>('leaves').findOne({ _id: leaveId });

  // Create audit log
  await createAuditLog(
    reviewedBy,
    `leave.${action}d`,
    'leave',
    leaveId,
    { before: beforeState, after: updatedLeave }
  );

  // Notify employee
  const employee = await db.collection('users').findOne({ _id: leave.employeeId });
  if (employee) {
    await createNotification(
      leave.employeeId,
      'leave',
      `Leave Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      `Your ${leave.leaveType} leave request for ${leave.daysRequested} day(s) has been ${action}d${adminComment ? `: ${adminComment}` : ''}`,
      { entityType: 'leave', entityId: leaveId }
    );
  }

  return updatedLeave!;
}

export async function getLeavesForEmployee(employeeId: ObjectId): Promise<Leave[]> {
  const db = await getDb();
  return db.collection<Leave>('leaves').find({ employeeId }).sort({ createdAt: -1 }).toArray();
}

export async function getAllLeaves(): Promise<Leave[]> {
  const db = await getDb();
  return db.collection<Leave>('leaves').find({}).sort({ createdAt: -1 }).toArray();
}
