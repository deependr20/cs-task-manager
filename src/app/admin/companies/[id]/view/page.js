'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CompanyView from '@/components/CompanyView';

export default function ViewCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user?.role === 'admin') setUser(data.user);
        else router.push('/');
      })
      .catch(() => router.push('/'));
  }, [router]);

  useEffect(() => {
    if (!id || !user) return;
    fetch(`/api/companies/${id}`, { cache: 'no-store', credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setCompany(data.company))
      .catch(() => router.push('/admin/companies'))
      .finally(() => setLoading(false));
  }, [id, user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  if (loading || !company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <div className="pt-16 pl-0 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/companies"
                className="text-slate-600 hover:text-slate-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-800">View Company</h1>
                <p className="text-slate-500 text-sm mt-1">{company.name}</p>
              </div>
            </div>
            <Link
              href={`/admin/companies/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>
          <CompanyView company={company} />
        </div>
      </div>
    </div>
  );
}
