import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Firm from '@/models/Firm';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get('mine') === '1';
  if (mine && (authResult.role === 'admin' || authResult.role === 'manager') && authResult.firmId) {
    try {
      await connectDB();
      const firm = await Firm.findById(authResult.firmId).lean();
      if (!firm) return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
      return NextResponse.json({ firm });
    } catch (error) {
      console.error('Get my firm error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  if (authResult.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const firms = await Firm.find().sort({ name: 1 });
    return NextResponse.json({ firms });
  } catch (error) {
    console.error('Get firms error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const body = await request.json();
    const { name } = body;
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Firm name is required' }, { status: 400 });
    }
    const firm = await Firm.create({ name: String(name).trim() });
    return NextResponse.json({ firm }, { status: 201 });
  } catch (error) {
    console.error('Create firm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
