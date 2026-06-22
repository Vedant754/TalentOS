import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import { CheckIcon, SearchIcon, TrashIcon, UserCheckIcon, UsersIcon } from '../../components/icons';
import {
  DashboardHero,
  EmptyState,
  InlineAlert,
  LoadingRows,
  MetricCard,
  Panel,
} from '../../components/dashboard/DashboardPrimitives';
import { formatCurrency, formatDate, formatRole, getEmployeeName } from '../../components/dashboard/dashboardUtils';

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const [employeesResponse, leavesResponse] = await Promise.all([
          api.get('/employees?limit=50'),
          api.get('/leaves?status=pending'),
        ]);

        setEmployees(employeesResponse.data.data || []);
        setPendingLeaves(leavesResponse.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load HR workspace.');
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, []);

  const filteredEmployees = useMemo(() => {
    const normalisedSearch = search.trim().toLowerCase();
    if (!normalisedSearch) return employees;

    return employees.filter((employee) => {
      const searchableText = [
        getEmployeeName(employee),
        employee.email,
        employee.designation,
        employee.department?.name,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(normalisedSearch);
    });
  }, [employees, search]);

  const averageSalary = useMemo(() => {
    if (!employees.length) return 0;
    const totalSalary = employees.reduce((total, employee) => total + (employee.salary || 0), 0);
    return totalSalary / employees.length;
  }, [employees]);

  const handleApprove = async (leaveId) => {
    setActionId(leaveId);
    setError('');

    try {
      await api.put(`/leaves/${leaveId}/approve`);
      setPendingLeaves((currentLeaves) => currentLeaves.filter((leave) => leave._id !== leaveId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve leave request.');
    } finally {
      setActionId('');
    }
  };

  const handleDeactivate = async (employeeId) => {
    if (!confirm('Deactivate this employee account?')) return;

    setActionId(employeeId);
    setError('');

    try {
      await api.delete(`/employees/${employeeId}`);
      setEmployees((currentEmployees) => currentEmployees.filter((employee) => employee._id !== employeeId));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to deactivate employee.');
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="dashboard">
      <DashboardHero
        eyebrow="People operations"
        title="HR Workspace"
        description="Review pending leaves, monitor active employee records, and keep workforce data tidy."
      />

      {error && <InlineAlert>{error}</InlineAlert>}

      <section className="metrics-grid">
        <MetricCard icon={UsersIcon} label="Employees" value={employees.length} detail="Active records loaded" />
        <MetricCard icon={UserCheckIcon} label="Pending leave" value={pendingLeaves.length} detail="Awaiting HR action" tone="amber" />
        <MetricCard icon={CheckIcon} label="Avg. salary" value={formatCurrency(averageSalary)} detail="Visible to HR" tone="green" />
      </section>

      <div className="dashboard-grid dashboard-grid-wide">
        <Panel title="Pending Leave Approvals" description="Requests waiting for HR review.">
          {loading ? (
            <LoadingRows rows={3} />
          ) : pendingLeaves.length === 0 ? (
            <EmptyState title="No pending approvals" description="New requests will appear here when employees apply." />
          ) : (
            <div className="request-list">
              {pendingLeaves.map((leave) => (
                <article className="request-card" key={leave._id}>
                  <div>
                    <strong>{getEmployeeName(leave.employee)}</strong>
                    <span>{formatRole(leave.type)} leave / {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</span>
                  </div>
                  <button
                    className="button button-primary button-compact"
                    type="button"
                    disabled={actionId === leave._id}
                    onClick={() => handleApprove(leave._id)}
                  >
                    <CheckIcon />
                    {actionId === leave._id ? 'Approving...' : 'Approve'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={`Employees (${filteredEmployees.length})`}
          description="Search and manage active employee records."
          className="panel-wide"
          action={(
            <label className="search-field">
              <SearchIcon />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search people"
              />
            </label>
          )}
        >
          {loading ? (
            <LoadingRows rows={5} />
          ) : filteredEmployees.length === 0 ? (
            <EmptyState title="No employees found" description="Try another name, department, or designation." />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <strong>{getEmployeeName(employee)}</strong>
                        <span>{employee.email}</span>
                      </td>
                      <td>{employee.department?.name || 'Unassigned'}</td>
                      <td>{employee.designation}</td>
                      <td>{formatCurrency(employee.salary)}</td>
                      <td>
                        <button
                          className="icon-button danger-button"
                          type="button"
                          title="Deactivate employee"
                          disabled={actionId === employee._id}
                          onClick={() => handleDeactivate(employee._id)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default HRDashboard;
