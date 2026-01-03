import { ObjectId } from 'mongodb';

export type PayrollStatus = 'draft' | 'finalized';

export interface PayrollCalculationDetails {
  formula: string;
  attendanceData: {
    present: number;
    halfDay: number;
    absent: number;
  };
  leaveData: {
    casual: number;
    sick: number;
    paid: number;
  };
}

export interface Payroll {
  _id?: ObjectId;
  employeeId: ObjectId;
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
  daysPresent: number;
  daysAbsent: number;
  leaveDays: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  calculationDetails: PayrollCalculationDetails;
  status: PayrollStatus;
  finalizedBy: ObjectId | null;
  finalizedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
