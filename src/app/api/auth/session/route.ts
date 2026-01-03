import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        leaveBalances: user.leaveBalances,
        baseSalary: user.baseSalary,
        profilePicture: user.profilePicture,
        phone: user.phone,
        address: user.address,
        department: user.department,
        position: user.position,
        joinDate: user.joinDate,
        documents: user.documents,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
