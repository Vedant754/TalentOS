// src/pages/dashboards/HRDashboard.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    // HR sees ALL employees (Phase 5's data scoping gives them no base filter)
    api.get('/employees').then(({ data }) => setEmployees(data.data));
    api.get('/leaves?status=pending').then(({ data }) => setPendingLeaves(data.data));
  }, []);

  const handleApprove = async (leaveId) => {
    await api.put(`/leaves/${leaveId}/approve`);
    setPendingLeaves((prev) => prev.filter((l) => l._id !== leaveId));
  };

  const handleDeactivate = async (employeeId) => {
    if (!confirm('Deactivate this employee?')) return;
    await api.delete(`/employees/${employeeId}`); // Phase 3's soft delete
    setEmployees((prev) => prev.filter((e) => e._id !== employeeId));
  };

  return (
    <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>HR Workspace</h1>
            <p className="role-badge">HR Manager</p>
          </div>
          <button className="button button-secondary" onClick={logout}>Log out</button>
        </div>

        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Pending Leave Approvals</h2>
                <p className="meta">Review and approve pending requests from employees.</p>
              </div>
            </div>
            <div className="panel-content">
              {pendingLeaves.length === 0 && <p className="muted">No pending approvals right now.</p>}
              {pendingLeaves.map((leave) => (
                <div className="leave-card" key={leave._id}>
                  <div>{leave.employee.firstName} {leave.employee.lastName} — {leave.type}</div>
                  <div className="meta">{new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}</div>
                  <button className="button button-primary" onClick={() => handleApprove(leave._id)}>Approve</button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>All Employees ({employees.length})</h2>
                <p className="meta">Manage active employees in the organization.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td>{emp.designation}</td>
                      <td>₹{emp.salary?.toLocaleString()}</td>
                      <td>
                        <button className="button button-secondary" onClick={() => handleDeactivate(emp._id)}>
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
  );
};

export default HRDashboard;