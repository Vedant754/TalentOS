// src/pages/dashboards/CEODashboard.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const CEODashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calls Phase 3's aggregation endpoint — only ceo/hr_manager pass the
    // authorize() guard from Phase 5 on this route
    api.get('/employees/stats').then(({ data }) => {
      setStats(data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loader">Loading company stats…</div>;

  return (
    <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user.employee.firstName} 👋</h1>
            <p className="role-badge">CEO</p>
          </div>
          <button className="button button-secondary" onClick={logout}>Log out</button>
        </div>

        <section className="stats-grid">
          {stats.byRole.map((r) => (
            <div className="stat-card" key={r.role}>
              <h3>{r.role.replace('_', ' ').toUpperCase()}</h3>
              <p className="stat-number">{r.count}</p>
              <p className="stat-sub">Avg salary: ₹{r.avgSalary?.toLocaleString()}</p>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Headcount by Department</h2>
              <p className="meta">Growth and staffing distribution for your organization.</p>
            </div>
          </div>
          <div className="panel-content">
            {stats.byDepartment.map((d) => (
              <div className="dept-row" key={d.departmentName}>
                <span>{d.departmentName}</span>
                <span>{d.count} employees</span>
              </div>
            ))}
          </div>
        </section>

    </div>
  );
};

export default CEODashboard;