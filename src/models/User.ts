import { ObjectId } from 'mongodb';

export interface LeaveBalances {
  casual: number;
  sick: number;
  paid: number;
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  role: 'admin' | 'employee';
  name: string;
  isEmailVerified: boolean;
  verificationToken: string | null;
  baseSalary: number;
  leaveBalances: LeaveBalances;
  joinDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const defaultLeaveBalances: LeaveBalances = {
  casual: 12,
  sick: 10,
  paid: 15,
};
