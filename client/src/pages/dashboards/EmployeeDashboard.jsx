import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { CalendarIcon, ClockIcon, SendIcon, UserIcon } from '../../components/icons';
import {
  DashboardHero,
  EmptyState,
  InlineAlert,
  LoadingRows,
  MetricCard,
  Panel,
  StatusPill,
} from '../../components/dashboard/DashboardPrimitives';
import { formatDate, formatRole, getEmployeeName } from '../../components/dashboard/dashboardUtils';

const initialLeaveForm = {
  type: 'casual',
  startDate: '',
  endDate: '',
  reason: '',
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState(initialLeaveForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        const { data } = await api.get('/leaves');
        setMyLeaves(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your leave history.');
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, []);

  const leaveCounts = useMemo(() => ({
    pending: myLeaves.filter((leave) => leave.status === 'pending').length,
    approved: myLeaves.filter((leave) => leave.status === 'approved').length,
    total: myLeaves.length,
  }), [myLeaves]);

  const updateLeaveForm = (field, value) => {
    setLeaveForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleApply = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (leaveForm.endDate < leaveForm.startDate) {
      setError('End date must be after the start date.');
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post('/leaves', leaveForm);
      setMyLeaves((currentLeaves) => [data.data, ...currentLeaves]);
      setLeaveForm(initialLeaveForm);
      setSuccess('Leave request submitted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard">
      <DashboardHero
        eyebrow="Employee self-service"
        title={`Welcome, ${getEmployeeName(user.employee)}`}
        description="Submit leave requests and track every approval decision from your workspace."
      />

      {error && <InlineAlert>{error}</InlineAlert>}
      {success && <InlineAlert type="success">{success}</InlineAlert>}

      <section className="metrics-grid">
        <MetricCard icon={UserIcon} label="Role" value={formatRole(user.role)} detail={user.employee?.designation || 'Employee'} />
        <MetricCard icon={ClockIcon} label="Pending" value={leaveCounts.pending} detail="Leave requests" tone="amber" />
        <MetricCard icon={CalendarIcon} label="Approved" value={leaveCounts.approved} detail={`${leaveCounts.total} total requests`} tone="green" />
      </section>

      <div className="dashboard-grid">
        <Panel title="Apply For Leave" description="Submit a request for your manager or HR to review.">
          <form onSubmit={handleApply} className="form-grid">
            <label className="field">
              <span>Leave type</span>
              <select value={leaveForm.type} onChange={(event) => updateLeaveForm('type', event.target.value)}>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
                <option value="maternity">Maternity</option>
                <option value="paternity">Paternity</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>

            <div className="form-columns">
              <label className="field">
                <span>Start date</span>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(event) => updateLeaveForm('startDate', event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>End date</span>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(event) => updateLeaveForm('endDate', event.target.value)}
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>Reason</span>
              <textarea
                placeholder="Reason for your leave"
                value={leaveForm.reason}
                onChange={(event) => updateLeaveForm('reason', event.target.value)}
                rows="4"
                maxLength="500"
                required
              />
            </label>

            <button className="button button-primary" type="submit" disabled={submitting}>
              <SendIcon />
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </Panel>

        <Panel title="Leave History" description="Your recent requests and current approval status.">
          {loading ? (
            <LoadingRows rows={5} />
          ) : myLeaves.length === 0 ? (
            <EmptyState title="No leave history" description="Submitted requests will appear here." />
          ) : (
            <div className="timeline-list">
              {myLeaves.map((leave) => (
                <article className="timeline-item" key={leave._id}>
                  <div>
                    <strong>{formatRole(leave.type)} leave</strong>
                    <span>{formatDate(leave.startDate)} to {formatDate(leave.endDate)}</span>
                    {leave.reason && <p>{leave.reason}</p>}
                  </div>
                  <StatusPill status={leave.status} />
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
