// src/pages/dashboards/TeamLeadDashboard.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const TeamLeadDashboard = () => {
  const { user, logout } = useAuth();
  const [team, setTeam] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    // Same /employees endpoint as HR — but Phase 5's scoping returns
    // ONLY this team lead's direct reports, and salary is stripped server-side
    api.get('/employees').then(({ data }) => setTeam(data.data));
    api.get('/leaves?status=pending').then(({ data }) => setPendingLeaves(data.data));
  }, []);

  const handleApprove = async (leaveId) => {
    await api.put(`/leaves/${leaveId}/approve`); // backend re-checks they're a direct report
    setPendingLeaves((prev) => prev.filter((l) => l._id !== leaveId));
  };

  return (
    <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Team Lead Workspace</h1>
            <p className="role-badge">Team Lead</p>
          </div>
          <button className="button button-secondary" onClick={logout}>Log out</button>
        </div>

        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>My Team ({team.length})</h2>
                <p className="meta">View your direct reports and contact details.</p>
              </div>
            </div>
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
                  {team.map((member) => (
                    <tr key={member._id}>
                      <td>{member.firstName} {member.lastName}</td>
                      <td>{member.designation}</td>
                      <td>{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Pending Approvals</h2>
                <p className="meta">Approve leave requests from your team members.</p>
              </div>
            </div>
            <div className="panel-content">
              {pendingLeaves.length === 0 && <p className="muted">No pending approvals at the moment.</p>}
              {pendingLeaves.map((leave) => (
                <div className="leave-card" key={leave._id}>
                  <div>{leave.employee.firstName} — {leave.type} ({leave.numberOfDays} days)</div>
                  <button className="button button-primary" onClick={() => handleApprove(leave._id)}>Approve</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
  );
};

export default TeamLeadDashboard;