import { getDb } from '../db';
import { Payroll, PayrollStatus } from '@/models/Payroll';
import { ObjectId } from 'mongodb';
import { createAuditLog } from './auditService';
import { createNotification } from './notificationService';

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export async function generatePayroll(month: number, year: number, generatedBy: ObjectId): Promise<Payroll[]> {
  const db = await getDb();
  
  // Get all active employees
  const employees = await db.collection('users').find({ role: 'employee', isActive: true }).toArray();
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month - 1, getDaysInMonth(month, year));
  endDate.setHours(23, 59, 59, 999);
  
  const workingDays = getDaysInMonth(month, year);
  const payrolls: Payroll[] = [];

  for (const employee of employees) {
    // Check if payroll already exists
    const existing = await db.collection('payroll').findOne({
      employeeId: employee._id,
      month,
      year,
    });

    if (existing) {
      continue; // Skip if already generated
    }

    // Get attendance data
    const attendanceRecords = await db.collection('attendance').find({
      employeeId: employee._id,
      date: { $gte: startDate, $lte: endDate },
    }).toArray();

    let presentCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;

    for (const record of attendanceRecords) {
      if (record.status === 'present' || record.status === 'late') {
        presentCount++;
      } else if (record.status === 'half-day') {
        halfDayCount++;
      } else if (record.status === 'absent') {
        absentCount++;
      }
    }

    const daysPresent = presentCount + (halfDayCount * 0.5);

    // Get approved leaves
    const approvedLeaves = await db.collection('leaves').find({
      employeeId: employee._id,
      status: 'approved',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).toArray();

    let casualLeaveDays = 0;
    let sickLeaveDays = 0;
    let paidLeaveDays = 0;

    for (const leave of approvedLeaves) {
      if (leave.leaveType === 'casual') casualLeaveDays += leave.daysRequested;
      if (leave.leaveType === 'sick') sickLeaveDays += leave.daysRequested;
      if (leave.leaveType === 'paid') paidLeaveDays += leave.daysRequested;
    }

    const totalLeaveDays = casualLeaveDays + sickLeaveDays + paidLeaveDays;

    // Calculate pay
    const grossPay = (employee.baseSalary / workingDays) * daysPresent;
    const deductions = 0; // Hackathon scope: no deductions
    const netPay = grossPay - deductions;

    const payroll: Payroll = {
      employeeId: employee._id!,
      month,
      year,
      baseSalary: employee.baseSalary,
      workingDays,
      daysPresent,
      daysAbsent: absentCount,
      leaveDays: totalLeaveDays,
      grossPay: Math.round(grossPay * 100) / 100,
      deductions,
      netPay: Math.round(netPay * 100) / 100,
      calculationDetails: {
        formula: `(${employee.baseSalary} / ${workingDays}) × ${daysPresent}`,
        attendanceData: {
          present: presentCount,
          halfDay: halfDayCount,
          absent: absentCount,
        },
        leaveData: {
          casual: casualLeaveDays,
          sick: sickLeaveDays,
          paid: paidLeaveDays,
        },
      },
      status: 'draft',
      finalizedBy: null,
      finalizedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('payroll').insertOne(payroll);
    payroll._id = result.insertedId;

    // Create audit log
    await createAuditLog(
      generatedBy,
      'payroll.generated',
      'payroll',
      payroll._id,
      { before: null, after: payroll }
    );

    payrolls.push(payroll);
  }

  return payrolls;
}

export async function finalizePayroll(month: number, year: number, finalizedBy: ObjectId): Promise<void> {
  const db = await getDb();
  
  const payrolls = await db.collection<Payroll>('payroll').find({
    month,
    year,
    status: 'draft',
  }).toArray();

  if (payrolls.length === 0) {
    throw new Error('No draft payroll found for this month');
  }

  const finalizedAt = new Date();

  for (const payroll of payrolls) {
    const beforeState = { ...payroll };

    await db.collection('payroll').updateOne(
      { _id: payroll._id },
      {
        $set: {
          status: 'finalized',
          finalizedBy,
          finalizedAt,
          updatedAt: new Date(),
        },
      }
    );

    // Create audit log
    await createAuditLog(
      finalizedBy,
      'payroll.finalized',
      'payroll',
      payroll._id!,
      { before: beforeState, after: { ...payroll, status: 'finalized', finalizedBy, finalizedAt } }
    );

    // Notify employee
    const employee = await db.collection('users').findOne({ _id: payroll.employeeId });
    if (employee) {
      await createNotification(
        payroll.employeeId,
        'payroll',
        'Payroll Finalized',
        `Your payroll for ${month}/${year} has been finalized. Net Pay: ₹${payroll.netPay}`,
        { entityType: 'payroll', entityId: payroll._id! }
      );
    }
  }
}

export async function getPayrollForEmployee(employeeId: ObjectId, includeAll: boolean = false): Promise<Payroll[]> {
  const db = await getDb();
  const query: any = { employeeId };
  
  // Employees can only see finalized payroll
  if (!includeAll) {
    query.status = 'finalized';
  }

  return db.collection<Payroll>('payroll').find(query).sort({ year: -1, month: -1 }).toArray();
}

export async function getAllPayroll(): Promise<Payroll[]> {
  const db = await getDb();
  return db.collection<Payroll>('payroll').find({}).sort({ year: -1, month: -1 }).toArray();
}
