import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .populate('firmId', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
