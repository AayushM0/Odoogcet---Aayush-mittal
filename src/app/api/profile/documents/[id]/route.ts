import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createAuditLog } from '@/lib/services/auditService';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const documentId = params.id;

    const db = await getDb();
    
    // Find the document
    const userDoc = await db.collection('users').findOne({
      _id: user._id,
      'documents._id': new ObjectId(documentId),
    });

    if (!userDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = userDoc.documents?.find((d: any) => d._id.toString() === documentId);

    // Delete from database
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $pull: { documents: { _id: new ObjectId(documentId) } },
        $set: { updatedAt: new Date() }
      }
    );

    // Create audit log
    await createAuditLog(
      user._id!,
      'profile.document-deleted',
      'user',
      user._id!,
      { before: document, after: null }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete document error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
