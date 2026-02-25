import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout, MedicalDisclaimer } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Zap, Lightbulb, Moon, Flame, ArrowDownCircle, ArrowUpCircle, Info } from '../components/Icons';

const WORKOUT_QUOTES = [
  { quote: "A lighter plan done consistently will always beat an intense plan abandoned.", author: "FitAI Coach" },
  { quote: "Every small win counts. Show up today — even 20 minutes changes everything.", author: "FitAI Coach" },
  { quote: "Champions are made in the moments they want to quit but don't.", author: "Unknown" },
  { quote: "Progress is progress, no matter how small. Keep moving forward.", author: "Unknown" },
  { quote: "Your only competition is who you were yesterday.", author: "FitAI Coach" },
  { quote: "The hardest part is starting. Once you begin, momentum takes over.", author: "Unknown" },
  { quote: "Consistency is the bridge between goals and accomplishment.", author: "Unknown" },
];

const getDayQuote = () => WORKOUT_QUOTES[new Date().getDate() % WORKOUT_QUOTES.length];

const EXPERIENCE_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

const WorkoutPlan = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);
  const [error, setError] = useState('');
  const [adjustedExperience, setAdjustedExperience] = useState(null);
  const [adjustmentSummary, setAdjustmentSummary] = useState(null);

  const goal = user?.profile?.goal;
  const [workoutType, setWorkoutType] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/workout/plan')
      .then(res => {
        setPlan(res.data.plan);
        setWorkoutType(res.data.workoutType);
        setAdjustedExperience(res.data.adjustedExperience);
        setAdjustmentSummary(res.data.adjustmentSummary || null);
        setActiveDay(0);
      })
      .catch(err => setError(err.response?.data?.message || 'Error loading plan'))
      .finally(() => setLoading(false));
  }, [goal]);

  const profileExperience = user?.profile?.experienceLevel;
  const isLighterMode = adjustedExperience && profileExperience &&
    EXPERIENCE_ORDER[adjustedExperience] < EXPERIENCE_ORDER[profileExperience];

  const dayColors = [
    'var(--accent)', 'var(--accent2)', '#ff6b9d',
    'var(--warning)', 'var(--accent)', 'var(--accent2)', '#9b59b6'
  ];

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--danger)' }}>{error}</div>
    </DashboardLayout>
  );

  const activeDayPlan = plan?.[activeDay];

  return (
    <DashboardLayout>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="workout-page-title" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
          Weekly Workout Plan
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Adaptive plan based on your goal and experience level
          {workoutType && (
            <span style={{
              marginLeft: 10, fontSize: 12, fontWeight: 600,
              padding: '2px 10px', borderRadius: 20,
              background: workoutType === 'home' ? 'rgba(0,196,255,0.12)' : 'rgba(0,232,122,0.12)',
              color: workoutType === 'home' ? 'var(--accent2)' : 'var(--accent)',
              border: `1px solid ${workoutType === 'home' ? 'rgba(0,196,255,0.3)' : 'rgba(0,232,122,0.3)'}`,
              verticalAlign: 'middle'
            }}>
              {workoutType === 'home' ? 'Home' : 'Gym'}
            </span>
          )}
          {isLighterMode && (
            <span style={{
              marginLeft: 8, fontSize: 12, fontWeight: 600,
              padding: '2px 10px', borderRadius: 20,
              background: 'rgba(255,179,64,0.12)',
              color: 'var(--warning)',
              border: '1px solid rgba(255,179,64,0.3)',
              verticalAlign: 'middle'
            }}>
              Lighter Mode Active
            </span>
          )}
        </p>
      </div>

      {/* Lighter mode motivation banner */}
      {isLighterMode && (() => {
        const q = getDayQuote();
        return (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,179,64,0.07) 0%, rgba(0,232,122,0.07) 100%)',
            border: '1px solid rgba(255,179,64,0.25)',
            borderRadius: 16, padding: '18px 22px', marginBottom: 24,
            display: 'flex', alignItems: 'flex-start', gap: 14
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(255,179,64,0.12)',
              border: '1px solid rgba(255,179,64,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--warning)'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Lighter Mode — Building Your Foundation
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.55 }}>
                Your plan has been adjusted to a lighter intensity to help you stay consistent. Completing a lighter workout is far better than skipping a harder one.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.55 }}>
                "{q.quote}" <span style={{ fontStyle: 'normal', color: 'var(--text3)', fontSize: 12 }}>— {q.author}</span>
              </p>
            </div>
          </div>
        );
      })()}

      {/* Adjustment Summary Card */}
      {adjustmentSummary && (
        <div style={{
          borderRadius: 16,
          border: `1px solid ${adjustmentSummary.type === 'downgrade' ? 'rgba(255,152,0,0.3)' : 'rgba(0,232,122,0.3)'}`,
          background: adjustmentSummary.type === 'downgrade'
            ? 'linear-gradient(135deg, rgba(255,152,0,0.06) 0%, rgba(255,107,157,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(0,232,122,0.06) 0%, rgba(0,196,255,0.04) 100%)',
          marginBottom: 24,
          overflow: 'hidden'
        }}>
          {/* Summary header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${adjustmentSummary.type === 'downgrade' ? 'rgba(255,152,0,0.2)' : 'rgba(0,232,122,0.2)'}`,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: adjustmentSummary.type === 'downgrade' ? 'rgba(255,152,0,0.12)' : 'rgba(0,232,122,0.12)',
              border: `1px solid ${adjustmentSummary.type === 'downgrade' ? 'rgba(255,152,0,0.3)' : 'rgba(0,232,122,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: adjustmentSummary.type === 'downgrade' ? '#ff9800' : 'var(--accent)'
            }}>
              {adjustmentSummary.type === 'downgrade' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: adjustmentSummary.type === 'downgrade' ? '#ff9800' : 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2
              }}>
                Plan Adjustment Summary
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                {adjustmentSummary.type === 'downgrade' ? 'Intensity reduced to restore consistency' : 'Intensity increased — you earned it'}
              </div>
            </div>
            {/* Level change badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text2)', textTransform: 'capitalize'
              }}>{adjustmentSummary.from}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>→</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: adjustmentSummary.type === 'downgrade' ? 'rgba(255,152,0,0.12)' : 'rgba(0,232,122,0.12)',
                border: `1px solid ${adjustmentSummary.type === 'downgrade' ? 'rgba(255,152,0,0.3)' : 'rgba(0,232,122,0.3)'}`,
                color: adjustmentSummary.type === 'downgrade' ? '#ff9800' : 'var(--accent)',
                textTransform: 'capitalize'
              }}>{adjustmentSummary.to}</span>
            </div>
          </div>

          {/* Summary body */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <Info size={13} />, label: 'Why', text: adjustmentSummary.reason },
              { icon: <Zap size={13} />, label: 'What changed', text: adjustmentSummary.impact },
              { icon: <Flame size={13} />, label: 'What to do', text: adjustmentSummary.action },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text3)', marginTop: 1
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}: </span>
                  <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day selector tabs */}
      <div className="day-tabs">
        {plan?.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className="day-tab-btn"
            style={{
              background: activeDay === i ? 'rgba(0,232,122,0.12)' : 'var(--surface)',
              border: `1.5px solid ${activeDay === i ? 'var(--accent)' : 'var(--border)'}`,
              color: activeDay === i ? 'var(--accent)' : 'var(--text2)',
              fontWeight: activeDay === i ? 700 : 400,
            }}
          >
            {day.day}
          </button>
        ))}
      </div>

      {/* Medical disclaimer */}
      <MedicalDisclaimer style={{ marginBottom: 24 }} />

      {/* Active day content */}
      {activeDayPlan && (
        <div className="fade-in">

          {/* Day banner */}
          <div className="workout-day-banner">
            <div
              className="workout-day-icon"
              style={{
                background: `${dayColors[activeDay]}22`,
                color: dayColors[activeDay],
              }}
            >
              <Zap size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="workout-day-title">{activeDayPlan.day}</div>
              <span className="badge badge-green" style={{ fontSize: 12 }}>
                {activeDayPlan.focus}
              </span>
            </div>
          </div>

          {/* Exercise list */}
          {activeDayPlan.exercises?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeDayPlan.exercises.map((ex, i) => (
                <div key={i} className="card exercise-card">

                  {/* Exercise number */}
                  <div className="exercise-num">{i + 1}</div>

                  {/* Exercise info */}
                  <div className="exercise-info">
                    <div className="exercise-name">{ex.name}</div>
                    <div className="exercise-form-tip">
                      <Lightbulb size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{ex.form}</span>
                    </div>
                  </div>

                  {/* Stats: sets / reps / rest */}
                  {ex.sets > 0 && (
                    <div className="exercise-stats">
                      <div className="exercise-stat">
                        <span className="stat-val gradient-text">{ex.sets}</span>
                        <span className="stat-lbl">Sets</span>
                      </div>
                      <div className="stat-sep" />
                      <div className="exercise-stat">
                        <span className="stat-val">{ex.reps}</span>
                        <span className="stat-lbl">Reps</span>
                      </div>
                      <div className="stat-sep" />
                      <div className="exercise-stat">
                        <span className="stat-val" style={{ color: 'var(--text2)', fontSize: 14 }}>
                          {ex.rest}
                        </span>
                        <span className="stat-lbl">Rest</span>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--text3)' }}>
                <Moon size={40} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Rest Day</div>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                Recovery is where growth happens!
              </p>
            </div>
          )}

        </div>
      )}
    </DashboardLayout>
  );
};

export default WorkoutPlan;
