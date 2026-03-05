'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    name: '',
    designation: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

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
        setForm((f) => ({
          ...f,
          name: data.user.name ?? '',
          designation: data.user.designation ?? '',
          currentPassword: '',
          password: '',
          confirmPassword: '',
        }));
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
    const wantsPasswordChange =
      form.currentPassword || form.password || form.confirmPassword;

    if (wantsPasswordChange) {
      if (!form.currentPassword) {
        setMessage({ type: 'error', text: 'Please enter your current password.' });
        return;
      }
      if (!form.password) {
        setMessage({ type: 'error', text: 'Please enter a new password.' });
        return;
      }
      if (form.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          designation: form.designation,
          ...(wantsPasswordChange
            ? { password: form.password, currentPassword: form.currentPassword }
            : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setForm((f) => ({
          ...f,
          currentPassword: '',
          password: '',
          confirmPassword: '',
        }));
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.error || 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 pl-0 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 animate-slide-in-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-300/50">
              <span className="text-white font-bold text-2xl">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-slate-600 mt-1">Manage your account detail</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={user.email ?? ''}
                className="input bg-slate-50 cursor-not-allowed"
                readOnly
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="label">Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="input"
                required
              />
            </div>
            <div className="pt-4 border-t-2 border-slate-100">
              <h3 className="label text-base mb-3">Change password (optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Current password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm({ ...form, currentPassword: e.target.value })
                    }
                    className="input"
                    placeholder="Enter your current password"
                  />
                </div>
                <div>
                  <label className="label">New password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="input"
                    minLength={6}
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <label className="label">Confirm new password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="input"
                    placeholder="Repeat new password"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {showPasswords ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.05 10.05 0 012.223-3.592M6.223 6.223A9.967 9.967 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.05 10.05 0 01-4.132 5.411M15 12a3 3 0 00-3-3"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3l18 18"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                      <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
                    </span>
                  </button>
                </div>
              </div>
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
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
