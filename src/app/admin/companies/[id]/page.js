'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CompanyForm from '@/components/CompanyForm';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const { company: updated } = await res.json();
        setCompany(updated);
      }
    } finally {
      setSaving(false);
    }
  };

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
          <div className="mb-6 flex items-center gap-4">
            <Link
              href="/admin/companies"
              className="text-slate-600 hover:text-slate-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Edit Company</h1>
              <p className="text-slate-500 text-sm mt-1">{company.name}</p>
            </div>
          </div>
          <CompanyForm
            company={company}
            onSave={handleSave}
            onCancel={() => router.push('/admin/companies')}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}
