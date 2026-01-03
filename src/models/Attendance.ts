import { ObjectId } from 'mongodb';

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'late';

export interface Attendance {
  _id?: ObjectId;
  employeeId: ObjectId;
  date: Date;
  status: AttendanceStatus;
  checkIn: Date | null;
  checkOut: Date | null;
  autoCheckedOut: boolean;
  markedBy: ObjectId;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
