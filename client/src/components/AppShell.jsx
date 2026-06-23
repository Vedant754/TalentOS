import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authState';
import { getDashboardPath } from '../routes/dashboardPaths';
import { CalendarIcon, GridIcon, LogOutIcon, MoonIcon, SunIcon, UserIcon } from './icons';
import { formatRole, getEmployeeName } from './dashboard/dashboardUtils';

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

  const dashboardPath = getDashboardPath(user.role);
  const employeeName = getEmployeeName(user.employee);
  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date());

  return (
    <div className="app-frame">
      <header className="app-shell-header">
        <div className="app-brand">
          <div className="brand-mark">T</div>
          <div>
            <p className="eyebrow">TalentOS</p>
            <p className="meta">{pageTitle} / {formatRole(user.role)}</p>
          </div>
        </div>

        <div className="app-actions">
          <div className="shell-date">
            <CalendarIcon />
            <span>{today}</span>
          </div>
          <button
            type="button"
            className="icon-button"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button type="button" className="icon-button" title="Log out" onClick={logout}>
            <LogOutIcon />
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="side-nav">
          <NavLink to={dashboardPath} className="side-link">
            <GridIcon />
            <span>Workspace</span>
          </NavLink>
          <div className="profile-chip">
            <div className="profile-avatar">
              <UserIcon />
            </div>
            <div>
              <strong>{employeeName}</strong>
              <span>{user.employee?.designation || formatRole(user.role)}</span>
            </div>
          </div>
        </aside>

        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
