import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    await connectDB();

    let stats = {};

    if (authResult.role === 'admin' || authResult.role === 'manager') {
      const firmFilter = authResult.firmId ? { firmId: authResult.firmId } : {};
      const userFirmFilter = authResult.firmId ? { firmId: authResult.firmId } : {};
      const totalTasks = await Task.countDocuments(firmFilter);
      const pendingTasks = await Task.countDocuments({
        ...firmFilter,
        status: { $in: ['Pending', 'Pending Manager Approval', 'Pending Admin Approval'] },
      });
      const inProgressTasks = await Task.countDocuments({ ...firmFilter, status: 'In Progress' });
      const completedTasks = await Task.countDocuments({ ...firmFilter, status: 'Completed' });
      const totalEmployees = await User.countDocuments({
        role: { $in: ['employee', 'manager', 'admin'] },
        isActive: true,
        ...userFirmFilter,
      });

      // Employee-wise task distribution
      const matchStage = Object.keys(firmFilter).length ? [{ $match: firmFilter }] : [];
      const employeeTaskStats = await Task.aggregate([
        ...matchStage,
        {
          $group: {
            _id: '$assignedTo',
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'employee',
          },
        },
        {
          $unwind: '$employee',
        },
        {
          $project: {
            employeeId: '$_id',
            employeeName: '$employee.name',
            total: 1,
            pending: 1,
            inProgress: 1,
            completed: 1,
          },
        },
      ]);

      stats = {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        totalEmployees,
        employeeTaskStats,
      };
    } else {
      const baseQuery = { assignedTo: authResult.userId };
      if (authResult.firmId) {
        baseQuery.$or = [{ firmId: authResult.firmId }, { firmId: null }, { firmId: { $exists: false } }];
      }
      const totalTasks = await Task.countDocuments(baseQuery);
      const pendingTasks = await Task.countDocuments({
        ...baseQuery,
        status: { $in: ['Pending', 'Pending Manager Approval', 'Pending Admin Approval'] },
      });
      const inProgressTasks = await Task.countDocuments({
        ...baseQuery,
        status: 'In Progress',
      });
      const completedTasks = await Task.countDocuments({
        ...baseQuery,
        status: 'Completed',
      });

      stats = {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      };
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
