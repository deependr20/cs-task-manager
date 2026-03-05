'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MemoPreview, { TEMPLATE_PDF_URL } from '@/components/MemoPreview';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';

const memoStatusConfig = {
  Draft:     { cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',      dot: 'bg-slate-400' },
  Sent:      { cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',           dot: 'bg-blue-400' },
  Paid:      { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',  dot: 'bg-emerald-400' },
  Overdue:   { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',        dot: 'bg-amber-400' },
  Cancelled: { cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',           dot: 'bg-rose-400' },
};

export default function MemoDetailsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewMemo, setPreviewMemo] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => { if (user?.role === 'admin') fetchMemos(); }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') router.push('/employee/dashboard');
        else setUser(data.user);
      } else router.push('/');
    } catch { router.push('/'); }
  };

  const fetchMemos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memos', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setMemos(data.memos); }
    } catch {} finally { setLoading(false); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );

  const filtered = filterStatus === 'all' ? memos : memos.filter((m) => m.status === filterStatus);

  const sc = (status) => memoStatusConfig[status] || memoStatusConfig.Draft;

  // Summary counts
  const counts = {
    all: memos.length,
    Draft: memos.filter(m => m.status === 'Draft').length,
    Sent: memos.filter(m => m.status === 'Sent').length,
    Paid: memos.filter(m => m.status === 'Paid').length,
    Overdue: memos.filter(m => m.status === 'Overdue').length,
  };

  const totalPaid = memos.filter(m => m.status === 'Paid').reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalPending = memos.filter(m => ['Sent','Overdue','Draft'].includes(m.status)).reduce((s, m) => s + (Number(m.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />

      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Memo Details</h1>
              <p className="text-slate-500 text-sm mt-1">Fee memos for all companies</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* View toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                  </svg>
                </button>
                <button onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'cards' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
              <a href={TEMPLATE_PDF_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 hover:scale-[1.02] transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">View Template (PDF)</span>
                <span className="sm:hidden">Template</span>
              </a>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1">Total Memos</p>
              <p className="text-2xl font-black text-slate-800">{counts.all}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-sm shadow-emerald-100 p-4">
              <p className="text-xs text-white/70 font-semibold mb-1">Total Paid</p>
              <p className="text-xl font-black text-white">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-400 rounded-2xl shadow-sm shadow-amber-100 p-4">
              <p className="text-xs text-white/70 font-semibold mb-1">Pending</p>
              <p className="text-xl font-black text-white">₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-sm shadow-rose-100 p-4">
              <p className="text-xs text-white/70 font-semibold mb-1">Overdue</p>
              <p className="text-2xl font-black text-white">{counts.Overdue}</p>
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {['all', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === s
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-100'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600'
                }`}>
                {s === 'all' ? `All (${counts.all})` : `${s} (${counts[s] ?? memos.filter(m => m.status === s).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No memos yet. Raise a memo from Task Sheet.</p>
            </div>
          ) : viewMode === 'table' ? (
            /* ── TABLE VIEW ── */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Memo No.','Company Name','Memo Date','Particulars','Amount','Sent To','Sent By','Follow Up','Payment Date','Status','Action'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((memo) => {
                      const s = sc(memo.status);
                      return (
                        <tr key={memo._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 text-sm font-bold text-violet-700">{memo.memoNo}</td>
                          <td className="py-3.5 px-4 text-sm font-semibold text-slate-800">{memo.companyName}</td>
                          <td className="py-3.5 px-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(memo.memoDate)}</td>
                          <td className="py-3.5 px-4 text-sm text-slate-600 max-w-[160px]">
                            <span className="truncate block" title={memo.particulars}>{memo.particulars || '–'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                            ₹{Number(memo.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-sm text-slate-600">{memo.sentTo || '–'}</td>
                          <td className="py-3.5 px-4">
                            {memo.sentBy?.name ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                  {memo.sentBy.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-slate-700">{memo.sentBy.name}</span>
                              </div>
                            ) : <span className="text-slate-400 text-sm">–</span>}
                          </td>
                          <td className="py-3.5 px-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(memo.followUpDate)}</td>
                          <td className="py-3.5 px-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(memo.paymentDate)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {memo.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button onClick={() => setPreviewMemo(memo)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Preview
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ── CARD VIEW ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((memo) => {
                const s = sc(memo.status);
                return (
                  <div key={memo._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                    <div className="h-1 w-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 opacity-60" />
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-violet-600 font-bold mb-0.5">{memo.memoNo}</p>
                          <h3 className="text-base font-bold text-slate-800 truncate">{memo.companyName}</h3>
                          {memo.particulars && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{memo.particulars}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${s.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {memo.status}
                        </span>
                      </div>

                      {/* Amount highlight */}
                      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-3 mb-4 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-semibold">Amount</p>
                        <p className="text-lg font-black text-violet-700">₹{Number(memo.amount).toLocaleString('en-IN')}</p>
                      </div>

                      {/* Meta grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">Memo Date</p>
                          <p className="text-xs font-semibold text-slate-700">{formatDate(memo.memoDate)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">Follow Up</p>
                          <p className="text-xs font-semibold text-slate-700">{formatDate(memo.followUpDate)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">Sent To</p>
                          <p className="text-xs font-semibold text-slate-700 truncate">{memo.sentTo || '–'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">Payment Date</p>
                          <p className="text-xs font-semibold text-slate-700">{formatDate(memo.paymentDate)}</p>
                        </div>
                      </div>

                      {/* Sent By */}
                      {memo.sentBy?.name && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {memo.sentBy.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs text-slate-500">Sent by <span className="font-semibold text-slate-700">{memo.sentBy.name}</span></p>
                        </div>
                      )}

                      {/* Action */}
                      <button onClick={() => setPreviewMemo(memo)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View PDF Preview
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {previewMemo && <MemoPreview memo={previewMemo} onClose={() => setPreviewMemo(null)} />}
    </div>
  );
}