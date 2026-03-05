import { NextResponse } from 'next/server';

// Super Admin can only be created via the seed script (scripts/seed-superadmin.cjs).
// This endpoint is disabled so no one can create an account from the UI or API.
export async function POST() {
  return NextResponse.json(
    { error: 'Super Admin must be created using the seed script. This endpoint is disabled.' },
    { status: 403 }
  );
}
