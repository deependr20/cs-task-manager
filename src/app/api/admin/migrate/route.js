import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { withAuth } from '@/lib/middleware';

/**
 * One-time migration for production DB (run from browser when local DNS blocks Atlas).
 * Call GET once while logged in as admin, then remove or ignore this route.
 * Same logic as scripts/migrate-production.js.
 */
export async function GET(request) {
  const authResult = await withAuth(request, 'admin');
  if (authResult instanceof NextResponse) return authResult;

  try {
    await connectDB();
    const db = mongoose.connection.db;

    const tasksCollection = db.collection('tasks');
    const taskResult = await tasksCollection.updateMany(
      { status: 'Pending Approval' },
      { $set: { status: 'Pending Admin Approval' } }
    );

    const usersCollection = db.collection('users');
    const userResult = await usersCollection.updateMany(
      { $or: [{ designation: { $exists: false } }, { designation: '' }] },
      { $set: { designation: 'Staff' } }
    );

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      tasksUpdated: taskResult.modifiedCount,
      usersUpdated: userResult.modifiedCount,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
