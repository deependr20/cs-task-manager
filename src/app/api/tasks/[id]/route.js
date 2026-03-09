import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Activity from '@/models/Activity';
import { withAuth } from '@/lib/middleware';

export async function GET(request, { params }) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();
    const { id } = params;

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name')
      .populate('remarks.addedBy', 'name');

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (authResult.firmId && task.firmId && task.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (authResult.firmId && task.firmId && task.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const oldStatus = task.status;

    // Check permissions
    if (authResult.role === 'employee') {
      // Employees can only update status and add remarks
      if (task.assignedTo.toString() !== authResult.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (body.status) {
        task.status = body.status;
      }

      if (body.remark) {
        task.remarks.push({
          note: body.remark,
          addedBy: authResult.userId,
        });
      }
    } else {
      // Admins and managers can update all fields and add approval notes
      const { remark, ...rest } = body;
      Object.assign(task, rest);
      if (remark && typeof remark === 'string' && remark.trim()) {
        task.remarks.push({
          note: remark.trim(),
          addedBy: authResult.userId,
        });
      }
    }

    if (task.status === 'Completed' && !task.completedAt) {
      task.completedAt = new Date();
    }

    await task.save();

    // Log activity
    try {
      let action = 'TASK_UPDATED';
      let description = `Updated task: ${task.title}`;

      if (body.status && body.status !== oldStatus) {
        if (body.status === 'Pending Manager Approval') {
          action = 'TASK_SUBMITTED_FOR_MANAGER_APPROVAL';
          description = `Submitted task "${task.title}" for manager approval`;
        } else if (body.status === 'Pending Admin Approval' && oldStatus === 'Pending Manager Approval') {
          action = 'TASK_APPROVED_BY_MANAGER';
          description = `Manager approved task "${task.title}"`;
        } else if (body.status === 'Completed' && oldStatus === 'Pending Admin Approval') {
          action = 'TASK_APPROVED_BY_ADMIN';
          description = `Admin approved task "${task.title}"`;
        } else if (
          body.status === 'In Progress' &&
          (oldStatus === 'Pending Manager Approval' || oldStatus === 'Pending Admin Approval')
        ) {
          action = 'TASK_REJECTED';
          description = `Rejected task "${task.title}" completion`;
        } else {
          action = 'TASK_STATUS_CHANGED';
          description = `Changed task "${task.title}" status from ${oldStatus} to ${body.status}`;
        }
      }

      const activityFirm = authResult.firmId || undefined;
      if (body.remark) {
        await Activity.create({
          action: 'REMARK_ADDED',
          description: `Added remark to task "${task.title}"`,
          performedBy: authResult.userId,
          firmId: activityFirm,
          taskId: task._id,
          taskTitle: task.title,
          companyName: task.companyName,
          metadata: { remark: body.remark },
        });
      }

      if (body.status && body.status !== oldStatus) {
        await Activity.create({
          action,
          description,
          performedBy: authResult.userId,
          firmId: activityFirm,
          taskId: task._id,
          taskTitle: task.title,
          companyName: task.companyName,
          oldStatus,
          newStatus: body.status,
        });
      } else if (!body.remark) {
        await Activity.create({
          action,
          description,
          performedBy: authResult.userId,
          firmId: activityFirm,
          taskId: task._id,
          taskTitle: task.title,
          companyName: task.companyName,
        });
      }
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't fail the request if logging fails
    }

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name')
      .populate('remarks.addedBy', 'name');

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authResult = await withAuth(request, 'admin');

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();
    const { id } = params;

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (authResult.firmId && task.firmId && task.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    try {
      await Activity.create({
        action: 'TASK_DELETED',
        description: `Deleted task "${task.title}"`,
        performedBy: authResult.userId,
        firmId: authResult.firmId || undefined,
        taskId: task._id,
        taskTitle: task.title,
        companyName: task.companyName,
        metadata: { status: task.status },
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    await Task.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
