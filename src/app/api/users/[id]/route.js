import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withAuth } from '@/lib/middleware';

export async function PUT(request, { params }) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const isSuperadmin = authResult.role === 'superadmin';
  const isAdmin = authResult.role === 'admin';

  if (!isSuperadmin && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = params;
    const { name, email, designation, password, isActive, role } = await request.json();

    const updateData = { name, email, designation, isActive };

    if (role) {
      const allowedRoles = isSuperadmin ? ['admin', 'manager', 'employee'] : ['manager', 'employee'];
      if (!allowedRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      updateData.role = role;
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const query = { _id: id };

    if (!isSuperadmin && authResult.firmId) {
      query.firmId = authResult.firmId;
    }

    const user = await User.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const isSuperadmin = authResult.role === 'superadmin';
  const isAdmin = authResult.role === 'admin';

  if (!isSuperadmin && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = params;

    const query = { _id: id };
    if (!isSuperadmin && authResult.firmId) {
      query.firmId = authResult.firmId;
    }

    const user = await User.findOneAndDelete(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
