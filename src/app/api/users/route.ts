import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { User, defaultLeaveBalances } from '@/models/User';
import { createAuditLog } from '@/lib/services/auditService';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const admin = await requireAdmin();
    const db = await getDb();

    const users = await db
      .collection('users')
      .find({ role: 'employee', isActive: true })
      .project({ password: 0, verificationToken: 0 })
      .toArray();

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { email, name, baseSalary, password } = await request.json();

    if (!email || !name || !baseSalary) {
      return NextResponse.json(
        { error: 'Email, name, and baseSalary are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user already exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password || 'password123');
    const verificationToken = randomBytes(32).toString('hex');

    const user: User = {
      email,
      password: hashedPassword,
      role: 'employee',
      name,
      isEmailVerified: false,
      verificationToken,
      baseSalary: Number(baseSalary),
      leaveBalances: { ...defaultLeaveBalances },
      joinDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);
    user._id = result.insertedId;

    // Create audit log
    await createAuditLog(
      admin._id!,
      'user.created',
      'user',
      user._id,
      { before: null, after: user }
    );

    // In production, send verification email here
    console.log(`Verification link: /api/auth/verify-email?token=${verificationToken}`);

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      verificationToken, // For demo purposes only
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
