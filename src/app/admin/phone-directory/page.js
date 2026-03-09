'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPhoneDirectoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', designation: '' });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchContacts();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') {
          router.push(data.user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
        } else setUser(data.user);
      } else router.push('/');
    } catch {
      router.push('/');
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/phone-directory', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/phone-directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: '', phone: '', designation: '' });
        fetchContacts();
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 19.72V23a2 2 0 01-2 2h-1C9.82 25 3 18.18 3 10V5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">Phone Directory</h1>
                <p className="text-slate-500 text-sm mt-1">Maintain a shared contact list for your firm.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-1">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Add Contact</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Designation (optional)</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-violet-200 hover:shadow-violet-300 transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                  {saving ? 'Saving…' : 'Save Contact'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800">Contacts</h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  {contacts.length} saved
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
                  <p className="text-slate-500 font-medium">No contacts added yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Use the form on the left to add your first contact.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contacts.map((c) => (
                    <div
                      key={c._id}
                      className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50 p-4 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {c.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                          {c.designation && (
                            <p className="text-xs text-slate-500 mt-0.5">{c.designation}</p>
                          )}
                          <p className="text-sm font-mono text-slate-700 mt-1">{c.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

