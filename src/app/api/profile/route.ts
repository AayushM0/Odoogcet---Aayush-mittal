import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createAuditLog } from '@/lib/services/auditService';

export async function GET() {
  try {
    const user = await requireAuth();
    const db = await getDb();

    const fullUser = await db.collection('users').findOne(
      { _id: user._id },
      { projection: { password: 0, verificationToken: 0 } }
    );

    return NextResponse.json({ user: fullUser });
  } catch (error: any) {
    console.error('Get profile error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, phone, address } = await request.json();

    const db = await getDb();

    // Get current user data
    const currentUser = await db.collection('users').findOne({ _id: user._id });

    // Update user profile
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    // Create audit log
    await createAuditLog(
      user._id!,
      'profile.updated',
      'user',
      user._id!,
      { before: currentUser, after: { ...currentUser, ...updateData } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
