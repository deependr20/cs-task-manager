'use client';

const kycConfig = {
  Active:   { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-400' },
  Inactive: { cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',          dot: 'bg-rose-400' },
  Pending:  { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-400' },
};

function formatDate(date) {
  if (!date) return '–';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Field({ label, icon, value, className = '' }) {
  const display = value != null && String(value).trim() !== '' ? String(value).trim() : '–';
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
        {icon && <span className="text-violet-400">{icon}</span>}
        {label}
      </label>
      <p className={`text-sm text-slate-800 font-medium min-h-[2.5rem] flex items-center ${className}`}>
        {display}
      </p>
    </div>
  );
}

export default function CompanyView({ company }) {
  if (!company) return null;

  const directors = Array.isArray(company.directors) ? company.directors : [];

  return (
    <div className="space-y-6">
      {/* ── COMPANY DETAILS CARD (same as form) ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
            } value={company.name} className="text-base font-bold" />
          </div>

          <Field label="CIN" value={company.cin} />
          <Field label="Date of Incorporation" value={formatDate(company.dateOfIncorporation)} />
          <Field label="Email ID" value={company.emailId} />
          <Field label="PUC (Paid-Up Capital)" value={company.puc} />
          <Field label="Company User ID" value={company.companyUserId} />
          <Field label="MCA Password" value={company.password} />

          <div className="sm:col-span-2">
            <Field label="Registered Office Address" value={company.registeredOfficeAddress} className="whitespace-pre-line" />
          </div>
        </div>
      </div>

      {/* ── DIRECTORS (same header and layout as form) ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Directors</h2>
            <p className="text-white/60 text-xs">{directors.length} director{directors.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {directors.length === 0 ? (
          <div className="p-6 text-slate-500 text-sm">No directors added.</div>
        ) : (
          directors.map((dir, index) => {
            const kyc = dir.dir3KycStatus ? kycConfig[dir.dir3KycStatus] : null;
            return (
              <div key={dir._id || index} className="border-t border-slate-100 first:border-t-0">
                <div className="px-6 pt-5 pb-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-base font-black shadow-md shadow-emerald-100">
                    {dir.directorName?.charAt(0)?.toUpperCase() || (index + 1)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">{dir.directorName || `Director ${index + 1}`}</p>
                    {dir.din && <p className="text-xs text-slate-400 font-medium">DIN: {dir.din}</p>}
                  </div>
                  {kyc && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ml-auto ${kyc.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${kyc.dot}`} />
                      KYC {dir.dir3KycStatus}
                    </span>
                  )}
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <Field label="Director's Full Name" value={dir.directorName} className="font-bold" />
                  </div>
                  <Field label="DIN (Director Identification No.)" value={dir.din} />
                  <Field label="DIR-3 KYC Status" value={dir.dir3KycStatus} />
                  <Field label="Mobile No." value={dir.mobileNo} />
                  <Field label="Email ID" value={dir.emailId} />
                  <Field label="MCA Credentials (User ID)" value={dir.mcaCredentials} />
                  <Field label="MCA Password" value={dir.password} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
