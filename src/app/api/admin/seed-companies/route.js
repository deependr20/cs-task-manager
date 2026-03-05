import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import { withAuth } from '@/lib/middleware';

/**
 * One-time seed: INTELLOSOFT INFOTECH PRIVATE LIMITED and directors.
 * Call GET once while logged in as admin. Skips if company with same CIN already exists.
 */
const SEED_COMPANY = {
  name: 'INTELLOSOFT INFOTECH PRIVATE LIMITED',
  companyUserId: 'NA',
  password: 'NA',
  emailId: 'gourav148@gmail.com',
  registeredOfficeAddress: 'FNO 210, SHRINATHJI AVENUE, KIBE COMPOUND, Indore Takshashila, Indore, Indore, Madhya Pradesh, India, 452001',
  cin: 'U62013MP2025PTC080815',
  dateOfIncorporation: new Date('2025-12-23'),
  puc: '1,00,000',
  directors: [
    {
      directorName: 'Mr. Gourav Patidar',
      din: '11447884',
      mcaCredentials: 'gourav148@gmail.com',
      password: 'Gourav@1992',
      dir3KycStatus: 'Active',
      mobileNo: '+91 9516333872',
      emailId: 'gourav@intellosoft.io',
    },
    {
      directorName: 'Ms. Palak Gujrati',
      din: '11447885',
      mcaCredentials: 'NA',
      password: 'NA',
      dir3KycStatus: 'Active',
      mobileNo: '+91 9516333872',
      emailId: 'gourav@intellosoft.io',
    },
  ],
};

export async function GET(request) {
  const authResult = await withAuth(request, 'admin');
  if (authResult instanceof NextResponse) return authResult;

  try {
    await connectDB();
    const existing = await Company.findOne({ cin: SEED_COMPANY.cin });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Company already seeded (same CIN exists)',
        companyId: existing._id.toString(),
      });
    }
    const company = await Company.create(SEED_COMPANY);
    return NextResponse.json({
      success: true,
      message: 'Company seeded',
      companyId: company._id.toString(),
    });
  } catch (error) {
    console.error('Seed companies error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
