'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import TaskCard from '@/components/TaskCard';

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [remark, setRemark] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { fetchUser(); fetchStats(); fetchTasks(); }, [selectedStatus]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'employee') router.push('/admin/dashboard');
        else setUser(data.user);
      } else router.push('/');
    } catch { router.push('/'); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setStats(data.stats); }
    } catch {}
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = '/api/tasks';
      if (selectedStatus !== 'all') url += `?status=${selectedStatus}`;
      const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setTasks(data.tasks); }
    } catch {} finally { setLoading(false); }
  };

  const handleStatusChange = (taskId, status) => {
    setSelectedTask(taskId); setNewStatus(status); setShowRemarkModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tasks/${selectedTask}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: newStatus, remark: remark.trim() }),
      });
      if (res.ok) {
        setShowRemarkModal(false); setSelectedTask(null); setRemark(''); setNewStatus('');
        fetchTasks(); fetchStats();
      }
    } catch {}
  };

  if (!user) return null;

  const statusOptions = [
    { value: 'all',                          label: 'All' },
    { value: 'Pending',                      label: 'Pending' },
    { value: 'In Progress',                  label: 'In Progress' },
    { value: 'Pending Manager Approval',     label: 'Pending Approval' },
    { value: 'Pending Admin Approval',       label: 'Admin Review' },
    { value: 'Completed',                    label: 'Completed' },
  ];

  // Quick counts for the overview
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-800">My Tasks</h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, <span className="text-emerald-600 font-semibold">{user?.name}</span>
            </p>
          </div>

          {/* Overdue alert banner */}
          {overdueTasks.length > 0 && (
            <div className="mb-5 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-rose-700">
                  {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}
                </p>
                <p className="text-xs text-rose-500">Please update these tasks immediately</p>
              </div>
              <button onClick={() => setSelectedStatus('Pending')}
                className="flex-shrink-0 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-2 rounded-xl transition-all">
                View
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatsCard title="Total Tasks" value={stats?.totalTasks || 0} color="primary"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            />
            <StatsCard title="Pending" value={stats?.pendingTasks || 0} color="amber"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatsCard title="In Progress" value={stats?.inProgressTasks || 0} color="blue"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <StatsCard title="Completed" value={stats?.completedTasks || 0} color="green"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>

          {/* Filter pills */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(({ value, label }) => (
                <button key={value} onClick={() => setSelectedStatus(value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedStatus === value
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {label}
                  {value !== 'all' && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs font-bold ${selectedStatus === value ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}>
                      {tasks.filter(t => value === 'all' || t.status === value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-100">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-slate-800">Assigned Tasks</h2>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              {tasks.length} tasks
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No tasks assigned yet</p>
              <p className="text-slate-400 text-sm mt-1">Check back later or ask your manager</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} role="employee" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── UPDATE STATUS MODAL ── */}
      {showRemarkModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-2xl sm:max-w-md overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div>
                <h2 className="text-xl font-black text-white">Update Status</h2>
                <p className="text-white/70 text-sm">Add a note and confirm the change</p>
              </div>
              <button onClick={() => { setShowRemarkModal(false); setSelectedTask(null); setRemark(''); setNewStatus(''); }}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateTask}>
              <div className="p-6 space-y-4">
                {/* New status preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Updating Status To</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">{newStatus}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Add Remark
                    <span className="text-slate-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all resize-none"
                    rows="4" placeholder="Describe your progress, blockers, or notes..." />
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button type="button"
                  onClick={() => { setShowRemarkModal(false); setSelectedTask(null); setRemark(''); setNewStatus(''); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200 hover:scale-[1.02] transition-all">
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}