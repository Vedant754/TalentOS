// src/pages/dashboards/EmployeeDashboard.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    // Same endpoint, same code, as HR and Team Lead used above —
    // Phase 5 scoping returns ONLY this employee's own leave records
    api.get('/leaves').then(({ data }) => setMyLeaves(data.data));
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/leaves', leaveForm); // employee field set server-side, not from form
    setMyLeaves((prev) => [data.data, ...prev]);
    setLeaveForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.employee.firstName}</h1>
          <p className="role-badge">{user.employee.designation}</p>
        </div>
        <button className="button button-secondary" onClick={logout}>Log out</button>
      </div>

      <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Apply for Leave</h2>
                <p className="meta">Submit a request and track approval status.</p>
              </div>
            </div>
            <form onSubmit={handleApply} className="form-grid">
              <div className="field">
                <span>Leave type</span>
                <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}>
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="earned">Earned</option>
                </select>
              </div>

              <div className="field">
                <span>Start date</span>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <span>End date</span>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <span>Reason</span>
                <input
                  placeholder="Reason for your leave"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  required
                />
              </div>

              <button className="button button-primary" type="submit">Submit Request</button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>My Leave History</h2>
                <p className="meta">Review your requested leaves and the current status.</p>
              </div>
            </div>
            <div className="panel-content">
              {myLeaves.length === 0 && <p className="muted">No leave history available yet.</p>}
              {myLeaves.map((leave) => (
                <div className="leave-card" key={leave._id}>
                  <div>{leave.type} — {new Date(leave.startDate).toLocaleDateString()}</div>
                  <span className={`status-pill status-${leave.status}`}>{leave.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
  );
};

export default EmployeeDashboard;