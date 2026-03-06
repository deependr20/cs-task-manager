'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaUpload, FaTrash, FaCheck, FaExclamationCircle, FaEye, FaImage } from 'react-icons/fa';

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
  const [showLogoOnly, setShowLogoOnly] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { fetchUser(); }, []);

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
    } catch { router.push('/'); }
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
        if (f?.showLogoOnly) setShowLogoOnly(f.showLogoOnly);
      } else if (res.status === 404) {
        setMessage({ type: 'error', text: 'Firm not found.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load firm.' });
    } finally { setLoading(false); }
  };

  const onLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image file (PNG, JPG, etc.).' });
      return;
    }
    processFile(file);
  };

  const processFile = (file) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setForm(prev => ({ ...prev, logo: '' }));
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
        logoValue = await new Promise(resolve => {
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
        body: JSON.stringify({ name: form.name.trim(), logo: logoValue || '', showLogoOnly }),
      });
      if (res.ok) {
        const data = await res.json();
        setFirm(data.firm);
        setForm({ name: data.firm.name ?? '', logo: data.firm.logo ?? '' });
        setLogoPreview(data.firm.logo ? data.firm.logo : '');
        setLogoFile(null);
        setMessage({ type: 'success', text: 'Company profile saved successfully.' });
        const meRes = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
        if (meRes.ok) { const meData = await meRes.json(); setUser(meData.user); }
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.error || 'Failed to save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    } finally { setSaving(false); }
  };

  // Sidebar preview component
  const SidebarPreview = () => (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ background: 'linear-gradient(180deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' }}>
      {/* Preview badge */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <FaEye style={{ display: 'inline-block' }} /> Live Preview
        </p>
        <span className="text-[9px] bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full font-bold tracking-wide">SIDEBAR</span>
      </div>

      {/* Branding row */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Logo slot — white bg so ANY logo colour is visible */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-white shadow-lg p-1" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <FaBuilding className="text-white text-sm" style={{ display: 'block' }} />
              </div>
            )}
          </div>
          {!showLogoOnly && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {form.name || 'Company Name'}
              </p>
              <p className="text-[11px] text-white/40 truncate">Secretary Services</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav items */}
      <div className="p-3 space-y-0.5">
        {[
          { label: 'Dashboard',       active: false },
          { label: 'Task Sheet',      active: false },
          { label: 'Memo Details',    active: false },
          { label: 'Companies',       active: false },
          { label: 'Activity Logs',   active: false },
          { label: 'Company Profile', active: true  },
        ].map(({ label, active }) => (
          <div key={label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${active ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md' : 'hover:bg-white/5'}`}>
            <div className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 ${active ? 'bg-white/80' : 'bg-white/20'}`} />
            {!showLogoOnly && (
              <span className={`text-xs font-medium truncate ${active ? 'text-white' : 'text-white/50'}`}>{label}</span>
            )}
            {active && !showLogoOnly && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* User row */}
      <div className="px-3 pb-3 pt-1 border-t border-white/10 mt-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          {!showLogoOnly && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">Admin User</p>
              <p className="text-[10px] text-white/40">admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20">
      <style jsx global>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-fadeIn  { animation: fadeIn  0.25s ease-out; }
      `}</style>

      <main className="pt-8 px-4 pb-12 md:pl-72 md:pr-8">
        <div className="max-w-4xl mt-[3.4rem] md:mt-[3.8rem]  mx-auto">

          {/* ── Page header ─────────────────────────────── */}
          <div className="mb-8 animate-slideUp">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 flex-shrink-0">
                <FaBuilding className="text-white" style={{ display: 'block' }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  Company Profile
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">Set your firm name and logo · Used in the app and memos</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center animate-fadeIn">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-violet-500 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Loading company profile…</p>
            </div>
          ) : !firm ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBuilding className="text-slate-400 text-2xl" style={{ display: 'block' }} />
              </div>
              <p className="text-slate-600 font-semibold text-lg">{message.text || 'No firm assigned.'}</p>
              <p className="text-slate-400 text-sm mt-1">Contact your superadmin to set up your firm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>

              {/* ── Form ──────────────────────────────────── */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                  {/* Form gradient header */}
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4">
                    <h2 className="text-base font-bold text-white">🏢 Firm Details</h2>
                    <p className="text-violet-200 text-xs mt-0.5">Changes reflect instantly in the sidebar and all documents</p>
                  </div>

                  <div className="p-6 space-y-6">

                    {/* Status message */}
                    {message.text && (
                      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold animate-fadeIn ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200' : 'bg-rose-50 text-rose-800 border-2 border-rose-200'}`}>
                        {message.type === 'success'
                          ? <FaCheck className="flex-shrink-0" style={{ display: 'block' }} />
                          : <FaExclamationCircle className="flex-shrink-0" style={{ display: 'block' }} />}
                        {message.text}
                      </div>
                    )}

                    {/* Company name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="e.g. ABC & Associates"
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 font-semibold text-sm focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all"
                      />
                    </div>

                    {/* Logo upload */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Company Logo</label>

                      {/* Drop zone */}
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`relative rounded-2xl border-2 border-dashed transition-all ${dragOver ? 'border-violet-400 bg-violet-50' : logoPreview ? 'border-violet-300 bg-violet-50/30' : 'border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/20'}`}
                      >
                        {logoPreview ? (
                          /* Logo preview state */
                          <div className="p-5 space-y-4">
                            {/* Dual preview: light + dark */}
                            <div className="flex items-stretch gap-3">
                              {/* Light bg */}
                              <div className="flex-1 rounded-xl border-2 border-slate-200 bg-white flex flex-col items-center justify-center overflow-hidden shadow-sm py-4 gap-2">
                                <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain" />
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Light</p>
                              </div>
                              {/* Dark bg — white card behind logo so it's always visible */}
                              <div className="flex-1 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-sm py-4 gap-2" style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63)' }}>
                                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
                                  <img src={logoPreview} alt="Logo on dark" className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wide">Sidebar</p>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-2">
                              <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-100 text-violet-700 text-sm font-bold hover:bg-violet-200 transition-colors">
                                <input type="file" accept="image/*" className="hidden" onChange={onLogoFileChange} />
                                <FaUpload style={{ display: 'inline-block' }} /> Replace
                              </label>
                              <button type="button" onClick={removeLogo}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 transition-colors border-2 border-rose-100">
                                <FaTrash style={{ display: 'inline-block' }} /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Empty state */
                          <label className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={onLogoFileChange} />
                            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
                              <FaImage className="text-violet-500 text-2xl" style={{ display: 'block' }} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-700">Drop your logo here, or <span className="text-violet-600 underline">browse</span></p>
                              <p className="text-xs text-slate-400 mt-1">PNG or JPG · Recommended 200×200px or larger · Max 2MB</p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Sidebar display option */}
                    {logoPreview && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Sidebar Display</label>
                        <div className="flex gap-3">
                          {[
                            { v: false, label: '🏷️ Logo + Name', desc: 'Show logo icon with company name' },
                            { v: true,  label: '🖼️ Logo Only',   desc: 'Show just the logo, hide name' },
                          ].map(({ v, label, desc }) => (
                            <label key={String(v)} className={`flex-1 flex flex-col gap-1 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${showLogoOnly === v ? 'border-violet-400 bg-violet-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                              <input type="radio" name="sidebarDisplay" checked={showLogoOnly === v} onChange={() => setShowLogoOnly(v)} className="sr-only" />
                              <span className="text-sm font-bold text-slate-800">{label}</span>
                              <span className="text-xs text-slate-500">{desc}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t-2 border-slate-100 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400 font-semibold">* Required fields</p>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 transition-all"
                    >
                      {saving
                        ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving…</>
                        : <><FaCheck style={{ display: 'inline-block' }} /> Save Changes</>
                      }
                    </button>
                  </div>
                </form>
              </div>

              {/* ── Live Sidebar Preview ────────────────── */}
              <div className="lg:col-span-2">
                <div className="sticky top-8 space-y-4">
                  <SidebarPreview />

                  {/* Tips */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3">
                      <h3 className="text-sm font-bold text-white">💡 Logo Tips</h3>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {[
                        'Use a PNG with transparent background for best results',
                        'Square logos (1:1) work best in the sidebar icon slot',
                        '"Logo Only" mode is ideal for compact or icon-style logos',
                        'Dark sidebar preview shows exactly how it will appear',
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-amber-600 text-[8px] font-black">{i + 1}</span>
                          </div>
                          <p className="text-xs text-slate-600">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}