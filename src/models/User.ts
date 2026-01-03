import { ObjectId } from 'mongodb';

export interface LeaveBalances {
  casual: number;
  sick: number;
  paid: number;
}

export interface UserDocument {
  _id: ObjectId;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: ObjectId;
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
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  profilePicture?: string;
  documents?: UserDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export const defaultLeaveBalances: LeaveBalances = {
  casual: 12,
  sick: 10,
  paid: 15,
};
