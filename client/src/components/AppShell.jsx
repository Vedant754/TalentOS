import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const AppShell = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const pageTitle = useMemo(() => {
    const slug = location.pathname.split('/').pop();
    switch (slug) {
      case 'ceo':
        return 'CEO Dashboard';
      case 'hr':
        return 'HR Dashboard';
      case 'team-lead':
        return 'Team Lead Dashboard';
      case 'employee':
        return 'Employee Dashboard';
      default:
        return 'Dashboard';
    }
  }, [location.pathname]);

  return (
    <>
      <header className="app-shell-header">
        <div className="app-brand">
          <div className="brand-mark">T</div>
          <div>
            <p className="eyebrow">TalentOS</p>
            <p className="meta">{pageTitle} · {user.role.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="app-actions">
          <button type="button" className="button button-secondary theme-toggle" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? <FiSun className="button-icon" /> : <FiMoon className="button-icon" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button type="button" className="button button-secondary" onClick={logout}>
            <FiLogOut className="button-icon" /> Log out
          </button>
        </div>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
    </>
  );
};

export default AppShell;
