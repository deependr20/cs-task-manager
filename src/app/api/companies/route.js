import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
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
    const companies = await Company.find(query).sort({ name: 1 });
    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const body = await request.json();
    const {
      name,
      companyUserId,
      password,
      emailId,
      registeredOfficeAddress,
      cin,
      dateOfIncorporation,
      puc,
      directors,
    } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    const company = await Company.create({
      ...(authResult.firmId && { firmId: authResult.firmId }),
      name: name.trim(),
      companyUserId: companyUserId?.trim() || '',
      password: password?.trim() || '',
      emailId: emailId?.trim() || '',
      registeredOfficeAddress: registeredOfficeAddress?.trim() || '',
      cin: cin?.trim() || '',
      dateOfIncorporation: dateOfIncorporation ? new Date(dateOfIncorporation) : undefined,
      puc: puc?.trim() || '',
      directors: Array.isArray(directors)
        ? directors.map((d) => ({
            directorName: d.directorName?.trim() || '',
            din: d.din?.trim() || '',
            mcaCredentials: d.mcaCredentials?.trim() || '',
            password: d.password?.trim() || '',
            dir3KycStatus: d.dir3KycStatus?.trim() || '',
            mobileNo: d.mobileNo?.trim() || '',
            emailId: d.emailId?.trim() || '',
          }))
        : [],
    });
    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
