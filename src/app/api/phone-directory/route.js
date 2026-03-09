import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PhoneContact from '@/models/PhoneContact';
import { withAuth } from '@/lib/middleware';

export async function GET(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (!['admin', 'manager', 'employee'].includes(authResult.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const query = authResult.firmId ? { firmId: authResult.firmId } : {};
    const contacts = await PhoneContact.find(query).sort({ name: 1 });
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Get phone directory error:', error);
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
    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const designation = body.designation?.trim() || '';

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const contact = await PhoneContact.create({
      name,
      phone,
      designation,
      ...(authResult.firmId && { firmId: authResult.firmId }),
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Create phone contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

