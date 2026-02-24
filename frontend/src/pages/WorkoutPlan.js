import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Zap, Lightbulb, Moon } from '../components/Icons';

const WorkoutPlan = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);
  const [error, setError] = useState('');

  const goal = user?.profile?.goal;
  const [workoutType, setWorkoutType] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/workout/plan')
      .then(res => { setPlan(res.data.plan); setWorkoutType(res.data.workoutType); setActiveDay(0); })
      .catch(err => setError(err.response?.data?.message || 'Error loading plan'))
      .finally(() => setLoading(false));
  }, [goal]);

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
        </p>
      </div>

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
