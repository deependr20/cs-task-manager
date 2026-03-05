'use client';

import { useEffect, useState } from 'react';

const emptyDirector = () => ({
  directorName: '', din: '', mcaCredentials: '', password: '',
  dir3KycStatus: '', mobileNo: '', emailId: '',
});

function toInputDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const inputCls = "w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all placeholder:text-slate-300 placeholder:font-normal";

const kycConfig = {
  Active:   { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-400' },
  Inactive: { cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',          dot: 'bg-rose-400' },
  Pending:  { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-400' },
};

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
        {icon && <span className="text-violet-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CompanyForm({ company, onSave, onCancel, saving }) {
  const [name, setName] = useState('');
  const [companyUserId, setCompanyUserId] = useState('');
  const [password, setPassword] = useState('');
  const [emailId, setEmailId] = useState('');
  const [registeredOfficeAddress, setRegisteredOfficeAddress] = useState('');
  const [cin, setCin] = useState('');
  const [dateOfIncorporation, setDateOfIncorporation] = useState('');
  const [puc, setPuc] = useState('');
  const [directors, setDirectors] = useState([emptyDirector()]);
  const [showPasswords, setShowPasswords] = useState({});
  const [activeDirectorTab, setActiveDirectorTab] = useState(0);

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setCompanyUserId(company.companyUserId || '');
      setPassword(company.password || '');
      setEmailId(company.emailId || '');
      setRegisteredOfficeAddress(company.registeredOfficeAddress || '');
      setCin(company.cin || '');
      setDateOfIncorporation(toInputDate(company.dateOfIncorporation));
      setPuc(company.puc || '');
      setDirectors(
        company.directors?.length
          ? company.directors.map((d) => ({
              _id: d._id,
              directorName: d.directorName || '',
              din: d.din || '',
              mcaCredentials: d.mcaCredentials || '',
              password: d.password || '',
              dir3KycStatus: d.dir3KycStatus || '',
              mobileNo: d.mobileNo || '',
              emailId: d.emailId || '',
            }))
          : [emptyDirector()]
      );
      setActiveDirectorTab(0);
    } else {
      setName(''); setCompanyUserId(''); setPassword(''); setEmailId('');
      setRegisteredOfficeAddress(''); setCin(''); setDateOfIncorporation(''); setPuc('');
      setDirectors([emptyDirector()]); setActiveDirectorTab(0);
    }
  }, [company]);

  const updateDirector = (index, field, value) => {
    setDirectors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addDirector = () => {
    const newIndex = directors.length;
    setDirectors((prev) => [...prev, emptyDirector()]);
    setActiveDirectorTab(newIndex);
  };

  const removeDirector = (index) => {
    if (directors.length <= 1) return;
    setDirectors((prev) => prev.filter((_, i) => i !== index));
    setActiveDirectorTab(Math.max(0, index - 1));
  };

  const togglePassword = (key) => setShowPasswords((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name, companyUserId, password, emailId, registeredOfficeAddress, cin,
      dateOfIncorporation: dateOfIncorporation || undefined, puc,
      directors: directors.map(({ _id, directorName, din, mcaCredentials, password: pwd, dir3KycStatus, mobileNo, emailId: em }) => ({
        ...(_id && { _id }), directorName, din, mcaCredentials, password: pwd, dir3KycStatus, mobileNo, emailId: em,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── COMPANY DETAILS CARD ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Company Details</h2>
            <p className="text-white/60 text-xs">Registration and identification info</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Field label="Company Name" icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
              </svg>
            }>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className={`${inputCls} text-base font-bold`}
                placeholder="e.g. INTELLOSOFT INFOTECH PRIVATE LIMITED" required />
            </Field>
          </div>

          <Field label="CIN">
            <input type="text" value={cin} onChange={(e) => setCin(e.target.value)}
              className={inputCls} placeholder="Corporate Identification Number" />
          </Field>

          <Field label="Date of Incorporation">
            <input type="date" value={dateOfIncorporation} onChange={(e) => setDateOfIncorporation(e.target.value)}
              className={inputCls} />
          </Field>

          <Field label="Email ID">
            <input type="email" value={emailId} onChange={(e) => setEmailId(e.target.value)}
              className={inputCls} placeholder="company@example.com" />
          </Field>

          <Field label="PUC (Paid-Up Capital)">
            <input type="text" value={puc} onChange={(e) => setPuc(e.target.value)}
              className={inputCls} placeholder="e.g. 1,00,000" />
          </Field>

          <Field label="Company User ID">
            <input type="text" value={companyUserId} onChange={(e) => setCompanyUserId(e.target.value)}
              className={inputCls} placeholder="MCA Portal User ID" />
          </Field>

          <Field label="MCA Password">
            <div className="relative">
              <input type={showPasswords['company'] ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-10`} placeholder="MCA portal password" />
              <button type="button" onClick={() => togglePassword('company')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPasswords['company'] ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Registered Office Address">
              <textarea value={registeredOfficeAddress} onChange={(e) => setRegisteredOfficeAddress(e.target.value)}
                rows={3} className={`${inputCls} resize-none`} placeholder="Full registered address" />
            </Field>
          </div>
        </div>
      </div>

      {/* ── DIRECTORS SECTION ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Directors</h2>
              <p className="text-white/60 text-xs">{directors.length} director{directors.length !== 1 ? 's' : ''} added</p>
            </div>
          </div>
          <button type="button" onClick={addDirector}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Director
          </button>
        </div>

        {/* Director tabs */}
        {directors.length > 1 && (
          <div className="flex gap-1 px-6 pt-4 overflow-x-auto">
            {directors.map((dir, idx) => (
              <button key={idx} type="button" onClick={() => setActiveDirectorTab(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeDirectorTab === idx
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {dir.directorName || `Director ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Active director form */}
        {directors.map((dir, index) => (
          <div key={index} className={index !== activeDirectorTab ? 'hidden' : ''}>
            <div className="px-6 pt-5 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-base font-black shadow-md shadow-emerald-100">
                  {dir.directorName?.charAt(0)?.toUpperCase() || (index + 1)}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">{dir.directorName || `Director ${index + 1}`}</p>
                  {dir.din && <p className="text-xs text-slate-400 font-medium">DIN: {dir.din}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {dir.dir3KycStatus && (() => {
                  const cfg = kycConfig[dir.dir3KycStatus];
                  return cfg ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      KYC {dir.dir3KycStatus}
                    </span>
                  ) : null;
                })()}
                {directors.length > 1 && (
                  <button type="button" onClick={() => removeDirector(index)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all ring-1 ring-rose-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Field label="Director's Full Name">
                  <input type="text" value={dir.directorName} onChange={(e) => updateDirector(index, 'directorName', e.target.value)}
                    className={`${inputCls} font-bold`} placeholder="e.g. Mr. Gourav Patidar" />
                </Field>
              </div>

              <Field label="DIN (Director Identification No.)">
                <input type="text" value={dir.din} onChange={(e) => updateDirector(index, 'din', e.target.value)}
                  className={inputCls} placeholder="8-digit DIN" />
              </Field>

              <Field label="DIR-3 KYC Status">
                <select value={dir.dir3KycStatus} onChange={(e) => updateDirector(index, 'dir3KycStatus', e.target.value)}
                  className={inputCls}>
                  <option value="">– Select status –</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </Field>

              <Field label="Mobile No.">
                <input type="text" value={dir.mobileNo} onChange={(e) => updateDirector(index, 'mobileNo', e.target.value)}
                  className={inputCls} placeholder="+91 98765 43210" />
              </Field>

              <Field label="Email ID">
                <input type="email" value={dir.emailId} onChange={(e) => updateDirector(index, 'emailId', e.target.value)}
                  className={inputCls} placeholder="director@example.com" />
              </Field>

              <Field label="MCA Credentials (User ID)">
                <input type="text" value={dir.mcaCredentials} onChange={(e) => updateDirector(index, 'mcaCredentials', e.target.value)}
                  className={inputCls} placeholder="MCA portal email or ID" />
              </Field>

              <Field label="MCA Password">
                <div className="relative">
                  <input type={showPasswords[`dir-${index}`] ? 'text' : 'password'} value={dir.password}
                    onChange={(e) => updateDirector(index, 'password', e.target.value)}
                    className={`${inputCls} pr-10`} placeholder="MCA portal password" />
                  <button type="button" onClick={() => togglePassword(`dir-${index}`)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPasswords[`dir-${index}`] ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </Field>
            </div>
          </div>
        ))}

        {/* Director dots navigation (when multiple) */}
        {directors.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-5">
            {directors.map((_, idx) => (
              <button key={idx} type="button" onClick={() => setActiveDirectorTab(idx)}
                className={`w-2 h-2 rounded-full transition-all ${activeDirectorTab === idx ? 'bg-emerald-500 w-5' : 'bg-slate-200 hover:bg-slate-300'}`} />
            ))}
          </div>
        )}
      </div>

      {/* ── FORM ACTIONS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cancel
        </button>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Company
            </>
          )}
        </button>
      </div>
    </form>
  );
}