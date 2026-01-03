import { getDb } from '../db';
import { Attendance, AttendanceStatus } from '@/models/Attendance';
import { ObjectId } from 'mongodb';
import { createAuditLog } from './auditService';

export async function markAttendance(
  employeeId: ObjectId,
  date: Date,
  status: AttendanceStatus,
  markedBy: ObjectId,
  notes: string | null = null
): Promise<Attendance> {
  const db = await getDb();
  
  // Normalize date to start of day
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  const checkIn = status !== 'absent' ? new Date() : null;
  const checkOut = status === 'absent' ? null : null; // Will be set later or auto-checked out
  
  const attendance: Attendance = {
    employeeId,
    date: normalizedDate,
    status,
    checkIn,
    checkOut,
    autoCheckedOut: false,
    markedBy,
    notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Check if attendance already exists for this employee and date
  const existing = await db.collection('attendance').findOne({
    employeeId,
    date: normalizedDate,
  });

  if (existing) {
    // Update existing
    await db.collection('attendance').updateOne(
      { _id: existing._id },
      { $set: { status, checkIn, notes, updatedAt: new Date() } }
    );
    attendance._id = existing._id;
  } else {
    // Insert new
    const result = await db.collection('attendance').insertOne(attendance);
    attendance._id = result.insertedId;
  }

  // Create audit log
  await createAuditLog(
    markedBy,
    'attendance.marked',
    'attendance',
    attendance._id!,
    { before: existing || null, after: attendance }
  );

  return attendance;
}

export async function autoCheckout(): Promise<void> {
  const db = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const defaultCheckoutTime = new Date();
  defaultCheckoutTime.setHours(18, 0, 0, 0); // 6 PM

  // Find all attendance records for today with no checkout
  const records = await db.collection('attendance').find({
    date: today,
    checkOut: null,
    status: { $in: ['present', 'late'] },
  }).toArray();

  for (const record of records) {
    await db.collection('attendance').updateOne(
      { _id: record._id },
      {
        $set: {
          checkOut: defaultCheckoutTime,
          autoCheckedOut: true,
          updatedAt: new Date(),
        },
      }
    );

    // Create audit log with system actor
    await createAuditLog(
      new ObjectId('000000000000000000000000'), // System actor
      'attendance.auto-checkout',
      'attendance',
      record._id,
      { before: record, after: { ...record, checkOut: defaultCheckoutTime, autoCheckedOut: true } }
    );
  }
}

export async function getAttendanceForEmployee(
  employeeId: ObjectId,
  startDate?: Date,
  endDate?: Date
): Promise<Attendance[]> {
  const db = await getDb();
  const query: any = { employeeId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  return db.collection<Attendance>('attendance').find(query).sort({ date: -1 }).toArray();
}
