'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />

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
    </div>
  );
}

