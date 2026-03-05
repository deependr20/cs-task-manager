import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Firm from '@/models/Firm';
import { withAuth } from '@/lib/middleware';
import { hashPassword, comparePassword } from '@/lib/auth';

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
    const { name, designation, password, currentPassword, preferences } = body;

    const user = await User.findById(authResult.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (name !== undefined) user.name = name;
    if (designation !== undefined) user.designation = designation;
    if (preferences !== undefined) {
      user.preferences = {
        theme: preferences.theme ?? 'system',
        emailNotifications: preferences.emailNotifications ?? true,
      };
    }

    if (password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 },
        );
      }

      const matches = await comparePassword(currentPassword, user.password || '');
      if (!matches) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 },
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 },
        );
      }

      user.password = await hashPassword(password);
    }

    await user.save();

    const safe = user.toObject();
    delete safe.password;

    return NextResponse.json({ user: safe });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
