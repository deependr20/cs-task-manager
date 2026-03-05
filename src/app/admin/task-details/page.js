'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';

const statusConfig = {
  'Pending': { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-400' },
  'In Progress': { cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', dot: 'bg-blue-400' },
  'Pending Manager Approval': { cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200', dot: 'bg-violet-400' },
  'Pending Admin Approval': { cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200', dot: 'bg-orange-400' },
  'Completed': { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-400' },
};

const memoStatusConfig = {
  Draft: 'bg-slate-100 text-slate-600',
  Sent: 'bg-blue-50 text-blue-700',
  Paid: 'bg-emerald-50 text-emerald-700',
  Overdue: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-rose-50 text-rose-700',
};

export default function TaskDetailsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [memoForm, setMemoForm] = useState({
    companyName: '', memoDate: '', particulars: '', amount: '',
    sentTo: '', followUpDate: '', paymentDate: '', status: 'Draft',
  });
  const [savingMemo, setSavingMemo] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const isViewOnly = user?.role === 'manager';

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => { if (user?.role === 'admin' || user?.role === 'manager') { fetchTasks(); fetchMemos(); } }, [user]);

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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setTasks(data.tasks); }
    } catch {} finally { setLoading(false); }
  };

  const fetchMemos = async () => {
    try {
      const res = await fetch('/api/memos', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setMemos(data.memos); }
    } catch {}
  };

  const memoByTaskId = {};
  memos.forEach((m) => {
    const tid = m.taskId?._id || m.taskId?.toString?.() || m.taskId;
    if (tid) memoByTaskId[tid] = m;
  });

  const openRaiseMemo = (task) => {
    setSelectedTask(task);
    setMemoForm({
      companyName: task.companyName || '',
      memoDate: new Date().toISOString().slice(0, 10),
      particulars: '', amount: '', sentTo: '', followUpDate: '', paymentDate: '', status: 'Draft',
    });
    setShowMemoModal(true);
  };

  const handleCreateMemo = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSavingMemo(true);
    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          taskId: selectedTask._id,
          companyName: memoForm.companyName,
          memoDate: memoForm.memoDate,
          particulars: memoForm.particulars,
          amount: Number(memoForm.amount) || 0,
          sentTo: memoForm.sentTo,
          followUpDate: memoForm.followUpDate || undefined,
          paymentDate: memoForm.paymentDate || undefined,
          status: memoForm.status,
        }),
      });
      if (res.ok) { setShowMemoModal(false); setSelectedTask(null); fetchMemos(); }
    } catch {} finally { setSavingMemo(false); }
  };

  const remarksText = (task) => {
    if (!task.remarks?.length) return '–';
    const last = task.remarks[task.remarks.length - 1];
    return last?.note ? `${last.note.slice(0, 60)}${last.note.length > 60 ? '…' : ''}` : '–';
  };

  if (!user) return null;

  const sc = (status) => statusConfig[status] || { cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Task Sheet</h1>
              <p className="text-slate-500 text-sm mt-1">All task details in one view</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle (table vs cards for mobile) */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'cards' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                {tasks.length} tasks
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No tasks yet.</p>
            </div>
          ) : viewMode === 'table' ? (
            /* ── TABLE VIEW ── */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['S.No.','Company Name','Task','Form','Assigned To','Due Date','Completion Date','Status','SRN of e-Form','Remarks','Memo Status','Action'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, idx) => {
                      const memo = memoByTaskId[task._id];
                      const s = sc(task.status);
                      return (
                        <tr key={task._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                          <td className="py-3.5 px-4 text-sm text-slate-500 font-medium">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-sm font-semibold text-slate-800">{task.companyName || '–'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-sm text-slate-700 font-medium">{task.title}</span>
                          </td>
                          <td className="py-3.5 px-4 text-sm text-slate-500">{task.form || '–'}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <span className="text-sm text-slate-700">{task.assignedTo?.name || '–'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(task.dueDate)}</td>
                          <td className="py-3.5 px-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(task.completionDate)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${s.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {task.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-sm text-slate-500">{task.srnOfeForm || '–'}</td>
                          <td className="py-3.5 px-4 text-sm text-slate-500 max-w-[140px]">
                            <span className="truncate block" title={remarksText(task)}>{remarksText(task)}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {memo ? (
                              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${memoStatusConfig[memo.status] || 'bg-slate-100 text-slate-600'}`}>
                                {memo.status}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">–</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {memo ? (
                              <a href="/admin/memo-details"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Memo
                              </a>
                            ) : !isViewOnly ? (
                              <button onClick={() => openRaiseMemo(task)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Raise Memo
                              </button>
                            ) : (
                              <span className="text-slate-300 text-xs">–</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ── CARD VIEW (mobile-friendly) ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task, idx) => {
                const memo = memoByTaskId[task._id];
                const s = sc(task.status);
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                return (
                  <div key={task._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    {/* Top gradient strip */}
                    <div className="h-1 w-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 opacity-60" />
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-400 font-semibold mb-0.5">#{idx + 1} · {task.companyName || '–'}</p>
                          <h3 className="text-base font-bold text-slate-800 leading-snug">{task.title}</h3>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${s.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {task.status.replace('Pending ', '').replace(' Approval', '')}
                        </span>
                      </div>

                      {/* Meta grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">Assigned To</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <p className="text-xs font-semibold text-slate-700 truncate">{task.assignedTo?.name || '–'}</p>
                          </div>
                        </div>
                        <div className={`rounded-xl p-2.5 ${isOverdue ? 'bg-rose-50' : 'bg-slate-50'}`}>
                          <p className={`text-xs mb-0.5 ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>Due Date</p>
                          <p className={`text-xs font-semibold ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>
                            {formatDate(task.dueDate)}
                            {isOverdue && <span className="ml-1 text-rose-500">⚠</span>}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">Completion</p>
                          <p className="text-xs font-semibold text-slate-700">{formatDate(task.completionDate)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-400 mb-0.5">Form</p>
                          <p className="text-xs font-semibold text-slate-700">{task.form || '–'}</p>
                        </div>
                      </div>

                      {/* SRN */}
                      {task.srnOfeForm && (
                        <div className="mb-3 bg-indigo-50 rounded-xl px-3 py-2">
                          <p className="text-xs text-indigo-400 mb-0.5">SRN of e-Form</p>
                          <p className="text-xs font-semibold text-indigo-700">{task.srnOfeForm}</p>
                        </div>
                      )}

                      {/* Remarks */}
                      {task.remarks?.length > 0 && (
                        <div className="mb-3 bg-slate-50 rounded-xl px-3 py-2">
                          <p className="text-xs text-slate-400 mb-0.5">Last Remark</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{remarksText(task)}</p>
                        </div>
                      )}

                      {/* Memo status + Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Memo</p>
                          {memo ? (
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${memoStatusConfig[memo.status] || 'bg-slate-100 text-slate-600'}`}>
                              {memo.status}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">Not raised</span>
                          )}
                        </div>
                        {memo ? (
                          <a href="/admin/memo-details"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Memo
                          </a>
                        ) : !isViewOnly ? (
                          <button onClick={() => openRaiseMemo(task)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm hover:scale-[1.02] transition-all">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Raise Memo
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">View only</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RAISE MEMO MODAL ── */}
      {showMemoModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-2xl sm:max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div>
                <h2 className="text-xl font-black text-white">Raise Memo</h2>
                <p className="text-white/70 text-sm truncate max-w-[240px]">For: {selectedTask.title}</p>
              </div>
              <button type="button" onClick={() => { setShowMemoModal(false); setSelectedTask(null); }}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreateMemo} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Company Name</label>
                  <input type="text" value={memoForm.companyName}
                    onChange={(e) => setMemoForm({ ...memoForm, companyName: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Memo Date</label>
                  <input type="date" value={memoForm.memoDate}
                    onChange={(e) => setMemoForm({ ...memoForm, memoDate: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Particulars</label>
                  <textarea value={memoForm.particulars}
                    onChange={(e) => setMemoForm({ ...memoForm, particulars: e.target.value })}
                    rows={3} placeholder="Professional fees / reimbursements"
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                    <input type="number" min="0" step="0.01" value={memoForm.amount}
                      onChange={(e) => setMemoForm({ ...memoForm, amount: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Sent To</label>
                  <input type="text" value={memoForm.sentTo} placeholder="Client contact"
                    onChange={(e) => setMemoForm({ ...memoForm, sentTo: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Follow Up Date</label>
                    <input type="date" value={memoForm.followUpDate}
                      onChange={(e) => setMemoForm({ ...memoForm, followUpDate: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Payment Date</label>
                    <input type="date" value={memoForm.paymentDate}
                      onChange={(e) => setMemoForm({ ...memoForm, paymentDate: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Status</label>
                  <select value={memoForm.status} onChange={(e) => setMemoForm({ ...memoForm, status: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all">
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-white">
                <button type="button" onClick={() => { setShowMemoModal(false); setSelectedTask(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={savingMemo}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100">
                  {savingMemo ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </span>
                  ) : 'Save Memo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}