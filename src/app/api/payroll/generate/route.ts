import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { generatePayroll } from '@/lib/services/payrollService';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { month, year } = await request.json();

    if (!month || !year) {
      return NextResponse.json(
        { error: 'month and year are required' },
        { status: 400 }
      );
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'month must be between 1 and 12' },
        { status: 400 }
      );
    }

    const payrolls = await generatePayroll(monthNum, yearNum, admin._id!);

    return NextResponse.json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error: any) {
    console.error('Generate payroll error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
