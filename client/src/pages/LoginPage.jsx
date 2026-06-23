import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, BriefcaseIcon, LockIcon, MailIcon, ShieldIcon } from '../components/icons';
import { useAuth } from '../context/authState';
import { getDashboardPath } from '../routes/dashboardPaths';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      navigate(getDashboardPath(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="brand-mark">T</div>
          <div>
            <p className="eyebrow">TalentOS</p>
            <h1>Sign in to your workspace</h1>
            <p>Secure access for leaders, HR teams, managers, and employees.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="inline-alert inline-alert-error">{error}</div>}

          <label className="field">
            <span>Email</span>
            <div className="field-group">
              <MailIcon className="field-icon" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="field-group">
              <LockIcon className="field-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
            <ArrowRightIcon />
          </button>
        </form>
      </section>

      <aside className="auth-aside" aria-label="Platform highlights">
        <div className="auth-aside-row">
          <ShieldIcon />
          <div>
            <strong>Role-secured access</strong>
            <span>Dashboards reflect the same RBAC boundaries enforced by the API.</span>
          </div>
        </div>
        <div className="auth-aside-row">
          <BriefcaseIcon />
          <div>
            <strong>Workforce operations</strong>
            <span>Headcount, leave approvals, and employee records stay in one flow.</span>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default LoginPage;
