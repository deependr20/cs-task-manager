'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar({ user, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof onLogout === 'function') onLogout();
    router.push('/');
  };

  const dashboardPath =
    user?.role === 'superadmin' ? '/superadmin/dashboard'
    : user?.role === 'admin'   ? '/admin/dashboard'
    : user?.role === 'manager' ? '/manager/dashboard'
    : '/employee/dashboard';

  // ── Nav item definitions ──────────────────────────────────────────────────
  const superadminNavItems = [
    {
      label: 'Dashboard',
      path: '/superadmin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Firms',
      path: '/superadmin/firms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'Admins',
      path: '/superadmin/admins',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const adminNavItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Task Sheet',
      path: '/admin/task-details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: 'Memo Details',
      path: '/admin/memo-details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Companies',
      path: '/admin/companies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'Activity Logs',
      path: '/admin/activity-logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Company Profile',
      path: '/admin/firm',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  const perms = user?.role === 'manager' ? (user.managerPermissions || {}) : {};

  const managerNavItems = [
    {
      label: 'Dashboard',
      path: '/manager/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    ...(perms.accessTaskSheet === false ? [] : [{
      label: 'Task Sheet',
      path: '/admin/task-details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    }]),
    ...(perms.accessMemoDetails === false ? [] : [{
      label: 'Memo Details',
      path: '/admin/memo-details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    }]),
    ...(perms.accessCompanies === false ? [] : [{
      label: 'Companies',
      path: '/admin/companies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    }]),
  ];

  const employeeNavItems = [
    {
      label: 'My Tasks',
      path: '/employee/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  const navItems =
    user?.role === 'superadmin' ? superadminNavItems
    : user?.role === 'admin'   ? adminNavItems
    : user?.role === 'manager' ? managerNavItems
    : employeeNavItems;

  const roleColors = {
    superadmin: 'from-amber-500 to-orange-500',
    admin:      'from-violet-600 to-indigo-600',
    manager:    'from-blue-600 to-cyan-600',
    employee:   'from-emerald-600 to-teal-600',
  };
  const roleGradient = roleColors[user?.role] || roleColors.employee;

  // ── Does this firm have a logo? ───────────────────────────────────────────
  const firmLogo = user?.firm?.logo;
  const showLogoOnly = !!user?.firm?.showLogoOnly;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Logo / Firm branding ── */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${sidebarCollapsed ? 'justify-center px-3' : ''}`}>

          {/* Logo slot ─ KEY FIX:
              When a logo exists → white card (bg-white + padding) so any logo
              colour (dark, light, colourful) is always visible on the dark sidebar.
              When no logo → role-coloured gradient with a default icon. */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-all
              ${firmLogo ? 'bg-white p-1.5' : `bg-gradient-to-br ${roleGradient}`}
            `}
            style={firmLogo ? { boxShadow: '0 4px 14px rgba(0,0,0,0.4)' } : { boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            {firmLogo ? (
              <img
                src={firmLogo}
                alt={user?.firm?.name || 'Logo'}
                className="w-full h-full object-contain"
              />
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>

          {/* Firm name — hidden when collapsed or 'logo only' */}
          {!sidebarCollapsed && !showLogoOnly && (
            <div className="overflow-hidden min-w-0">
              <h1 className="text-white font-bold text-base leading-tight truncate">
                {user?.firm?.name || 'CS Management'}
              </h1>
              <p className="text-white/40 text-xs whitespace-nowrap">Secretary Services</p>
            </div>
          )}
        </div>

        {/* ── Nav Items ── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { router.push(item.path); setMobileMenuOpen(false); }}
                title={sidebarCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${sidebarCollapsed ? 'justify-center' : ''}
                  ${isActive
                    ? `bg-gradient-to-r ${roleGradient} text-white shadow-lg`
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── User Profile at bottom ── */}
        <div className="p-3 border-t border-white/10">
          <div
            className={`relative flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-all
              ${sidebarCollapsed ? 'justify-center' : ''}`}
            onClick={() => setShowMenu(!showMenu)}
            tabIndex={0}
            onBlur={() => setTimeout(() => setShowMenu(false), 150)}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg overflow-hidden ${
                firmLogo ? 'bg-white p-1' : `bg-gradient-to-br ${roleGradient}`
              }`}
            >
              {firmLogo ? (
                <img
                  src={firmLogo}
                  alt={user?.firm?.name || 'Logo'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {!sidebarCollapsed && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-white/50 text-xs capitalize">{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                </svg>
              </>
            )}

            {/* Dropdown menu */}
            {showMenu && (
              <div className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-slate-100 w-56 overflow-hidden z-50
                ${sidebarCollapsed ? 'left-full ml-2 bottom-0' : 'left-0'}`}>
                <div className={`px-4 py-3 bg-gradient-to-r ${roleGradient}`}>
                  <p className="text-white font-bold text-sm">{user?.name}</p>
                  <p className="text-white/80 text-xs truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { setShowMenu(false); setMobileMenuOpen(false); router.push('/profile'); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setMobileMenuOpen(false); router.push('/preferences'); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferences
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => { setShowMenu(false); setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex mt-2 w-full items-center justify-center py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 right-0 z-30 h-16 flex items-center px-4 sm:px-6 transition-all duration-300
          left-0
          ${sidebarCollapsed ? 'md:left-20' : 'md:left-64'}
        `}
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 1px 20px rgba(0,0,0,0.06)',
        }}
      >
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors mr-2"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-1 min-w-0 truncate">
          <span className="font-semibold text-slate-800">
            {user?.role === 'superadmin' ? 'Super Admin'
              : user?.role === 'admin'   ? 'Admin'
              : user?.role === 'manager' ? 'Manager'
              : 'Employee'}
          </span>
          <svg className="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-400 truncate">
            {navItems.find(n => n.path === pathname)?.label || 'Dashboard'}
          </span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notification bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Avatar (prefer firm logo over initial) */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow overflow-hidden ${
              firmLogo ? 'bg-white p-1' : `bg-gradient-to-br ${roleGradient}`
            }`}
          >
            {firmLogo ? (
              <img
                src={firmLogo}
                alt={user?.firm?.name || 'Logo'}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </header>
    </>
  );
}