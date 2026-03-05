import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Activity from '@/models/Activity';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    let query = {};
    if (authResult.role === 'employee') {
      query.assignedTo = authResult.userId;
      if (authResult.firmId) {
        query.$or = [{ firmId: authResult.firmId }, { firmId: null }, { firmId: { $exists: false } }];
      }
    } else {
      if (authResult.firmId) query.firmId = authResult.firmId;
      if (employeeId) query.assignedTo = employeeId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name')
      .populate('remarks.addedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.role !== 'admin' && authResult.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const { title, description, priority, dueDate, completionDate, companyName, assignedTo, form, srnOfeForm } = await request.json();

    if (!title || !description || !dueDate || !completionDate || !companyName || !assignedTo) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      completionDate,
      companyName,
      assignedTo,
      assignedBy: authResult.userId,
      status: 'Pending',
      ...(authResult.firmId && { firmId: authResult.firmId }),
      ...(form && { form }),
      ...(srnOfeForm && { srnOfeForm }),
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name');

    // Log activity
    try {
      await Activity.create({
        action: 'TASK_CREATED',
        description: `Created task "${title}" for ${populatedTask.assignedTo.name}`,
        performedBy: authResult.userId,
        firmId: authResult.firmId || undefined,
        taskId: task._id,
        taskTitle: title,
        companyName,
        metadata: { priority, dueDate, completionDate },
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({ task: populatedTask }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
