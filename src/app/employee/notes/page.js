'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeNotesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.role === 'employee') fetchNote();
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'employee') router.push('/admin/dashboard');
        else setUser(data.user);
      } else router.push('/');
    } catch { router.push('/'); }
  };

  const fetchNote = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employee/notes', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setContent(data.note?.content ?? '');
        setLastSaved(data.note?.updatedAt ? new Date(data.note.updatedAt) : null);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/employee/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastSaved(data.note?.updatedAt ? new Date(data.note.updatedAt) : new Date());
        setMessage('Saved');
        setTimeout(() => setMessage(null), 2000);
      } else setMessage('Failed to save');
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-800">My Notes</h1>
            <p className="text-slate-500 text-sm mt-1">Private notes only you can see. Use this space for reminders or personal notes.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {lastSaved ? `Last saved ${lastSaved.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Not saved yet'}
              </span>
              <div className="flex items-center gap-2">
                {message && (
                  <span className={`text-sm font-medium ${message === 'Saved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {message}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-emerald-100 hover:shadow-emerald-200 transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' }}
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes here…"
                className="w-full min-h-[320px] p-4 sm:p-6 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 resize-y border-0 bg-white"
                style={{ minHeight: '320px' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
