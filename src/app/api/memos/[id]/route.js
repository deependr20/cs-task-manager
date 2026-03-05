import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Memo from '@/models/Memo';
import { withAuth } from '@/lib/middleware';

export async function GET(request, { params }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  try {
    await connectDB();
    const memo = await Memo.findById(params.id)
      .populate('taskId', 'title companyName dueDate')
      .populate('sentBy', 'name');
    if (!memo) return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    if (authResult.firmId && memo.firmId && memo.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }
    return NextResponse.json({ memo });
  } catch (error) {
    console.error('Get memo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'admin' && authResult.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const memo = await Memo.findById(params.id);
    if (!memo) return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    if (authResult.firmId && memo.firmId && memo.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }
    const body = await request.json();
    const allowed = ['particulars', 'amount', 'sentTo', 'memoDate', 'followUpDate', 'paymentDate', 'status'];
    const dateKeys = ['memoDate', 'followUpDate', 'paymentDate'];
    allowed.forEach((key) => {
      if (body[key] !== undefined) {
        memo[key] = dateKeys.includes(key) && body[key] ? new Date(body[key]) : dateKeys.includes(key) ? null : body[key];
      }
    });
    await memo.save();
    const populated = await Memo.findById(memo._id)
      .populate('taskId', 'title companyName')
      .populate('sentBy', 'name');
    return NextResponse.json({ memo: populated });
  } catch (error) {
    console.error('Update memo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
