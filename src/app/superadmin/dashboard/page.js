'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SuperadminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firmsCount, setFirmsCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user?.role === 'superadmin') setUser(data.user);
        else router.push(data?.user ? (data.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard') : '/');
      })
      .catch(() => router.push('/'));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/firms', { cache: 'no-store', credentials: 'include' }).then((r) => r.ok ? r.json() : { firms: [] }),
      fetch('/api/superadmin/admins', { cache: 'no-store', credentials: 'include' }).then((r) => r.ok ? r.json() : { admins: [] }),
    ]).then(([firmsRes, adminsRes]) => {
      setFirmsCount(firmsRes.firms?.length ?? 0);
      setAdminsCount(adminsRes.admins?.length ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800">Super Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage firms and admins</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link href="/superadmin/firms" className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-amber-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Firms</h2>
                    <p className="text-3xl font-black text-slate-800 mt-1">{firmsCount}</p>
                    <p className="text-slate-500 text-sm mt-0.5">CS practices</p>
                  </div>
                </div>
              </Link>
              <Link href="/superadmin/admins" className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-amber-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Admins</h2>
                    <p className="text-3xl font-black text-slate-800 mt-1">{adminsCount}</p>
                    <p className="text-slate-500 text-sm mt-0.5">Firm administrators</p>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
