import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.role !== 'admin' && authResult.role !== 'manager' && authResult.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const query = { role: { $in: ['employee', 'manager'] }, isActive: true };
    if (authResult.role === 'admin' || authResult.role === 'manager') {
      if (authResult.firmId) query.firmId = authResult.firmId;
    }
    const users = await User.find(query)
      .select('-password')
      .sort({ role: 1, createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
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
    const body = await request.json();
    const { name, email, password, designation, role, firmId, managerPermissions } = body;

    if (!name || !email || !password || !designation || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    let targetFirmId = null;
    if (role === 'admin') {
      if (isSuperadmin) {
        if (!firmId) return NextResponse.json({ error: 'Firm is required for admin' }, { status: 400 });
        targetFirmId = firmId;
      } else {
        targetFirmId = authResult.firmId;
      }
    } else if (role === 'manager' || role === 'employee') {
      if (!isAdmin) return NextResponse.json({ error: 'Only admin can create manager/employee' }, { status: 403 });
      targetFirmId = authResult.firmId;
    }

    const allowedRoles = ['admin', 'manager', 'employee'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      designation: designation.trim(),
      role,
      ...(targetFirmId && { firmId: targetFirmId }),
      ...(role === 'manager' && managerPermissions
        ? {
            managerPermissions: {
              accessTaskSheet:
                typeof managerPermissions.accessTaskSheet === 'boolean'
                  ? managerPermissions.accessTaskSheet
                  : true,
              accessMemoDetails:
                typeof managerPermissions.accessMemoDetails === 'boolean'
                  ? managerPermissions.accessMemoDetails
                  : true,
              accessCompanies:
                typeof managerPermissions.accessCompanies === 'boolean'
                  ? managerPermissions.accessCompanies
                  : true,
              canCreateTasks:
                typeof managerPermissions.canCreateTasks === 'boolean'
                  ? managerPermissions.canCreateTasks
                  : true,
              canApproveTasks:
                typeof managerPermissions.canApproveTasks === 'boolean'
                  ? managerPermissions.canApproveTasks
                  : true,
              canRaiseMemos:
                typeof managerPermissions.canRaiseMemos === 'boolean'
                  ? managerPermissions.canRaiseMemos
                  : true,
            },
          }
        : {}),
    });

    const userObject = user.toObject();
    delete userObject.password;

    return NextResponse.json({ user: userObject }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
