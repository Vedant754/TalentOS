// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../routes/RoleRoute';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="auth-page">
      <div className="auth-panel">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <div className="eyebrow">TalentOS</div>
            <p className="brand-copy">Secure workforce management with fast access to your dashboard.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <h1>Welcome back</h1>
            <p className="muted">Sign in to continue managing your team and tasks.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <span>Email</span>
            <div className="field-group">
              <FiMail className="field-icon" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <span>Password</span>
            <div className="field-group">
              <FiLock className="field-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
            <FiArrowRight className="button-icon" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;