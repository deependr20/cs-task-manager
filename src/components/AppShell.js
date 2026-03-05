'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function AppShell({ children }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setChecked(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // While we haven't checked auth yet, show a blank shell (no layout shift / animation)
  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-50" />
    );
  }

  // When not logged in, render children without sidebar/top bar (login, public pages, etc.)
  if (!user) {
    return children;
  }

  return (
    <>
      <Navbar user={user} onLogout={() => setUser(null)} />
      {children}
    </>
  );
}

