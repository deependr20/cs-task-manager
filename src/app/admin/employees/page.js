'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [accessManager, setAccessManager] = useState(null);
  const [accessSaving, setAccessSaving] = useState(false);
  const [accessForm, setAccessForm] = useState({
    accessTaskSheet: true,
    accessMemoDetails: true,
    accessCompanies: true,
    canCreateTasks: true,
    canApproveTasks: true,
    canRaiseMemos: true,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user.role !== 'admin') {
          const redirectPath =
            data.user.role === 'superadmin'
              ? '/superadmin/dashboard'
              : data.user.role === 'manager'
              ? '/manager/dashboard'
              : '/employee/dashboard';
          router.push(redirectPath);
        } else {
          setUser(data.user);
          fetchEmployees();
        }
      } else {
        router.push('/');
      }
    } catch {
      router.push('/');
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (id, newRole) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp._id === id ? { ...emp, role: newRole } : emp)),
    );
  };

  const openAccessModal = (emp) => {
    const perms = emp.managerPermissions || {};
    setAccessForm({
      accessTaskSheet: perms.accessTaskSheet !== false,
      accessMemoDetails: perms.accessMemoDetails !== false,
      accessCompanies: perms.accessCompanies !== false,
      canCreateTasks: perms.canCreateTasks !== false,
      canApproveTasks: perms.canApproveTasks !== false,
      canRaiseMemos: perms.canRaiseMemos !== false,
    });
    setAccessManager(emp);
  };

  const handleSaveAccess = async () => {
    if (!accessManager) return;
    setAccessSaving(true);
    try {
      const res = await fetch(`/api/users/${accessManager._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          managerPermissions: accessForm,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees((prev) =>
          prev.map((e) => (e._id === accessManager._id ? data.user : e)),
        );
        setAccessManager(null);
      }
    } catch {
      // ignore
    } finally {
      setAccessSaving(false);
    }
  };

  const handleSave = async (emp) => {
    setSavingId(emp._id);
    try {
      const res = await fetch(`/api/users/${emp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: emp.name,
          email: emp.email,
          designation: emp.designation,
          isActive: emp.isActive,
          role: emp.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees((prev) =>
          prev.map((e) => (e._id === emp._id ? data.user : e)),
        );
      }
    } catch {
      // ignore
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}? This cannot be undone.`)) return;
    setDeletingId(emp._id);
    try {
      const res = await fetch(`/api/users/${emp._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setEmployees((prev) => prev.filter((e) => e._id !== emp._id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-16 pl-0 md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Employees</h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage your firm&apos;s team members – update roles or remove access.
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Team Members</h2>
                <p className="text-xs text-slate-500">
                  Total {employees.length} active {employees.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 text-sm font-medium">
                  No employees or managers found. Use &quot;Add Employee&quot; from the dashboard to
                  create one.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Manager Access
                      </th>
                      <th className="text-right py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr
                        key={emp._id}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-5 text-sm font-semibold text-slate-800">
                          {emp.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{emp.email}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {emp.designation || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={emp.role}
                            onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                            className="text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700"
                          >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              emp.isActive
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                emp.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {emp.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {emp.role === 'manager' ? (
                            <button
                              type="button"
                              onClick={() => openAccessModal(emp)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Edit Access
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSave(emp)}
                              disabled={savingId === emp._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {savingId === emp._id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => handleDelete(emp)}
                              disabled={deletingId === emp._id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === emp._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {accessManager && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(15,12,41,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl shadow-2xl sm:max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
            <div
              className="px-6 py-5 flex items-center justify-between flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)' }}
            >
              <div>
                <h2 className="text-xl font-black text-white">Manager Access</h2>
                <p className="text-white/70 text-sm truncate max-w-[260px]">
                  {accessManager.name} ({accessManager.email})
                </p>
              </div>
              <button
                onClick={() => setAccessManager(null)}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-slate-500 mb-2">
                Choose which parts of the manager experience this user can see and use.
              </p>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Task Sheet</p>
                    <p className="text-xs text-slate-500">
                      Show the admin task sheet menu for this manager.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 rounded border-slate-300"
                    checked={accessForm.accessTaskSheet}
                    onChange={(e) =>
                      setAccessForm((prev) => ({ ...prev, accessTaskSheet: e.target.checked }))
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Memo Details</p>
                    <p className="text-xs text-slate-500">
                      Allow this manager to open the memo details page.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 rounded border-slate-300"
                    checked={accessForm.accessMemoDetails}
                    onChange={(e) =>
                      setAccessForm((prev) => ({ ...prev, accessMemoDetails: e.target.checked }))
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Companies List</p>
                    <p className="text-xs text-slate-500">
                      Allow this manager to see the companies list.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 rounded border-slate-300"
                    checked={accessForm.accessCompanies}
                    onChange={(e) =>
                      setAccessForm((prev) => ({ ...prev, accessCompanies: e.target.checked }))
                    }
                  />
                </label>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Actions inside dashboard
                </p>
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Create Tasks</p>
                    <p className="text-xs text-slate-500">
                      Allow this manager to create and assign tasks.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 rounded border-slate-300"
                    checked={accessForm.canCreateTasks}
                    onChange={(e) =>
                      setAccessForm((prev) => ({ ...prev, canCreateTasks: e.target.checked }))
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Approve Tasks</p>
                    <p className="text-xs text-slate-500">
                      Show the &quot;Manager Approvals&quot; section for this manager.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 rounded border-slate-300"
                    checked={accessForm.canApproveTasks}
                    onChange={(e) =>
                      setAccessForm((prev) => ({ ...prev, canApproveTasks: e.target.checked }))
                    }
                  />
                </label>
                <label className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Raise Memos</p>
                    <p className="text-xs text-slate-500">
                      Allow this manager to raise memos from tasks.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-violet-600 rounded border-slate-300"
                    checked={accessForm.canRaiseMemos}
                    onChange={(e) =>
                      setAccessForm((prev) => ({ ...prev, canRaiseMemos: e.target.checked }))
                    }
                  />
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setAccessManager(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAccess}
                disabled={accessSaving}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {accessSaving ? 'Saving…' : 'Save Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

