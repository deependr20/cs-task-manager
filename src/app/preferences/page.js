'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function PreferencesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [prefs, setPrefs] = useState({
    theme: 'system',
    emailNotifications: true,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPrefs({
          theme: data.user.preferences?.theme ?? 'system',
          emailNotifications: data.user.preferences?.emailNotifications ?? true,
        });
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: prefs }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMessage({ type: 'success', text: 'Preferences saved.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save preferences.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />

      <div className="pt-16 pl-0 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 animate-slide-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-300/50">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                Preferences
              </h1>
              <p className="text-slate-600 mt-1">Appearance and notifications</p>
            </div>
          </div>
        </div>

        <div className="card">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border-l-4 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="label text-base mb-3">Theme</h3>
              <div className="flex flex-wrap gap-3">
                {['light', 'dark', 'system'].map((t) => (
                  <label
                    key={t}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      prefs.theme === t
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={t}
                      checked={prefs.theme === t}
                      onChange={() => setPrefs({ ...prefs, theme: t })}
                      className="sr-only"
                    />
                    <span className="capitalize font-medium">{t}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                System follows your device setting. Theme change can be applied in a future update.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-slate-100">
              <h3 className="label text-base mb-3">Notifications</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.emailNotifications}
                  onChange={(e) =>
                    setPrefs({ ...prefs, emailNotifications: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-800">Email notifications</span>
              </label>
              <p className="text-xs text-slate-500 mt-2">
                Receive emails for task updates and approvals (when implemented).
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
