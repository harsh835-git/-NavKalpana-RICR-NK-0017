import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data.token, res.data.user);
      showToast('Welcome back!');
      setTimeout(() => navigate(res.data.user.profileComplete ? '/dashboard' : '/profile-setup'), 800);
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
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
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Sign in to continue your journey</p>
        </div>

        <div className="card" style={{ borderRadius: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Email</label>
              <input className="input-field" type="email" placeholder="alex@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <input className="input-field" type="password" placeholder="Your password" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 20, fontSize: 14 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
