import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function withAuth(request, requiredRole = null) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (requiredRole && decoded.role !== requiredRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return decoded;
}
