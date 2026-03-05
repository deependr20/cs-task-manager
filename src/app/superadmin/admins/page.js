'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function SuperadminAdminsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', firmId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user?.role === 'superadmin') setUser(data.user);
        else router.push('/');
      })
      .catch(() => router.push('/'));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/firms', { cache: 'no-store', credentials: 'include' }).then((r) => r.ok ? r.json() : { firms: [] }),
      fetch('/api/superadmin/admins', { cache: 'no-store', credentials: 'include' }).then((r) => r.ok ? r.json() : { admins: [] }),
    ]).then(([fRes, aRes]) => {
      setFirms(fRes.firms || []);
      setAdmins(aRes.admins || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firmId) {
      setError('Please select a firm');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          designation: 'Admin',
          role: 'admin',
          firmId: form.firmId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins((prev) => [{ ...data.user, firmId: firms.find((f) => f._id === form.firmId) }, ...prev]);
        setForm({ name: '', email: '', password: '', firmId: '' });
        setShowAdd(false);
      } else {
        setError(data.error || 'Failed to create admin');
      }
    } catch {
      setError('Something went wrong');
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Admins</h1>
              <p className="text-slate-500 text-sm mt-1">Create an admin and assign them to a firm. Each admin manages only their firm&apos;s data.</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowAdd(true); setError(''); setForm({ name: '', email: '', password: '', firmId: firms[0]?._id || '' }); }}
              disabled={firms.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Admin
            </button>
          </div>

          {firms.length === 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              Add at least one firm before creating admins.
            </div>
          )}

          {showAdd && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">New admin</h2>
              {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Firm *</label>
                  <select
                    value={form.firmId}
                    onChange={(e) => setForm((p) => ({ ...p, firmId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                    required
                  >
                    <option value="">Select firm</option>
                    {firms.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Full name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800" placeholder="Admin name" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800" placeholder="admin@example.com" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Password (min 6)</label>
                  <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800" placeholder="••••••••" required minLength={6} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold disabled:opacity-70">
                    {saving ? 'Creating...' : 'Create Admin'}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
            </div>
          ) : admins.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">
              No admins yet. Create an admin and assign them to a firm.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase">Admin</th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 uppercase">Firm</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a._id} className="border-b border-slate-50">
                      <td className="py-4 px-6 font-semibold text-slate-800">{a.name}</td>
                      <td className="py-4 px-6 text-slate-600">{a.email}</td>
                      <td className="py-4 px-6 text-slate-600">{a.firmId?.name || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
