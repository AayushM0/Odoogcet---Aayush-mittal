import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createAuditLog } from '@/lib/services/auditService';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const employeeId = formData.get('employeeId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Determine target user (for admin uploading for employee)
    let targetUserId = user._id;
    if (employeeId && user.role === 'admin') {
      targetUserId = new ObjectId(employeeId);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const documentUrl = await uploadToCloudinary(buffer, 'dayflow/documents');

    // Create document object
    const document = {
      _id: new ObjectId(),
      name: name || file.name,
      url: documentUrl,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: user._id,
    };

    // Update user profile
    const db = await getDb();
    await db.collection('users').updateOne(
      { _id: targetUserId },
      { 
        $push: { documents: document },
        $set: { updatedAt: new Date() }
      }
    );

    // Create audit log
    await createAuditLog(
      user._id!,
      'profile.document-uploaded',
      'user',
      targetUserId!,
      { before: null, after: document }
    );

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('Upload document error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
