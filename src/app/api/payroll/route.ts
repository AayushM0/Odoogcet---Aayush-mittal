import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { getPayrollForEmployee, getAllPayroll } from '@/lib/services/payrollService';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    let payrolls;
    if (user.role === 'admin') {
      payrolls = await getAllPayroll();
      
      // Populate employee names
      const { getDb } = await import('@/lib/db');
      const db = await getDb();
      const payrollsWithEmployees = await db.collection('payroll').aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        { $sort: { year: -1, month: -1 } },
      ]).toArray();
      
      return NextResponse.json({ payrolls: payrollsWithEmployees });
    } else {
      // Employees can only see finalized payroll
      payrolls = await getPayrollForEmployee(user._id!, false);
      return NextResponse.json({ payrolls });
    }
  } catch (error: any) {
    console.error('Get payroll error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
