import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import { withAuth } from '@/lib/middleware';

// GET - Retrieve all activity logs (Admin only)
export async function GET(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }
  if (authResult.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    let query = {};
    if (authResult.firmId) query.firmId = authResult.firmId;

    if (employeeId) {
      query.performedBy = employeeId;
    }

    if (action) {
      query.action = action;
    }

    const activities = await Activity.find(query)
      .populate('performedBy', 'name email designation role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Activity.countDocuments(query);

    return NextResponse.json({
      activities,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new activity log
export async function POST(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();
    const body = await request.json();

    const activity = await Activity.create({
      ...body,
      performedBy: authResult.userId,
    });

    const populatedActivity = await Activity.findById(activity._id).populate(
      'performedBy',
      'name email designation role'
    );

    return NextResponse.json({ activity: populatedActivity }, { status: 201 });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
