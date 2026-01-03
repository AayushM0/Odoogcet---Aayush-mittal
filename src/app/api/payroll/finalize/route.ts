import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { finalizePayroll } from '@/lib/services/payrollService';

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

    await finalizePayroll(Number(month), Number(year), admin._id!);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Finalize payroll error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.includes('No draft payroll')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
