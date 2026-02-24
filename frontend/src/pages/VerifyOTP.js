import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Mail } from '../components/Icons';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const { userId, email } = location.state || {};

  if (!userId) { navigate('/register'); return null; }

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) return showToast('Enter all 6 digits', 'error');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', { userId, otp: otpString });
      login(res.data.token, res.data.user);
      showToast('Email verified! Welcome to FitAI!');
      setTimeout(() => navigate('/profile-setup'), 1000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post('/api/auth/resend-otp', { userId });
      showToast('New OTP sent!');
    } catch (err) {
      showToast('Failed to resend', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      {ToastComponent}
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#000' }}>F</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26 }} className="gradient-text">FitAI</span>
        </div>

        <div className="card" style={{ borderRadius: 20, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--accent)' }}><Mail size={40} /></div>
          <h2 style={{ marginBottom: 8 }}>Check your email</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: 14 }}>
            We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </p>

          <div className="otp-inputs" style={{ marginBottom: 28 }}>
            {otp.map((digit, i) => (
              <input key={i}
                ref={el => inputs.current[i] = el}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                maxLength={1}
                style={{
                  width: 52, height: 60, textAlign: 'center',
                  background: 'var(--bg3)',
                  border: `2px solid ${digit ? 'var(--accent)' : 'var(--border2)'}`,
                  borderRadius: 12, color: 'var(--text)',
                  fontSize: 24, fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  transition: 'var(--transition)',
                  outline: 'none'
                }}
              />
            ))}
          </div>

          <button onClick={handleVerify} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }} disabled={loading}>
            {loading ? <><div className="spinner" /> Verifying...</> : 'Verify Email →'}
          </button>

          <button onClick={handleResend} disabled={resending} style={{ background: 'none', color: 'var(--text2)', fontSize: 14, cursor: 'pointer', border: 'none' }}>
            {resending ? 'Sending...' : "Didn't receive it? Resend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
