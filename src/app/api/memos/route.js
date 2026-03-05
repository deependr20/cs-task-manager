import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Memo from '@/models/Memo';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'admin' && authResult.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const query = authResult.firmId ? { firmId: authResult.firmId } : {};
    const memos = await Memo.find(query)
      .populate('taskId', 'title companyName')
      .populate('sentBy', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json({ memos });
  } catch (error) {
    console.error('Get memos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'admin' && authResult.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const body = await request.json();
    const { taskId, companyName, memoDate, particulars, amount, sentTo, followUpDate, paymentDate, status } = body;
    if (!taskId || !companyName || !memoDate || amount == null) {
      return NextResponse.json({ error: 'taskId, companyName, memoDate and amount are required' }, { status: 400 });
    }
    const year = new Date().getFullYear();
    const prefix = `MEMO-${year}-`;
    const last = await Memo.findOne({ memoNo: new RegExp(`^${prefix}`) }).sort({ memoNo: -1 });
    const nextNum = last ? parseInt(last.memoNo.replace(prefix, ''), 10) + 1 : 1;
    const memoNo = `${prefix}${String(nextNum).padStart(3, '0')}`;
    const memo = await Memo.create({
      memoNo,
      taskId,
      ...(authResult.firmId && { firmId: authResult.firmId }),
      companyName,
      memoDate: new Date(memoDate),
      particulars: particulars || '',
      amount: Number(amount),
      sentTo: sentTo || '',
      sentBy: authResult.userId,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      status: status || 'Draft',
    });
    const populated = await Memo.findById(memo._id)
      .populate('taskId', 'title companyName')
      .populate('sentBy', 'name');
    return NextResponse.json({ memo: populated }, { status: 201 });
  } catch (error) {
    console.error('Create memo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
