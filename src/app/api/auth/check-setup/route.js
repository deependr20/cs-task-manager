import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const count = await User.countDocuments({ role: 'superadmin' });
    return NextResponse.json({ setupComplete: count > 0 });
  } catch (err) {
    return NextResponse.json({ setupComplete: false });
  }
}
