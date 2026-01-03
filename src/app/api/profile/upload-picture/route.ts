import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createAuditLog } from '@/lib/services/auditService';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(buffer, 'dayflow/profile-pictures');

    // Update user profile
    const db = await getDb();
    const currentUser = await db.collection('users').findOne({ _id: user._id });

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { profilePicture: imageUrl, updatedAt: new Date() } }
    );

    // Create audit log
    await createAuditLog(
      user._id!,
      'profile.picture-updated',
      'user',
      user._id!,
      { before: { profilePicture: currentUser?.profilePicture }, after: { profilePicture: imageUrl } }
    );

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Upload profile picture error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
