import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Firm from '@/models/Firm';
import { withAuth } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';

export async function GET(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();
    const user = await User.findById(authResult.userId).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let firm = null;
    if (user.firmId) {
      firm = await Firm.findById(user.firmId).select('name logo').lean();
    }
    return NextResponse.json({ user: { ...user, firm } });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();
    const body = await request.json();
    const { name, designation, password, preferences } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (designation !== undefined) updateData.designation = designation;
    if (preferences !== undefined) {
      updateData.preferences = {
        theme: preferences.theme ?? 'system',
        emailNotifications: preferences.emailNotifications ?? true,
      };
    }
    if (password && password.length >= 6) {
      updateData.password = await hashPassword(password);
    }

    const user = await User.findByIdAndUpdate(
      authResult.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
