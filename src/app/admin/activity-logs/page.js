'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const actionConfig = {
  TASK_CREATED:                { gradient: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200',   icon: '📝' },
  TASK_UPDATED:                { gradient: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', icon: '✏️' },
  TASK_STATUS_CHANGED:         { gradient: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'ring-amber-200',  icon: '🔄' },
  TASK_SUBMITTED_FOR_APPROVAL: { gradient: 'from-yellow-500 to-amber-500',  bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-200', icon: '⏳' },
  TASK_APPROVED:               { gradient: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50',text: 'text-emerald-700',ring: 'ring-emerald-200',icon: '✅' },
  TASK_REJECTED:               { gradient: 'from-rose-500 to-red-500',      bg: 'bg-rose-50',   text: 'text-rose-700',   ring: 'ring-rose-200',   icon: '❌' },
  TASK_DELETED:                { gradient: 'from-slate-500 to-gray-600',    bg: 'bg-slate-100', text: 'text-slate-600',  ring: 'ring-slate-200',  icon: '🗑️' },
  REMARK_ADDED:                { gradient: 'from-purple-500 to-pink-500',   bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200', icon: '💬' },
};

const formatDate = (date) =>
  new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const formatActionName = (action) =>
  action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

export default function ActivityLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });

  useEffect(() => { fetchUser(); fetchEmployees(); }, []);
  useEffect(() => { fetchActivities(); }, [selectedEmployee, selectedAction, pagination.page]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') router.push('/employee/dashboard');
        else setUser(data.user);
      } else router.push('/');
    } catch { router.push('/'); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.users.filter((u) => u.role === 'employee'));
      }
    } catch {}
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let url = `/api/activities?limit=${pagination.limit}&page=${pagination.page}`;
      if (selectedEmployee !== 'all') url += `&employeeId=${selectedEmployee}`;
      if (selectedAction !== 'all') url += `&action=${selectedAction}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities);
        setPagination(data.pagination);
      }
    } catch {} finally { setLoading(false); }
  };

  if (!user) return null;

  const ac = (action) => actionConfig[action] || actionConfig.TASK_CREATED;

  const actionOptions = [
    { value: 'all',                          label: 'All Actions' },
    { value: 'TASK_CREATED',                 label: 'Task Created' },
    { value: 'TASK_UPDATED',                 label: 'Task Updated' },
    { value: 'TASK_STATUS_CHANGED',          label: 'Status Changed' },
    { value: 'TASK_SUBMITTED_FOR_APPROVAL',  label: 'Submitted for Approval' },
    { value: 'TASK_APPROVED',                label: 'Task Approved' },
    { value: 'TASK_REJECTED',                label: 'Task Rejected' },
    { value: 'TASK_DELETED',                 label: 'Task Deleted' },
    { value: 'REMARK_ADDED',                 label: 'Remark Added' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Activity Logs</h1>
              <p className="text-slate-500 text-sm mt-1">Monitor all employee activities and actions</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-violet-600">{pagination.total}</span> total activities
            </span>
          </div>

          {/* Summary stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Created', key: 'TASK_CREATED',   gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Approved', key: 'TASK_APPROVED', gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Rejected', key: 'TASK_REJECTED', gradient: 'from-rose-500 to-red-500' },
              { label: 'Remarks', key: 'REMARK_ADDED',   gradient: 'from-purple-500 to-pink-500' },
            ].map(({ label, key, gradient }) => (
              <button key={key}
                onClick={() => { setSelectedAction(selectedAction === key ? 'all' : key); setPagination(p => ({ ...p, page: 1 })); }}
                className={`rounded-2xl p-4 text-left transition-all hover:scale-[1.02] ${selectedAction === key ? `bg-gradient-to-br ${gradient} shadow-lg` : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'}`}>
                <p className={`text-xs font-semibold mb-1 ${selectedAction === key ? 'text-white/70' : 'text-slate-400'}`}>{label}</p>
                <p className={`text-xl font-black ${selectedAction === key ? 'text-white' : 'text-slate-800'}`}>
                  {activities.filter(a => a.action === key).length}
                </p>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Logs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Employee</label>
                <select value={selectedEmployee}
                  onChange={(e) => { setSelectedEmployee(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all">
                  <option value="all">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Action Type</label>
                <select value={selectedAction}
                  onChange={(e) => { setSelectedAction(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all">
                  {actionOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter pills */}
            {(selectedEmployee !== 'all' || selectedAction !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedEmployee !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                    {employees.find(e => e._id === selectedEmployee)?.name || 'Employee'}
                    <button onClick={() => setSelectedEmployee('all')} className="hover:text-violet-900 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedAction !== 'all' && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ring-1 ${ac(selectedAction).bg} ${ac(selectedAction).text} ${ac(selectedAction).ring}`}>
                    {ac(selectedAction).icon} {formatActionName(selectedAction)}
                    <button onClick={() => setSelectedAction('all')} className="hover:opacity-70 transition-opacity">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                <button onClick={() => { setSelectedEmployee('all'); setSelectedAction('all'); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Activity Timeline
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Showing {activities.length} of {pagination.total}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">No activities found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {activities.map((activity, idx) => {
                  const cfg = ac(activity.action);
                  return (
                    <div key={activity._id}
                      className="flex gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                      {/* Icon */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md text-lg flex-shrink-0`}>
                          {cfg.icon}
                        </div>
                        {idx < activities.length - 1 && (
                          <div className="w-0.5 flex-1 bg-slate-100 mt-2 min-h-[12px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                          <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">
                            {activity.description}
                          </p>
                          <span className={`self-start flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
                            {cfg.icon} {formatActionName(activity.action)}
                          </span>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          {activity.performedBy?.name && (
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                {activity.performedBy.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-600">{activity.performedBy.name}</span>
                            </span>
                          )}
                          {activity.companyName && (
                            <>
                              <span className="text-slate-200">·</span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {activity.companyName}
                              </span>
                            </>
                          )}
                          <span className="text-slate-200">·</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>

                        {/* Status change pill */}
                        {activity.oldStatus && activity.newStatus && (
                          <div className="mt-2.5 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium">
                            <span className="text-amber-600 font-semibold">{activity.oldStatus}</span>
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="text-emerald-600 font-semibold">{activity.newStatus}</span>
                          </div>
                        )}

                        {/* Remark */}
                        {activity.metadata?.remark && (
                          <div className="mt-2.5 flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
                            <svg className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-purple-700 font-medium leading-relaxed">{activity.metadata.remark}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button key={page}
                        onClick={() => setPagination(p => ({ ...p, page }))}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${pagination.page === page ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
                        {page}
                      </button>
                    );
                  })}
                  {pagination.pages > 5 && <span className="text-slate-400 px-1">…</span>}
                </div>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}