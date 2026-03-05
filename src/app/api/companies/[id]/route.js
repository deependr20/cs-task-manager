import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import { withAuth } from '@/lib/middleware';

export async function GET(request, { params }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'admin' && authResult.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const company = await Company.findById(params.id);
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    if (authResult.firmId && company.firmId && company.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const company = await Company.findById(params.id);
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    if (authResult.firmId && company.firmId && company.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
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
    if (name !== undefined) company.name = name.trim();
    if (companyUserId !== undefined) company.companyUserId = companyUserId?.trim() || '';
    if (password !== undefined) company.password = password?.trim() || '';
    if (emailId !== undefined) company.emailId = emailId?.trim() || '';
    if (registeredOfficeAddress !== undefined) company.registeredOfficeAddress = registeredOfficeAddress?.trim() || '';
    if (cin !== undefined) company.cin = cin?.trim() || '';
    if (dateOfIncorporation !== undefined) company.dateOfIncorporation = dateOfIncorporation ? new Date(dateOfIncorporation) : null;
    if (puc !== undefined) company.puc = puc?.trim() || '';
    if (Array.isArray(directors)) {
      company.directors = directors.map((d) => ({
        _id: d._id,
        directorName: d.directorName?.trim() || '',
        din: d.din?.trim() || '',
        mcaCredentials: d.mcaCredentials?.trim() || '',
        password: d.password?.trim() || '',
        dir3KycStatus: d.dir3KycStatus?.trim() || '',
        mobileNo: d.mobileNo?.trim() || '',
        emailId: d.emailId?.trim() || '',
      }));
    }
    await company.save();
    return NextResponse.json({ company });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    await connectDB();
    const company = await Company.findById(params.id);
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    if (authResult.firmId && company.firmId && company.firmId.toString() !== authResult.firmId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    await Company.findByIdAndDelete(params.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
