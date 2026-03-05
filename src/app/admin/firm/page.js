'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminFirmPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [firm, setFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ name: '', logo: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.firmId) fetchFirm();
    else if (user && !user.firmId) setLoading(false);
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role === 'superadmin') router.push('/superadmin/dashboard');
        else if (data.user.role !== 'admin') router.push(data.user.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
        else setUser(data.user);
      } else router.push('/');
    } catch {
      router.push('/');
    }
  };

  const fetchFirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/firms?mine=1', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const f = data.firm;
        setFirm(f);
        setForm({ name: f?.name ?? '', logo: f?.logo ?? '' });
        if (f?.logo) setLogoPreview(f.logo);
      } else if (res.status === 404) {
        setMessage({ type: 'error', text: 'Firm not found.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load firm.' });
    } finally {
      setLoading(false);
    }
  };

  const onLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file (PNG, JPG, etc.).' });
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setForm((prev) => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.firmId || !firm?._id) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      let logoValue = form.logo;
      if (logoFile) {
        const reader = new FileReader();
        logoValue = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(logoFile);
        });
      } else if (!logoPreview) {
        logoValue = '';
      }
      const res = await fetch(`/api/firms/${firm._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name.trim(), logo: logoValue || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setFirm(data.firm);
        setForm({ name: data.firm.name ?? '', logo: data.firm.logo ?? '' });
        if (data.firm.logo) setLogoPreview(data.firm.logo);
        else setLogoPreview('');
        setLogoFile(null);
        setMessage({ type: 'success', text: 'Company profile saved.' });
        const meRes = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.error || 'Failed to save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pt-24 px-4 pb-8 md:pl-72 md:pr-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Company profile</h1>
          <p className="text-slate-500 text-sm mb-6">Set your firm name and logo. These can be used in the app and memos.</p>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">Loading…</div>
          ) : !firm ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-600">
              {message.text || 'No firm assigned. Contact superadmin.'}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                {message.text && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="e.g. ABC & Associates"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Logo</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-slate-400 text-xs text-center px-2">No logo</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition-colors">
                          <input type="file" accept="image/*" className="hidden" onChange={onLogoFileChange} />
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                          </svg>
                          Upload
                        </label>
                        {(logoPreview || form.logo) && (
                          <button type="button" onClick={removeLogo} className="text-sm text-slate-500 hover:text-rose-600">
                            Remove logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">PNG or JPG recommended. Used in sidebar and documents.</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-200 hover:shadow-violet-300 disabled:opacity-60 transition-all"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
