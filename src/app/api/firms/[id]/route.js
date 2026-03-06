import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Firm from '@/models/Firm';
import { withAuth } from '@/lib/middleware';

export async function GET(request, { params }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const id = params.id;
  if (!id) return NextResponse.json({ error: 'Firm ID required' }, { status: 400 });
  if (authResult.role !== 'superadmin' && authResult.firmId?.toString() !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const firm = await Firm.findById(id).lean();
    if (!firm) return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    return NextResponse.json({ firm });
  } catch (error) {
    console.error('Get firm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const id = params.id;
  if (!id) return NextResponse.json({ error: 'Firm ID required' }, { status: 400 });
  if (authResult.role !== 'superadmin' && authResult.firmId?.toString() !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const body = await request.json();
    const { name, logo, showLogoOnly } = body;
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (logo !== undefined) update.logo = logo === '' ? null : String(logo).trim();
    if (showLogoOnly !== undefined) update.showLogoOnly = !!showLogoOnly;
    if (Object.keys(update).length === 0) {
      const firm = await Firm.findById(id).lean();
      if (!firm) return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
      return NextResponse.json({ firm });
    }
    const firm = await Firm.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!firm) return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    return NextResponse.json({ firm });
  } catch (error) {
    console.error('Update firm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
