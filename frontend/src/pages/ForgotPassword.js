import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Forgot password?</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>
            {sent ? 'Check your inbox for the reset link.' : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        <div className="card" style={{ borderRadius: 20 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 24 }}>
                We sent a password reset link to <strong style={{ color: 'var(--text)' }}>{email}</strong>. The link expires in 1 hour.
              </p>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}
                >
                  try again
                </button>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="label">Email address</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                {loading ? <><div className="spinner" /> Sending...</> : 'Send Reset Link →'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 20, fontSize: 14 }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
