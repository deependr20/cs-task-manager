'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const kycConfig = {
  Active:   { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-400' },
  Inactive: { cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',          dot: 'bg-rose-400' },
  Pending:  { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-400' },
};

function CompanyCard({ company, onDelete, viewOnly }) {
  const [expanded, setExpanded] = useState(false);

  const directors = Array.isArray(company.directors) ? company.directors : [];
  const initials = company.name
    ?.split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Gradient strip */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 opacity-60" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-black shadow-md shadow-violet-100 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-2">{company.name || '–'}</h3>
            {company.cin && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">{company.cin}</p>
            )}
          </div>
        </div>

        {/* Info chips */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 rounded-xl p-2.5">
            <p className="text-xs text-slate-400 mb-0.5">Directors</p>
            <p className="text-sm font-bold text-slate-700">{directors.length}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5">
            <p className="text-xs text-slate-400 mb-0.5">Email</p>
            <p className="text-xs font-medium text-slate-700 truncate">{company.emailId || '–'}</p>
          </div>
          {company.puc && (
            <div className="bg-violet-50 rounded-xl p-2.5">
              <p className="text-xs text-violet-400 mb-0.5">PUC</p>
              <p className="text-sm font-bold text-violet-700">₹{company.puc}</p>
            </div>
          )}
          {company.dateOfIncorporation && (
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-xs text-slate-400 mb-0.5">Incorporated</p>
              <p className="text-xs font-semibold text-slate-700">
                {new Date(company.dateOfIncorporation).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Address */}
        {company.registeredOfficeAddress && (
          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-slate-400 mb-0.5">Registered Address</p>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{company.registeredOfficeAddress}</p>
          </div>
        )}

        {/* Directors expand */}
        {directors.length > 0 && (
          <div className="mb-4">
            <button type="button" onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 rounded-xl px-3 py-2.5 hover:bg-slate-100 transition-all">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {directors.length} Director{directors.length !== 1 ? 's' : ''}
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {directors.map((d, i) => {
                  const kyc = kycConfig[d.dir3KycStatus];
                  return (
                    <div key={i} className="bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {d.directorName?.charAt(0)?.toUpperCase() || (i + 1)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{d.directorName || '–'}</p>
                            {d.din && <p className="text-xs text-slate-400 font-mono">DIN: {d.din}</p>}
                          </div>
                        </div>
                        {kyc && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0 ${kyc.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${kyc.dot}`} />
                            {d.dir3KycStatus}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {d.mobileNo && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {d.mobileNo}
                          </div>
                        )}
                        {d.emailId && (
                          <div className="flex items-center gap-1 text-slate-500 truncate">
                            <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{d.emailId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <Link href={`/admin/companies/${company._id}/view`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            title="View all details">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </Link>
          {!viewOnly && (
            <>
              <Link href={`/admin/companies/${company._id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button type="button" onClick={() => onDelete(company._id, company.name)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all ring-1 ring-rose-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isViewOnly = user?.role === 'manager';

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => { if (user?.role === 'admin' || user?.role === 'manager') fetchCompanies(); }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin' && data.user.role !== 'manager') router.push('/employee/dashboard');
        else setUser(data.user);
      } else router.push('/');
    } catch { router.push('/'); }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setCompanies(data.companies || []); }
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete company "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchCompanies();
    } catch {}
  };

  if (!user) return null;

  const filtered = companies.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.cin?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDirectors = companies.reduce((s, c) => s + (c.directors?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Companies</h1>
              <p className="text-slate-500 text-sm mt-1">{isViewOnly ? 'View company and director details' : 'Manage company and director details'}</p>
            </div>
            {!isViewOnly && (
              <Link href="/admin/companies/new"
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Company
              </Link>
            )}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl p-4 shadow-md shadow-violet-100">
              <p className="text-xs text-white/70 font-semibold mb-1">Total Companies</p>
              <p className="text-2xl font-black text-white">{companies.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-md shadow-emerald-100">
              <p className="text-xs text-white/70 font-semibold mb-1">Total Directors</p>
              <p className="text-2xl font-black text-white">{totalDirectors}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1">Active KYC</p>
              <p className="text-2xl font-black text-slate-800">
                {companies.flatMap(c => c.directors || []).filter(d => d.dir3KycStatus === 'Active').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1">Pending KYC</p>
              <p className="text-2xl font-black text-amber-600">
                {companies.flatMap(c => c.directors || []).filter(d => d.dir3KycStatus === 'Pending').length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name or CIN…"
              className="w-full md:w-1/2  pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-slate-500 font-semibold">
                {search ? `No companies matching "${search}"` : 'No companies yet.'}
              </p>
              {!search && !isViewOnly && (
                <Link href="/admin/companies/new"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add your first company
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 font-medium mb-4">
                Showing {filtered.length} of {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((company) => (
                  <CompanyCard key={company._id} company={company} onDelete={handleDelete} viewOnly={isViewOnly} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}