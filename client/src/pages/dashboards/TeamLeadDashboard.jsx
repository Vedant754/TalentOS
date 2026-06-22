import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { CheckIcon, MailIcon, UserPlusIcon, UsersIcon } from '../../components/icons';
import {
  DashboardHero,
  EmptyState,
  InlineAlert,
  LoadingRows,
  MetricCard,
  Panel,
} from '../../components/dashboard/DashboardPrimitives';
import { formatDate, formatRole, getEmployeeName } from '../../components/dashboard/dashboardUtils';

const TeamLeadDashboard = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTeamWorkspace = async () => {
      try {
        const [teamResponse, leavesResponse] = await Promise.all([
          api.get('/employees?limit=50'),
          api.get('/leaves?status=pending'),
        ]);

        setTeam(teamResponse.data.data || []);
        setPendingLeaves(leavesResponse.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load team workspace.');
      } finally {
        setLoading(false);
      }
    };

    loadTeamWorkspace();
  }, []);

  const directReports = useMemo(() => {
    const currentUserId = user.employee?._id || user.employee?.id;
    return team.filter((member) => (member._id || member.id) !== currentUserId);
  }, [team, user.employee]);

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

  return (
    <div className="dashboard">
      <DashboardHero
        eyebrow="Team operations"
        title={`Welcome, ${getEmployeeName(user.employee)}`}
        description="Keep direct reports visible and clear pending leave approvals quickly."
      />

      {error && <InlineAlert>{error}</InlineAlert>}

      <section className="metrics-grid">
        <MetricCard icon={UsersIcon} label="Team members" value={directReports.length} detail="Direct reports" />
        <MetricCard icon={UserPlusIcon} label="Pending approvals" value={pendingLeaves.length} detail="Team leave requests" tone="amber" />
        <MetricCard icon={MailIcon} label="Directory" value={team.length} detail="Scoped by your role" tone="green" />
      </section>

      <div className="dashboard-grid">
        <Panel title="My Team" description="Direct reports and contact details.">
          {loading ? (
            <LoadingRows rows={5} />
          ) : directReports.length === 0 ? (
            <EmptyState title="No direct reports" description="Team members assigned to you will appear here." />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {directReports.map((member) => (
                    <tr key={member._id}>
                      <td>
                        <strong>{getEmployeeName(member)}</strong>
                        <span>{member.department?.name || 'Unassigned'}</span>
                      </td>
                      <td>{member.designation}</td>
                      <td>{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Pending Approvals" description="Leave requests submitted by your team.">
          {loading ? (
            <LoadingRows rows={4} />
          ) : pendingLeaves.length === 0 ? (
            <EmptyState title="Nothing to approve" description="New requests from direct reports will show up here." />
          ) : (
            <div className="request-list">
              {pendingLeaves.map((leave) => (
                <article className="request-card" key={leave._id}>
                  <div>
                    <strong>{getEmployeeName(leave.employee)}</strong>
                    <span>{formatRole(leave.type)} / {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</span>
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
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
