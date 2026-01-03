import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createAuditLog } from '@/lib/services/auditService';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const db = await getDb();

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(params.id) },
      { projection: { password: 0, verificationToken: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const { name, phone, address, baseSalary, department, position } = await request.json();

    const db = await getDb();
    const userId = new ObjectId(params.id);

    // Get current user data
    const currentUser = await db.collection('users').findOne({ _id: userId });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (baseSalary) updateData.baseSalary = Number(baseSalary);
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;

    // Update user
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: updateData }
    );

    // Create audit log
    await createAuditLog(
      admin._id!,
      'user.updated',
      'user',
      userId,
      { before: currentUser, after: { ...currentUser, ...updateData } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update user error:', error);
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
