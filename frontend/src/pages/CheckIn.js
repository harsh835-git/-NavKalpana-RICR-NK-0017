import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { EnergyIcons, AlertTriangle, Bed, Check } from '../components/Icons';

const energyOptions = [
  { value: 'energized', label: 'Energized', desc: 'Feeling great, ready to crush it!', color: 'var(--accent)', icon: EnergyIcons.energized },
  { value: 'normal', label: 'Normal', desc: 'Feeling good, ready to train', color: 'var(--accent2)', icon: EnergyIcons.normal },
  { value: 'slightly_fatigued', label: 'Slightly Fatigued', desc: 'A bit tired but can train', color: 'var(--warning)', icon: EnergyIcons.slightly_fatigued },
  { value: 'very_tired', label: 'Very Tired', desc: 'Low energy, consider resting', color: 'var(--danger)', icon: EnergyIcons.very_tired }
];

const CheckIn = () => {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    axios.get('/api/checkin').then(res => {
      setHistory(res.data);
      // Check if already checked in today
      if (res.data.length > 0) {
        const lastCheckin = new Date(res.data[0].date);
        const today = new Date();
        if (lastCheckin.toDateString() === today.toDateString()) {
          setSubmitted(true);
          setSelected(res.data[0].energyLevel);
        }
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!selected) return showToast('Please select your energy level', 'error');
    setLoading(true);
    try {
      const res = await axios.post('/api/checkin', { energyLevel: selected });
      setRecommendation(res.data.recommendation);
      setSubmitted(true);
      showToast('Check-in recorded!');
      const histRes = await axios.get('/api/checkin');
      setHistory(histRes.data);
    } catch (err) {
      showToast('Error saving check-in', 'error');
    } finally { setLoading(false); }
  };

  const weeklyFatigueCount = history.slice(0, 7).filter(c => 
    c.energyLevel === 'slightly_fatigued' || c.energyLevel === 'very_tired'
  ).length;

  const energyLabelMap = EnergyIcons;

  return (
    <DashboardLayout>
      {ToastComponent}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Daily Check-in</h1>
        <p style={{ color: 'var(--text2)' }}>Log your energy level to optimize training intensity</p>
      </div>

      <div className="checkin-grid">
        {/* Check-in form */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>How are you feeling today?</h3>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
              {submitted ? 'Today\'s check-in complete!' : 'Your energy level helps FitAI adjust your workout intensity automatically.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {energyOptions.map(opt => (
                <button key={opt.value} onClick={() => !submitted && setSelected(opt.value)}
                  className="energy-option-btn"
                  style={{
                    cursor: submitted ? 'default' : 'pointer',
                    background: selected === opt.value ? `${opt.color}12` : 'var(--bg3)',
                    border: `2px solid ${selected === opt.value ? opt.color : 'var(--border)'}`,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: opt.color, flexShrink: 0 }}>{opt.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{opt.desc}</div>
                  </div>
                  {selected === opt.value && (
                    <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {!submitted ? (
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
                {loading ? <><div className="spinner" />Saving...</> : 'Log Energy Level →'}
              </button>
            ) : (
              <div style={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 12, padding: 16, textAlign: 'center', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Check size={18} /> Check-in complete for today!
              </div>
            )}
          </div>

          {/* AI Recommendation */}
          {recommendation && (
            <div className="card fade-in" style={{ 
              background: recommendation.type === 'recovery' ? 'rgba(255,68,102,0.05)' : 'rgba(255,179,64,0.05)',
              border: `1px solid ${recommendation.type === 'recovery' ? 'rgba(255,68,102,0.2)' : 'rgba(255,179,64,0.2)'}`
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: recommendation.type === 'recovery' ? 'var(--danger)' : 'var(--warning)' }}>
                  {recommendation.type === 'recovery' ? <Bed size={28} /> : <AlertTriangle size={28} />}
                </span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: recommendation.type === 'recovery' ? 'var(--danger)' : 'var(--warning)' }}>
                    {recommendation.type === 'recovery' ? 'Recovery Day Recommended' : 'Adjust Intensity'}
                  </div>
                  <p style={{ color: 'var(--text2)', fontSize: 14 }}>{recommendation.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Fatigue summary */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Weekly Energy Summary</h3>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="energy-score-num" style={{ color: weeklyFatigueCount >= 3 ? 'var(--danger)' : 'var(--accent)' }}>
                {7 - weeklyFatigueCount}/7
              </div>
              <div style={{ fontSize: 14, color: 'var(--text2)' }}>Good energy days</div>
            </div>
            {weeklyFatigueCount >= 3 && (
              <div style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', borderRadius: 10, padding: 12, fontSize: 13, color: 'var(--danger)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <AlertTriangle size={16} /> {weeklyFatigueCount} fatigue flags this week — recovery day recommended
              </div>
            )}
          </div>

          {/* History */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Check-in History</h3>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text2)', textAlign: 'center', fontSize: 14 }}>No check-ins yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 14).map((c, i) => (
                  <div key={i} className="checkin-history-item">
                    <span className="checkin-history-date">
                      {new Date(c.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text2)', flexShrink: 0 }}>{energyLabelMap[c.energyLevel]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckIn;
