import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { BriefcaseIcon, PieChartIcon, UsersIcon } from '../../components/icons';
import {
  DashboardHero,
  EmptyState,
  InlineAlert,
  LoadingRows,
  MetricCard,
  Panel,
} from '../../components/dashboard/DashboardPrimitives';
import { formatCurrency, formatRole, getEmployeeName } from '../../components/dashboard/dashboardUtils';

const CEODashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ byRole: [], byDepartment: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/employees/stats');
        setStats(data.data || { byRole: [], byDepartment: [] });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load company stats.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const summary = useMemo(() => {
    const totalHeadcount = stats.byRole.reduce((total, roleStat) => total + roleStat.count, 0);
    const weightedSalary = stats.byRole.reduce(
      (total, roleStat) => total + (roleStat.avgSalary || 0) * roleStat.count,
      0
    );
    const averageSalary = totalHeadcount ? weightedSalary / totalHeadcount : 0;
    const largestDepartment = [...stats.byDepartment].sort((first, second) => second.count - first.count)[0];

    return {
      totalHeadcount,
      averageSalary,
      departments: stats.byDepartment.length,
      largestDepartment,
    };
  }, [stats]);

  const maxDepartmentCount = Math.max(...stats.byDepartment.map((department) => department.count), 1);

  return (
    <div className="dashboard">
      <DashboardHero
        eyebrow="Executive overview"
        title={`Welcome, ${getEmployeeName(user.employee)}`}
        description="Track organizational shape, team distribution, and compensation signals from one board."
      />

      {error && <InlineAlert>{error}</InlineAlert>}

      <section className="metrics-grid">
        <MetricCard icon={UsersIcon} label="Active headcount" value={summary.totalHeadcount} detail="Across all roles" />
        <MetricCard
          icon={BriefcaseIcon}
          label="Avg. salary"
          value={formatCurrency(summary.averageSalary)}
          detail="Weighted by role"
          tone="green"
        />
        <MetricCard
          icon={PieChartIcon}
          label="Departments"
          value={summary.departments}
          detail={summary.largestDepartment ? `Largest: ${summary.largestDepartment.departmentName}` : 'No departments yet'}
          tone="amber"
        />
      </section>

      <div className="dashboard-grid">
        <Panel title="Role Mix" description="Headcount and salary distribution by access role.">
          {loading ? (
            <LoadingRows rows={4} />
          ) : stats.byRole.length === 0 ? (
            <EmptyState title="No role data" description="Employee stats will appear after records are available." />
          ) : (
            <div className="role-list">
              {stats.byRole.map((roleStat) => (
                <article className="role-row" key={roleStat.role}>
                  <div>
                    <strong>{formatRole(roleStat.role)}</strong>
                    <span>{roleStat.count} people</span>
                  </div>
                  <div className="role-salary">
                    <strong>{formatCurrency(roleStat.avgSalary)}</strong>
                    <span>{formatCurrency(roleStat.minSalary)} - {formatCurrency(roleStat.maxSalary)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Department Load" description="A quick scan of team size by department.">
          {loading ? (
            <LoadingRows rows={4} />
          ) : stats.byDepartment.length === 0 ? (
            <EmptyState title="No department data" description="Department breakdown will appear after employees are assigned." />
          ) : (
            <div className="bar-list">
              {stats.byDepartment.map((department) => (
                <div className="bar-row" key={department.departmentName}>
                  <div>
                    <strong>{department.departmentName}</strong>
                    <span>{department.count} employees</span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${(department.count / maxDepartmentCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default CEODashboard;
