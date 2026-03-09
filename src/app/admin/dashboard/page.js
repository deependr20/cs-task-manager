'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import TaskCard from '@/components/TaskCard';
import MemoPreview from '@/components/MemoPreview';
import companyForms from '@/data/company-forms.json';
import { getCompanyDisplayLabel } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const raisedMemosRef = useRef(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const TASKS_PER_PAGE = 6;
  const [tasksPage, setTasksPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'Medium',
    dueDate: '', completionDate: '', companyName: '', assignedTo: '', form: '', srnOfeForm: '',
  });
  const [selectedFormKey, setSelectedFormKey] = useState('');
  const [formDueDateGuideline, setFormDueDateGuideline] = useState('');
  const [employeeForm, setEmployeeForm] = useState({
    name: '', email: '', password: '', role: 'employee', designation: '',
  });
  const [approvalNotes, setApprovalNotes] = useState({});
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedTaskForMemo, setSelectedTaskForMemo] = useState(null);
  const [memoForm, setMemoForm] = useState({ companyName: '', memoDate: '', particulars: '', amount: '', sentTo: '', followUpDate: '', paymentDate: '', status: 'Draft' });
  const [savingMemo, setSavingMemo] = useState(false);
  const [memos, setMemos] = useState([]);
  const [previewMemo, setPreviewMemo] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [memoStatusFilter, setMemoStatusFilter] = useState('all');

  useEffect(() => {
    fetchUser(); fetchStats(); fetchTasks(); fetchEmployees();
  }, [selectedEmployee, selectedStatus]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMemos();
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    setTasksPage(1);
  }, [selectedEmployee, selectedStatus]);

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
      const params = new URLSearchParams();
      if (selectedEmployee !== 'all') params.append('employeeId', selectedEmployee);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', credentials: 'include' });
      if (res.ok) { const data = await res.json(); setTasks(data.tasks); }
    } catch {} finally { setLoading(false); }
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

  const scrollToRaisedMemos = () => {
    const el = raisedMemosRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const url = editingTask ? `/api/tasks/${editingTask._id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        setShowTaskModal(false); setEditingTask(null);
        setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '', completionDate: '', companyName: '', assignedTo: '', form: '', srnOfeForm: '' });
        setSelectedFormKey(''); setFormDueDateGuideline('');
        fetchTasks(); fetchStats();
      }
    } catch {}
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchTasks(); fetchStats(); }
    } catch {}
  };

  const handleApproveTask = async (taskId) => {
    const note = approvalNotes[taskId]?.trim() || '';
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ status: 'Completed', ...(note && { remark: note }) }),
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

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title, description: task.description, priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
      completionDate: task.completionDate ? task.completionDate.split('T')[0] : '',
      companyName: task.companyName || '', assignedTo: task.assignedTo._id,
      form: task.form || '', srnOfeForm: task.srnOfeForm || '',
    });
    setSelectedFormKey(''); setFormDueDateGuideline(''); setShowTaskModal(true);
  };

  const openRaiseMemo = (task) => {
    setSelectedTaskForMemo(task);
    setMemoForm({ companyName: task.companyName || '', memoDate: new Date().toISOString().slice(0, 10), particulars: '', amount: '', sentTo: '', followUpDate: '', paymentDate: '', status: 'Draft' });
    setShowMemoModal(true);
  };

  const handleCreateMemo = async (e) => {
    e.preventDefault();
    if (!selectedTaskForMemo) return;
    setSavingMemo(true);
    try {
      const res = await fetch('/api/memos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ taskId: selectedTaskForMemo._id, companyName: memoForm.companyName, memoDate: memoForm.memoDate, particulars: memoForm.particulars, amount: Number(memoForm.amount) || 0, sentTo: memoForm.sentTo, followUpDate: memoForm.followUpDate || undefined, paymentDate: memoForm.paymentDate || undefined, status: memoForm.status }),
      });
      if (res.ok) { setShowMemoModal(false); setSelectedTaskForMemo(null); fetchMemos(); }
    } catch {} finally { setSavingMemo(false); }
  };

  const handleCompanyFormSelect = (e) => {
    const key = e.target.value;
    setSelectedFormKey(key);
    if (!key) { setFormDueDateGuideline(''); return; }
    const [type, formName] = key.split('|||');
    const form = companyForms.find((f) => f.type === type && f.form_name === formName);
    if (form) { setTaskForm((prev) => ({ ...prev, description: form.description, form: form.form_name })); setFormDueDateGuideline(form.due_date || ''); }
    else setFormDueDateGuideline('');
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(employeeForm),
      });
      if (res.ok) {
        setShowEmployeeModal(false);
        setEmployeeForm({ name: '', email: '', password: '', role: 'employee', designation: '' });
        fetchEmployees(); fetchStats();
      }
    } catch {}
  };

  const pendingApprovals = tasks.filter(t => t.status === 'Pending Admin Approval');

  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));
  const safeTasksPage = Math.min(Math.max(tasksPage, 1), totalTaskPages);
  const pagedTasks = tasks.slice(
    (safeTasksPage - 1) * TASKS_PER_PAGE,
    safeTasksPage * TASKS_PER_PAGE
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main content - offset for sidebar (none on mobile, full on md+) */}
      <div className="pt-16 pl-0 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Page Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">
                Welcome back, <span className="text-violet-600 font-semibold">{user?.name}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/admin/activity-logs')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Activity Logs
              </button>
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Employee
              </button>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '', completionDate: '', companyName: '', assignedTo: '', form: '', srnOfeForm: '' });
                  setSelectedFormKey(''); setFormDueDateGuideline('');
                  setShowTaskModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-[1.02] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </button>
            </div>
          </div>

          {/* Stats Grid - click to filter tasks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
            <StatsCard title="Memos" value={memos.length} color="purple"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              onClick={() => { setMemoStatusFilter('all'); scrollToRaisedMemos(); }}
              active={memoStatusFilter === 'all'}
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Task Status</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all">
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Manager Approval">Pending Manager Approval</option>
                  <option value="Pending Admin Approval">Pending Admin Approval</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Memo</label>
                <select value={memoStatusFilter} onChange={(e) => setMemoStatusFilter(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all">
                  <option value="all">All Memos</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-100">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Pending Approvals</h2>
                    <p className="text-xs text-slate-500">Review and approve task completions</p>
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
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
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
                        Approve
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-100">
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
              <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin"></div>
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
                  const existingMemo =
                    memos.find((m) => (m.taskId?._id ?? m.taskId)?.toString?.() === taskIdStr) || null;
                  return (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onRaiseMemo={openRaiseMemo}
                      onViewMemo={setPreviewMemo}
                      existingMemo={existingMemo}
                      role="admin"
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
                    <span className="text-slate-700 font-bold">
                      {Math.min(safeTasksPage * TASKS_PER_PAGE, tasks.length)}
                    </span>
                    {' '}of{' '}
                    <span className="text-slate-700 font-bold">{tasks.length}</span> tasks
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setTasksPage((p) => Math.max(1, p - 1))}
                      disabled={safeTasksPage === 1}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ring-1 ${
                        safeTasksPage === 1
                          ? 'bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Prev
                    </button>

                    {(() => {
                      const pages = [];
                      const add = (v) => pages.push(v);
                      const last = totalTaskPages;
                      const cur = safeTasksPage;

                      if (last <= 7) {
                        for (let i = 1; i <= last; i++) add(i);
                      } else {
                        add(1);
                        if (cur > 3) add('…');
                        const start = Math.max(2, cur - 1);
                        const end = Math.min(last - 1, cur + 1);
                        for (let i = start; i <= end; i++) add(i);
                        if (cur < last - 2) add('…');
                        add(last);
                      }

                      return pages.map((p, idx) => {
                        if (p === '…') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm font-bold">
                              …
                            </span>
                          );
                        }
                        const active = p === cur;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTasksPage(p)}
                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ring-1 ${
                              active
                                ? 'text-white ring-violet-200 shadow-md shadow-violet-100'
                                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
                            }`}
                            style={active ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } : undefined}
                          >
                            {p}
                          </button>
                        );
                      });
                    })()}

                    <button
                      type="button"
                      onClick={() => setTasksPage((p) => Math.min(totalTaskPages, p + 1))}
                      disabled={safeTasksPage === totalTaskPages}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ring-1 ${
                        safeTasksPage === totalTaskPages
                          ? 'bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Employee Stats Table */}
          {stats?.employeeTaskStats?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base font-bold text-slate-800 mb-4">Employee Task Distribution</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.employeeTaskStats.map((emp) => (
                      <tr key={emp.employeeId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-5 text-sm font-semibold text-slate-800">{emp.employeeName}</td>
                        <td className="text-center py-3 px-4 text-sm font-bold text-slate-800">{emp.total}</td>
                        <td className="text-center py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">{emp.pending}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">{emp.inProgress}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">{emp.completed}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raised Memos - gradient section with filter */}
          <div
            ref={raisedMemosRef}
            className="mt-8 rounded-2xl overflow-hidden border border-slate-200 shadow-lg scroll-mt-24"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Raised Memos</h2>
                  <p className="text-white/80 text-sm">Memos that have been raised — filter by status</p>
                </div>
                <span className="ml-auto text-sm font-bold text-white/90 bg-white/20 px-3 py-1.5 rounded-xl">
                  {memoStatusFilter === 'all' ? memos.length : memos.filter(m => m.status === memoStatusFilter).length} memo{(memoStatusFilter === 'all' ? memos.length : memos.filter(m => m.status === memoStatusFilter).length) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Sent', label: 'Sent' },
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Overdue', label: 'Overdue' },
                  { value: 'Cancelled', label: 'Cancelled' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMemoStatusFilter(value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      memoStatusFilter === value ? 'bg-white text-violet-700 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {label}
                    {value !== 'all' && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-xs font-bold ${memoStatusFilter === value ? 'bg-violet-100 text-violet-700' : 'bg-white/20'}`}>
                        {memos.filter(m => m.status === value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur p-6 rounded-t-2xl min-h-[100px]">
              {(memoStatusFilter === 'all' ? memos : memos.filter(m => m.status === memoStatusFilter)).length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="font-medium">No memos raised yet</p>
                  <p className="text-sm mt-1">Memos will appear here once raised from tasks.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(memoStatusFilter === 'all' ? memos : memos.filter(m => m.status === memoStatusFilter)).map((memo) => (
                    <div key={memo._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-violet-600">{memo.memoNo}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          memo.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' :
                          memo.status === 'Sent' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' :
                          memo.status === 'Draft' ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' :
                          memo.status === 'Overdue' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' :
                          'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                        }`}>
                          {memo.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 truncate">{getCompanyDisplayLabel(companies, memo.companyName)}</p>
                      {memo.taskId && <p className="text-xs text-slate-500 mt-0.5 truncate">{memo.taskId.title || 'Task'}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">₹{Number(memo.amount).toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-400">{memo.memoDate ? new Date(memo.memoDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setPreviewMemo(memo)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 ring-1 ring-violet-200 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div>
                <h2 className="text-xl font-black text-white">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                <p className="text-white/70 text-sm">{editingTask ? 'Update task details' : 'Assign a task to your team'}</p>
              </div>
              <button onClick={() => { setShowTaskModal(false); setEditingTask(null); }}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Task Title</label>
                  <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Company Form (Optional)</label>
                  <select value={selectedFormKey} onChange={handleCompanyFormSelect}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all">
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
                    <p className="mt-2 text-xs text-violet-700 bg-violet-50 px-3 py-2 rounded-lg">
                      <span className="font-bold">Due date guideline:</span> {formDueDateGuideline}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Description</label>
                  <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all resize-none"
                    rows="4" placeholder="Select a form to auto-fill, or type manually" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Company</label>
                  <select value={taskForm.companyName} onChange={(e) => setTaskForm({ ...taskForm, companyName: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Priority</label>
                    <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all">
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Due Date</label>
                    <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required />
                    {formDueDateGuideline && (
                      <p className="mt-1 text-xs text-violet-700">Guideline: {formDueDateGuideline}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Completion Date</label>
                    <input type="date" value={taskForm.completionDate} onChange={(e) => setTaskForm({ ...taskForm, completionDate: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Assign To</label>
                  <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all" required>
                    <option value="">Select Assignee</option>
                    {user && <option value={user._id || user.id}>{user.name} – Admin (Self)</option>}
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.name} – {emp.role === 'manager' ? 'Manager' : 'Employee'}{emp.designation ? ` (${emp.designation})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Form (optional)</label>
                    <input type="text" value={taskForm.form || ''} onChange={(e) => setTaskForm({ ...taskForm, form: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700" placeholder="e.g. RUN, SPICe+" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">SRN of e-Form (optional)</label>
                    <input type="text" value={taskForm.srnOfeForm || ''} onChange={(e) => setTaskForm({ ...taskForm, srnOfeForm: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700" placeholder="Service request number" />
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 hover:scale-[1.02] transition-all">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div>
                <h2 className="text-xl font-black text-white">Add New Employee</h2>
                <p className="text-white/70 text-sm">Add a new team member</p>
              </div>
              <button onClick={() => setShowEmployeeModal(false)}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email Address', key: 'email', type: 'email' },
                  { label: 'Password', key: 'password', type: 'password' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
                    <input type={type} value={employeeForm[key]} onChange={(e) => setEmployeeForm({ ...employeeForm, [key]: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" required />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Role</label>
                    <select value={employeeForm.role} onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" required>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Designation</label>
                    <select value={employeeForm.designation} onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" required>
                      <option value="">Select</option>
                      <option>Admin</option><option>Manager</option><option>Employee</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEmployeeModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200 hover:scale-[1.02] transition-all">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raise Memo Modal */}
      {showMemoModal && selectedTaskForMemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div>
                <h2 className="text-xl font-black text-white">Raise Memo</h2>
                <p className="text-white/80 text-sm">Fee memo for: {selectedTaskForMemo.title}</p>
                <a href="/Memo%20of%20Fees_Draft.pdf" target="_blank" rel="noopener noreferrer" className="text-white/90 text-xs underline mt-1 inline-block">View template PDF</a>
              </div>
              <button type="button" onClick={() => { setShowMemoModal(false); setSelectedTaskForMemo(null); }} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateMemo} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Company Name</label>
                <input type="text" value={memoForm.companyName} onChange={(e) => setMemoForm({ ...memoForm, companyName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Memo Date</label>
                <input type="date" value={memoForm.memoDate} onChange={(e) => setMemoForm({ ...memoForm, memoDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Particulars</label>
                <textarea value={memoForm.particulars} onChange={(e) => setMemoForm({ ...memoForm, particulars: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Professional fees / reimbursements" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Amount (INR)</label>
                <input type="number" min="0" step="0.01" value={memoForm.amount} onChange={(e) => setMemoForm({ ...memoForm, amount: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sent To</label>
                <input type="text" value={memoForm.sentTo} onChange={(e) => setMemoForm({ ...memoForm, sentTo: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Client contact" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Follow Up Date</label>
                  <input type="date" value={memoForm.followUpDate} onChange={(e) => setMemoForm({ ...memoForm, followUpDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Payment Date</label>
                  <input type="date" value={memoForm.paymentDate} onChange={(e) => setMemoForm({ ...memoForm, paymentDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                <select value={memoForm.status} onChange={(e) => setMemoForm({ ...memoForm, status: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowMemoModal(false); setSelectedTaskForMemo(null); }} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={savingMemo} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500">{savingMemo ? 'Saving…' : 'Save Memo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewMemo && <MemoPreview memo={previewMemo} onClose={() => setPreviewMemo(null)} />}
    </div>
  );
}