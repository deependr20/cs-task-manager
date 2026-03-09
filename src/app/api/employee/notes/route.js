import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmployeeNote from '@/models/EmployeeNote';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'employee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const note = await EmployeeNote.findOne({ userId: authResult.userId });
    return NextResponse.json({
      note: note ? { _id: note._id, content: note.content || '', updatedAt: note.updatedAt } : { content: '', updatedAt: null },
    });
  } catch (error) {
    console.error('Get employee note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'employee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content : '';

    const note = await EmployeeNote.findOneAndUpdate(
      { userId: authResult.userId },
      { content: content.trim() },
      { new: true, upsert: true }
    );
    return NextResponse.json({
      note: { _id: note._id, content: note.content || '', updatedAt: note.updatedAt },
    });
  } catch (error) {
    console.error('Update employee note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
