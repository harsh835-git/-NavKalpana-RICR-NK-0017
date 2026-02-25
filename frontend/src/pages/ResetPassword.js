import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (form.password !== form.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      {ToastComponent}
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#000' }}>F</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26 }} className="gradient-text">FitAI</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {done ? 'Password reset!' : 'Set new password'}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>
            {done ? 'Redirecting you to login...' : 'Choose a strong password for your account.'}
          </p>
        </div>

        <div className="card" style={{ borderRadius: 20 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 24 }}>
                Your password has been updated successfully. You will be redirected to the login page shortly.
              </p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
                Go to Login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">New password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Confirm new password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Repeat your new password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                {loading ? <><div className="spinner" /> Resetting...</> : 'Reset Password →'}
              </button>
            </form>
          )}
        </div>

        {!done && (
          <p style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 20, fontSize: 14 }}>
            Remember your password? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
