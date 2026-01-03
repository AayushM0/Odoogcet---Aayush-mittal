import { ObjectId } from 'mongodb';

export type LeaveType = 'casual' | 'sick' | 'paid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Leave {
  _id?: ObjectId;
  employeeId: ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  reviewedBy: ObjectId | null;
  reviewedAt: Date | null;
  adminComment: string | null;
  daysRequested: number;
  createdAt: Date;
  updatedAt: Date;
}
