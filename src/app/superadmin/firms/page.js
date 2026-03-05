'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function SuperadminFirmsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
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
    fetch('/api/firms', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.ok ? r.json() : { firms: [] })
      .then((d) => setFirms(d.firms || []))
      .catch(() => setFirms([]))
      .finally(() => setLoading(false));
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setFirms((prev) => [...prev, data.firm]);
        setNewName('');
        setShowAdd(false);
      } else {
        setError(data.error || 'Failed to create firm');
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
              <h1 className="text-2xl font-black text-slate-800">Firms</h1>
              <p className="text-slate-500 text-sm mt-1">Add CS practices. Each admin is assigned to one firm.</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowAdd(true); setError(''); setNewName(''); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Firm
            </button>
          </div>
          {showAdd && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">New firm</h2>
              {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}
              <form onSubmit={handleAdd} className="flex flex-wrap gap-3">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Firm name" className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800" required />
                <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold disabled:opacity-70">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => { setShowAdd(false); setError(''); }} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold">Cancel</button>
              </form>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" /></div>
          ) : firms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">No firms yet. Add a firm to assign admins.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {firms.map((f) => (
                  <li key={f._id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">{f.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <span className="font-semibold text-slate-800">{f.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
