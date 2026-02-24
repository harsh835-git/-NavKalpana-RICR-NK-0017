import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Leaf, TrendingUp, CircleDot, Gauge, Ruler, Target, Bot } from '../components/Icons';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-mark">F</div>
          <span className="gradient-text">FitAI</span>
        </div>
        <div className="nav-actions">
          {user ? (
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Dashboard →</button>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn-primary" onClick={() => navigate('/register')}>Start Free →</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="badge-dot" />
            Adaptive Intelligence Engine
          </div>
          <h1 className="hero-title reveal">
            Your fitness,<br />
            <span className="gradient-text">reimagined</span>
          </h1>
          <p className="hero-sub reveal">
            FitAI learns from your behavior, adapts your plans,<br />
            and coaches you to peak performance.
          </p>
          <div className="hero-cta reveal">
            <button className="btn-primary" style={{ fontSize: 17, padding: '16px 36px' }} onClick={() => navigate('/register')}>
              Begin Your Journey →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Already have an account
            </button>
          </div>
          <div className="hero-stats reveal">
            <div className="stat">
              <span className="stat-num gradient-text">12+</span>
              <span className="stat-label">Adaptive Features</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num gradient-text">100%</span>
              <span className="stat-label">Personalized</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num gradient-text">AI</span>
              <span className="stat-label">Powered Coach</span>
            </div>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="hero-preview reveal">
          <div className="preview-card">
            <div className="preview-header">
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>FitAI</span>
              <span className="badge badge-green">● Live</span>
            </div>
            <div className="preview-metrics">
              <div className="metric-item">
                <div className="metric-label">Habit Score</div>
                <div className="metric-value gradient-text">84</div>
                <div className="mini-bar"><div style={{ width: '84%' }} /></div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Calories</div>
                <div className="metric-value">1,840</div>
                <div className="mini-bar"><div style={{ width: '72%', background: 'linear-gradient(90deg, var(--accent2), #7b61ff)' }} /></div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Workouts</div>
                <div className="metric-value">6/7</div>
                <div className="mini-bar"><div style={{ width: '86%', background: 'linear-gradient(90deg, #ff6b6b, var(--warning))' }} /></div>
              </div>
            </div>
            <div className="preview-ai-msg">
              <div className="ai-avatar">AI</div>
              <div className="ai-bubble">You're losing 0.4kg/week — great pace! Consider adding 200 kcal on training days.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-label reveal">Core System</div>
        <h2 className="section-title reveal">Everything adapts to you</h2>
        <div className="features-grid">
          {[
            { icon: <Zap size={28} />, title: 'Smart Workout Plans', desc: 'Generated from your goal, experience, and recovery data — updated weekly.' },
            { icon: <Leaf size={28} />, title: 'Nutrition Intelligence', desc: 'Calorie & macro targets with safety floors. No dangerous deficits.' },
            { icon: <TrendingUp size={28} />, title: 'Progress Tracking', desc: 'Weight trends, completion rates, body measurements over time.' },
            { icon: <CircleDot size={28} />, title: 'Habit Engine', desc: 'Habit score from workout + diet adherence. Drop-off detection included.' },
            { icon: <Gauge size={28} />, title: 'Energy Check-ins', desc: 'Daily fatigue logging triggers automatic intensity adjustments.' },
            { icon: <Target size={28} />, title: 'Progressive Overload', desc: 'Auto-scales volume when you hit 90%+ completion for 2 weeks.' },
            { icon: <Ruler size={28} />, title: 'Goal Forecast', desc: 'AI-calculated timeline to your goal weight with confidence bands.' },
            { icon: <Bot size={28} />, title: 'AI Coach', desc: 'Ask anything — your AI coach responds with data from your own stats.' },
          ].map((f, i) => (
            <div key={i} className="feature-card reveal" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon" style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="section-label reveal">The Loop</div>
        <h2 className="section-title reveal">Continuous adaptation</h2>
        <div className="loop-steps">
          {['Profile', 'Plan', 'Execute', 'Track', 'Analyze', 'Adjust', 'Coach'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="loop-step reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-name">{step}</div>
              </div>
              {i < 6 && <div className="step-arrow reveal">→</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-content reveal">
          <h2>Start adapting today</h2>
          <p>Free to use. No credit card. Just results.</p>
          <button className="btn-primary" style={{ fontSize: 17, padding: '16px 44px' }} onClick={() => navigate('/register')}>
            Create Free Account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <div className="logo-mark" style={{ width: 28, height: 28, fontSize: 13 }}>F</div>
          <span className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>FitAI</span>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: 12 }}>© 2024 FitAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
