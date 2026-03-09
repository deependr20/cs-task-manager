'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import TaskCard from '@/components/TaskCard';
import MemoPreview from '@/components/MemoPreview';
import companyForms from '@/data/company-forms.json';
import { getCompanyDisplayLabel } from '@/lib/utils';

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [approvalNotes, setApprovalNotes] = useState({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'Medium',
    dueDate: '', completionDate: '', companyName: '', assignedTo: '',
    spocName: '', spocNumber: '',
  });
  const [selectedFormKey, setSelectedFormKey] = useState('');
  const [formDueDateGuideline, setFormDueDateGuideline] = useState('');
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedTaskForMemo, setSelectedTaskForMemo] = useState(null);
  const [memoForm, setMemoForm] = useState({
    companyName: '', memoDate: '', particulars: '', amount: '',
    sentTo: '', followUpDate: '', paymentDate: '', status: 'Draft',
  });
  const [savingMemo, setSavingMemo] = useState(false);
  const [memos, setMemos] = useState([]);
  const [previewMemo, setPreviewMemo] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);
  const [statusRemark, setStatusRemark] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const TASKS_PER_PAGE = 6;
  const [tasksPage, setTasksPage] = useState(1);

  useEffect(() => {
    fetchUser(); fetchStats(); fetchTasks(); fetchEmployees();
  }, [selectedStatus]);

  useEffect(() => {
    setTasksPage(1);
  }, [selectedStatus]);

  useEffect(() => {
    if (user?.role === 'manager') {
      fetchMemos();
      fetchCompanies();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'manager') {
          router.push(data.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
        } else setUser(data.user);
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
      if (selectedStatus !== 'all') url += `?status=${encodeURIComponent(selectedStatus)}`;
      const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setTasks(data.tasks); }
    } catch {} finally { setLoading(false); }
  };

  const handleStatusChange = (taskId, status) => {
    setSelectedTaskForStatus(taskId);
    setNewStatus(status);
    setStatusRemark('');
    setShowRemarkModal(true);
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setEmployees(data.users); }
    } catch {}
  };

  const fetchMemos = async () => {
    try {
      const res = await fetch('/api/memos', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setMemos(data.memos || []); }
    } catch {}
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies', { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setCompanies(data.companies || []); }
    } catch {}
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        setShowTaskModal(false);
        setTaskForm({
          title: '', description: '', priority: 'Medium',
          dueDate: '', completionDate: '', companyName: '', assignedTo: '',
          spocName: '', spocNumber: '',
        });
        setSelectedFormKey(''); setFormDueDateGuideline('');
        fetchTasks(); fetchStats();
      }
    } catch {}
  };

  const handleCompanyFormSelect = (e) => {
    const key = e.target.value;
    setSelectedFormKey(key);
    if (!key) { setFormDueDateGuideline(''); return; }
    const [type, formName] = key.split('|||');
    const form = companyForms.find((f) => f.type === type && f.form_name === formName);
    if (form) { setTaskForm((prev) => ({ ...prev, description: form.description })); setFormDueDateGuideline(form.due_date || ''); }
    else setFormDueDateGuideline('');
  };

  const handleApproveTask = async (taskId) => {
    const note = approvalNotes[taskId]?.trim() || '';
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: 'Pending Admin Approval', ...(note && { remark: note }) }),
      });
      if (res.ok) {
        setApprovalNotes((prev) => { const next = { ...prev }; delete next[taskId]; return next; });
        fetchTasks(); fetchStats();
      }
    } catch {}
  };

  const handleRejectTask = async (taskId) => {
    if (!confirm('Reject this task?')) return;
    const note = approvalNotes[taskId]?.trim() || '';
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: 'In Progress', ...(note && { remark: note }) }),
      });
      if (res.ok) {
        setApprovalNotes((prev) => { const next = { ...prev }; delete next[taskId]; return next; });
        fetchTasks(); fetchStats();
      }
    } catch {}
  };

  const handleUpdateTaskStatus = async (e) => {
    e.preventDefault();
    if (!selectedTaskForStatus || !newStatus) return;
    try {
      const res = await fetch(`/api/tasks/${selectedTaskForStatus}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          ...(statusRemark.trim() && { remark: statusRemark.trim() }),
        }),
      });
      if (res.ok) {
        setShowRemarkModal(false);
        setSelectedTaskForStatus(null);
        setStatusRemark('');
        setNewStatus('');
        fetchTasks();
        fetchStats();
      }
    } catch {}
  };

  const openRaiseMemo = (task) => {
    setSelectedTaskForMemo(task);
    setMemoForm({
      companyName: task.companyName || '',
      memoDate: new Date().toISOString().slice(0, 10),
      particulars: '', amount: '', sentTo: '', followUpDate: '', paymentDate: '', status: 'Draft',
    });
    setShowMemoModal(true);
  };

  const handleCreateMemo = async (e) => {
    e.preventDefault();
    if (!selectedTaskForMemo) return;
    setSavingMemo(true);
    try {
      const res = await fetch('/api/memos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          taskId: selectedTaskForMemo._id, companyName: memoForm.companyName,
          memoDate: memoForm.memoDate, particulars: memoForm.particulars,
          amount: Number(memoForm.amount) || 0, sentTo: memoForm.sentTo,
          followUpDate: memoForm.followUpDate || undefined,
          paymentDate: memoForm.paymentDate || undefined, status: memoForm.status,
        }),
      });
      if (res.ok) { setShowMemoModal(false); setSelectedTaskForMemo(null); fetchMemos(); }
    } catch {} finally { setSavingMemo(false); }
  };

  const pendingApprovals = tasks.filter((t) => t.status === 'Pending Manager Approval');

  if (!user) return null;

  const perms = user.managerPermissions || {};

  const inputCls = "w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all";
  const managerId = user._id || user.id;
  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));
  const safeTasksPage = Math.min(Math.max(tasksPage, 1), totalTaskPages);
  const pagedTasks = tasks.slice((safeTasksPage - 1) * TASKS_PER_PAGE, safeTasksPage * TASKS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Manager Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">
                Welcome back, <span className="text-blue-600 font-semibold">{user?.name}</span>
              </p>
            </div>
            {perms.canCreateTasks !== false && (
              <button
                onClick={() => {
                  setTaskForm({
                    title: '',
                    description: '',
                    priority: 'Medium',
                    dueDate: '',
                    completionDate: '',
                    companyName: '',
                    assignedTo: '',
                  });
                  setSelectedFormKey('');
                  setFormDueDateGuideline('');
                  setShowTaskModal(true);
                }}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </button>
            )}
          </div>

          {/* Stats - click to filter tasks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Tasks" value={stats?.totalTasks || 0} color="primary"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              onClick={() => setSelectedStatus('all')}
              active={selectedStatus === 'all'}
            />
            <StatsCard title="Pending" value={stats?.pendingTasks || 0} color="amber"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              onClick={() => setSelectedStatus('Pending')}
              active={selectedStatus === 'Pending'}
            />
            <StatsCard title="In Progress" value={stats?.inProgressTasks || 0} color="blue"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              onClick={() => setSelectedStatus('In Progress')}
              active={selectedStatus === 'In Progress'}
            />
            <StatsCard title="Completed" value={stats?.completedTasks || 0} color="green"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              onClick={() => setSelectedStatus('Completed')}
              active={selectedStatus === 'Completed'}
            />
          </div>

          {/* Filter pills */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Pending Manager Approval', label: 'Pending Approval' },
                { value: 'Pending Admin Approval', label: 'Admin Approval' },
                { value: 'Completed', label: 'Completed' },
              ].map(({ value, label }) => (
                <button key={value} onClick={() => setSelectedStatus(value)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedStatus === value
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          {perms.canApproveTasks !== false && pendingApprovals.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-100">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Manager Approvals</h2>
                    <p className="text-xs text-slate-500">Review completions from your team</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-xl ring-1 ring-orange-200">
                  {pendingApprovals.length} awaiting
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {pendingApprovals.map((task) => (
                  <div key={task._id} className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm p-5">
                    <h3 className="font-bold text-slate-800 text-base mb-1">{task.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                    <div className="space-y-1 mb-3 text-sm">
                      <p><span className="font-semibold text-slate-600">Company:</span> <span className="text-slate-700">{getCompanyDisplayLabel(companies, task.companyName)}</span></p>
                      <p><span className="font-semibold text-slate-600">Assigned:</span> <span className="text-slate-700">{task.assignedTo?.name}</span></p>
                    </div>
                    {task.remarks?.length > 0 && (
                      <div className="bg-orange-50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-semibold text-orange-700 mb-1">Latest Remark</p>
                        <p className="text-xs text-slate-600">{task.remarks[task.remarks.length - 1].note}</p>
                      </div>
                    )}
                    <textarea
                      value={approvalNotes[task._id] ?? ''}
                      onChange={(e) => setApprovalNotes((prev) => ({ ...prev, [task._id]: e.target.value }))}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      rows={2} placeholder="Add a note (optional)..."
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleRejectTask(task._id)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject
                      </button>
                      <button onClick={() => handleApproveTask(task._id)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Approve → Admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-100">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-slate-800">All Tasks</h2>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              {tasks.length} tasks
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No tasks found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagedTasks.map((task) => {
                  const taskIdStr = task._id?.toString?.() ?? task._id;
                  const existingMemo = memos.find((m) => (m.taskId?._id ?? m.taskId)?.toString?.() === taskIdStr) || null;
                  const canSelfUpdate =
                    task.assignedTo &&
                    (task.assignedTo._id === managerId || task.assignedTo.id === managerId);
                  return (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onRaiseMemo={perms.canRaiseMemos === false ? undefined : openRaiseMemo}
                      onViewMemo={setPreviewMemo}
                      existingMemo={existingMemo}
                      role="manager"
                      onStatusChange={canSelfUpdate ? handleStatusChange : undefined}
                      companies={companies}
                    />
                  );
                })}
              </div>
              {totalTaskPages > 1 && (
                <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Showing <span className="text-slate-700 font-bold">{(safeTasksPage - 1) * TASKS_PER_PAGE + 1}</span>
                    {' '}to{' '}
                    <span className="text-slate-700 font-bold">{Math.min(safeTasksPage * TASKS_PER_PAGE, tasks.length)}</span>
                    {' '}of{' '}
                    <span className="text-slate-700 font-bold">{tasks.length}</span> tasks
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setTasksPage((p) => Math.max(1, p - 1))}
                      disabled={safeTasksPage === 1}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ring-1 ${safeTasksPage === 1 ? 'bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalTaskPages }, (_, i) => i + 1).map((p) => {
                      const active = p === safeTasksPage;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTasksPage(p)}
                          className={`w-10 h-10 rounded-xl text-xs font-black transition-all ring-1 ${active ? 'text-white ring-blue-200 shadow-md shadow-blue-100' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
                          style={active ? { background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' } : undefined}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setTasksPage((p) => Math.min(totalTaskPages, p + 1))}
                      disabled={safeTasksPage === totalTaskPages}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ring-1 ${safeTasksPage === totalTaskPages ? 'bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ── UPDATE STATUS MODAL (Manager self tasks) ── */}
      {showRemarkModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-2xl sm:max-w-md overflow-hidden">
            <div
              className="px-6 py-5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' }}
            >
              <div>
                <h2 className="text-xl font-black text-white">Update Status</h2>
                <p className="text-white/70 text-sm">Add a note and confirm the change</p>
              </div>
              <button
                onClick={() => {
                  setShowRemarkModal(false);
                  setSelectedTaskForStatus(null);
                  setStatusRemark('');
                  setNewStatus('');
                }}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateTaskStatus}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Updating Status To</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">{newStatus}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Add Remark
                    <span className="text-slate-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={statusRemark}
                    onChange={(e) => setStatusRemark(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all resize-none"
                    rows="4"
                    placeholder="Describe your progress, blockers, or notes..."
                  />
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemarkModal(false);
                    setSelectedTaskForStatus(null);
                    setStatusRemark('');
                    setNewStatus('');
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all"
                >
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE TASK MODAL ── */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-2xl sm:max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' }}>
              <div>
                <h2 className="text-xl font-black text-white">Create New Task</h2>
                <p className="text-white/70 text-sm">Assign a task to your team</p>
              </div>
              <button onClick={() => setShowTaskModal(false)}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Task Title</label>
                  <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Company Form (Optional)</label>
                  <select value={selectedFormKey} onChange={handleCompanyFormSelect} className={inputCls}>
                    <option value="">Select a form (optional)</option>
                    <optgroup label="Company forms">
                      {companyForms.filter((f) => f.type === 'company').map((f) => (
                        <option key={`${f.type}-${f.form_name}`} value={`${f.type}|||${f.form_name}`}>{f.form_name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="LLP forms">
                      {companyForms.filter((f) => f.type === 'llp').map((f) => (
                        <option key={`${f.type}-${f.form_name}`} value={`${f.type}|||${f.form_name}`}>{f.form_name}</option>
                      ))}
                    </optgroup>
                  </select>
                  {formDueDateGuideline && (
                    <p className="mt-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="font-bold">Due date guideline:</span> {formDueDateGuideline}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Description</label>
                  <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className={`${inputCls} resize-none`} rows="4"
                    placeholder="Select a form to auto-fill, or type manually" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Company</label>
                  <select value={taskForm.companyName} onChange={(e) => setTaskForm({ ...taskForm, companyName: e.target.value })}
                    className={inputCls} required>
                    <option value="">Select company</option>
                    {companies.map((c) => {
                    const label = (c.fileNumber && String(c.fileNumber).trim()) ? `${String(c.fileNumber).trim()} – ${c.name || '–'}` : (c.name || '–');
                    return <option key={c._id} value={label}>{label}{c.cin ? ` (${c.cin})` : ''}</option>;
                  })}
                  </select>
                  {companies.length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-700">No companies yet. Add companies from the Companies page.</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Priority</label>
                    <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className={inputCls}>
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">To be completed by</label>
                    <input type="date" value={taskForm.completionDate} onChange={(e) => setTaskForm({ ...taskForm, completionDate: e.target.value })}
                      className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Due Date</label>
                    <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className={inputCls} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Assign To</label>
                  <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className={inputCls} required>
                    <option value="">Select Assignee</option>
                    {user && <option value={user._id || user.id}>{user.name} – Manager (Self)</option>}
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} – {emp.role === 'manager' ? 'Manager' : 'Employee'}{emp.designation ? ` (${emp.designation})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">SPOC Name (optional)</label>
                    <input
                      type="text"
                      value={taskForm.spocName || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, spocName: e.target.value })}
                      className={inputCls}
                      placeholder="Single point of contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">SPOC Number (optional)</label>
                    <input
                      type="text"
                      value={taskForm.spocNumber || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, spocNumber: e.target.value })}
                      className={inputCls}
                      placeholder="Contact number"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-white">
                <button type="button" onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all"
                  style={{ background: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' }}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RAISE MEMO MODAL ── */}
      {showMemoModal && selectedTaskForMemo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-2xl sm:max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div>
                <h2 className="text-xl font-black text-white">Raise Memo</h2>
                <p className="text-white/70 text-sm truncate max-w-[240px]">For: {selectedTaskForMemo.title}</p>
              </div>
              <button onClick={() => { setShowMemoModal(false); setSelectedTaskForMemo(null); }}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateMemo} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Company Name</label>
                  <input type="text" value={memoForm.companyName} onChange={(e) => setMemoForm({ ...memoForm, companyName: e.target.value })}
                    className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Memo Date</label>
                  <input type="date" value={memoForm.memoDate} onChange={(e) => setMemoForm({ ...memoForm, memoDate: e.target.value })}
                    className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Particulars</label>
                  <textarea value={memoForm.particulars} onChange={(e) => setMemoForm({ ...memoForm, particulars: e.target.value })}
                    rows={3} placeholder="Professional fees / reimbursements"
                    className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                    <input type="number" min="0" step="0.01" value={memoForm.amount}
                      onChange={(e) => setMemoForm({ ...memoForm, amount: e.target.value })}
                      className={`${inputCls} pl-8`} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Sent To</label>
                  <input type="text" value={memoForm.sentTo} placeholder="Client contact"
                    onChange={(e) => setMemoForm({ ...memoForm, sentTo: e.target.value })} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Follow Up Date</label>
                    <input type="date" value={memoForm.followUpDate}
                      onChange={(e) => setMemoForm({ ...memoForm, followUpDate: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Payment Date</label>
                    <input type="date" value={memoForm.paymentDate}
                      onChange={(e) => setMemoForm({ ...memoForm, paymentDate: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Status</label>
                  <select value={memoForm.status} onChange={(e) => setMemoForm({ ...memoForm, status: e.target.value })} className={inputCls}>
                    <option>Draft</option><option>Sent</option><option>Paid</option>
                    <option>Overdue</option><option>Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-white">
                <button type="button" onClick={() => { setShowMemoModal(false); setSelectedTaskForMemo(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={savingMemo}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100">
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

      {previewMemo && <MemoPreview memo={previewMemo} onClose={() => setPreviewMemo(null)} />}
    </div>
  );
}