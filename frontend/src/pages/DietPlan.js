import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout, MedicalDisclaimer } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Info, Zap, Salad, ArrowDownCircle } from '../components/Icons';

ChartJS.register(ArcElement, Tooltip);

const getDietAdjustmentSummary = (stats, profile) => {
  if (!stats) return null;
  const dietAdh = stats.dietAdherence ?? 100;
  const workoutAdh = stats.workoutAdherence ?? 100;
  const dropOff = stats.dropOffRisk;

  if (!dropOff && dietAdh >= 60) return null;

  const reasons = [];
  const changes = [];

  if (dietAdh < 40) {
    reasons.push(`Diet adherence is at ${dietAdh}% — significantly below target.`);
    changes.push('Consider simplifying meals to reduce friction and improve adherence.');
  } else if (dietAdh < 60) {
    reasons.push(`Diet adherence is at ${dietAdh}% — below the 60% threshold.`);
    changes.push('Meal variety has been kept consistent to help you get back on track.');
  }

  if (workoutAdh < 50) {
    reasons.push(`Workout completion is at ${workoutAdh}% — activity levels are lower than expected.`);
    changes.push('Calorie surplus/deficit adjustments may be less impactful until activity normalises.');
  }

  if (stats.consecutiveMissed >= 3) {
    reasons.push('3 or more consecutive workouts were missed recently.');
  }

  if (reasons.length === 0) return null;

  return {
    dietAdherence: dietAdh,
    workoutAdherence: workoutAdh,
    reasons,
    changes,
    action: dietAdh < 50
      ? 'Start with one meal at a time. Even partial adherence builds momentum.'
      : 'Focus on consistency over perfection — following the plan 70% of the time is better than 0%.'
  };
};

const DietPlan = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressStats, setProgressStats] = useState(null);

  const goal = user?.profile?.goal;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/diet/plan'),
      axios.get('/api/progress/stats').catch(() => ({ data: null }))
    ])
      .then(([dietRes, statsRes]) => {
        setPlan(dietRes.data);
        setProgressStats(statsRes.data?.stats || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [goal]);

  if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;

  const chartData = plan ? {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [plan.macros.protein.calories, plan.macros.carbs.calories, plan.macros.fat.calories],
      backgroundColor: ['rgba(0,232,122,0.7)', 'rgba(0,196,255,0.7)', 'rgba(255,107,157,0.7)'],
      borderColor: ['#00e87a', '#00c4ff', '#ff6b9d'],
      borderWidth: 2
    }]
  } : null;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Diet Plan</h1>
        <p style={{ color: 'var(--text2)' }}>
          Personalized nutrition based on your goal and calorie target
          {plan?.dietPreference && (
            <span style={{
              marginLeft: 10, fontSize: 12, fontWeight: 600,
              padding: '2px 10px', borderRadius: 20,
              background: 'rgba(255,179,64,0.12)',
              color: 'var(--warning)',
              border: '1px solid rgba(255,179,64,0.3)',
              verticalAlign: 'middle'
            }}>
              {plan.dietPreference === 'non_vegetarian' ? 'Non-Veg' :
               plan.dietPreference === 'eggetarian' ? 'Eggetarian' : 'Vegetarian'}
            </span>
          )}
        </p>
      </div>

      <MedicalDisclaimer style={{ marginBottom: 24 }} />

      {/* Evaluation-driven calorie adjustment notice */}
      {plan?.evaluationAdjustment && (
        <div style={{
          borderRadius: 14,
          border: `1px solid ${plan.evaluationAdjustment.applied < 0 ? 'rgba(0,232,122,0.25)' : 'rgba(255,179,64,0.25)'}`,
          background: plan.evaluationAdjustment.applied < 0
            ? 'rgba(0,232,122,0.06)' : 'rgba(255,179,64,0.06)',
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex', alignItems: 'flex-start', gap: 12
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: plan.evaluationAdjustment.applied < 0 ? 'rgba(0,232,122,0.1)' : 'rgba(255,179,64,0.1)',
            border: `1px solid ${plan.evaluationAdjustment.applied < 0 ? 'rgba(0,232,122,0.3)' : 'rgba(255,179,64,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: plan.evaluationAdjustment.applied < 0 ? 'var(--accent)' : 'var(--warning)'
          }}>
            <Info size={15} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4,
              color: plan.evaluationAdjustment.applied < 0 ? 'var(--accent)' : 'var(--warning)'
            }}>
              Weekly Evaluation — Calorie Target Adjusted
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
              Target changed from{' '}
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{plan.evaluationAdjustment.originalCalories} kcal</span>
              {' '}to{' '}
              <span style={{ fontWeight: 700, color: plan.evaluationAdjustment.applied < 0 ? 'var(--accent)' : 'var(--warning)' }}>
                {plan.evaluationAdjustment.adjustedCalories} kcal
              </span>
              {' '}({plan.evaluationAdjustment.applied > 0 ? '+' : ''}{plan.evaluationAdjustment.applied} kcal/day) based on your weekly progress evaluation.
            </div>
            {plan.evaluationAdjustment.triggers?.map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600 }}>{t.title}:</span> {t.recommendation}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diet Adjustment Summary */}
      {(() => {
        const summary = getDietAdjustmentSummary(progressStats, user?.profile);
        if (!summary) return null;
        return (
          <div style={{
            borderRadius: 16,
            border: '1px solid rgba(255,152,0,0.3)',
            background: 'linear-gradient(135deg, rgba(255,152,0,0.06) 0%, rgba(255,107,157,0.04) 100%)',
            marginBottom: 24,
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,152,0,0.2)',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,152,0,0.12)',
                border: '1px solid rgba(255,152,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ff9800'
              }}>
                <ArrowDownCircle size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ff9800', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                  Diet Plan Adjustment Summary
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  Based on your recent consistency — plan kept simple to rebuild momentum
                </div>
              </div>
              {/* Adherence badge */}
              <div style={{
                padding: '4px 12px', borderRadius: 20, flexShrink: 0,
                background: summary.dietAdherence < 50 ? 'rgba(239,68,68,0.12)' : 'rgba(255,152,0,0.12)',
                border: `1px solid ${summary.dietAdherence < 50 ? 'rgba(239,68,68,0.3)' : 'rgba(255,152,0,0.3)'}`,
                color: summary.dietAdherence < 50 ? 'var(--danger)' : '#ff9800',
                fontSize: 12, fontWeight: 700
              }}>
                {summary.dietAdherence}% diet adh.
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Reasons */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text3)', marginTop: 1
                }}><Info size={13} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Why</div>
                  {summary.reasons.map((r, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: i < summary.reasons.length - 1 ? 4 : 0 }}>
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              {/* Changes */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text3)', marginTop: 1
                }}><Salad size={13} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>What changed</div>
                  {summary.changes.map((c, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: i < summary.changes.length - 1 ? 4 : 0 }}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text3)', marginTop: 1
                }}><Zap size={13} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>What to do</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{summary.action}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {plan && (
        <>
          {/* Calorie + macro overview */}
          <div className="diet-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Daily Targets</h3>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total Calories</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800 }} className="gradient-text">{plan.targetCalories}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>kcal per day</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Protein', data: plan.macros.protein, color: 'var(--accent)' },
                  { name: 'Carbs', data: plan.macros.carbs, color: 'var(--accent2)' },
                  { name: 'Fat', data: plan.macros.fat, color: '#ff6b9d' }
                ].map(m => (
                  <div key={m.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                      <span style={{ fontSize: 14, color: m.color, fontWeight: 600 }}>{m.data.grams}g ({m.data.percentage}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${m.data.percentage}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontSize: 16, marginBottom: 20, alignSelf: 'flex-start' }}>Macro Split</h3>
              {chartData && (
                <div style={{ maxWidth: 200 }}>
                  <Doughnut data={chartData} options={{
                    cutout: '70%',
                    plugins: {
                      legend: { display: false },
                      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} kcal` } }
                    }
                  }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                {[
                  { label: 'Protein', color: '#00e87a' },
                  { label: 'Carbs', color: '#00c4ff' },
                  { label: 'Fat', color: '#ff6b9d' }
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meals */}
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Daily Meal Plan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {plan.meals.map((meal, i) => {
              const mealPalette = [
                { accent: '#00e87a', glow: 'rgba(0,232,122,0.08)', border: 'rgba(0,232,122,0.22)', bg: 'rgba(0,232,122,0.05)' },
                { accent: '#00c4ff', glow: 'rgba(0,196,255,0.08)', border: 'rgba(0,196,255,0.22)', bg: 'rgba(0,196,255,0.05)' },
                { accent: '#ff6b9d', glow: 'rgba(255,107,157,0.08)', border: 'rgba(255,107,157,0.22)', bg: 'rgba(255,107,157,0.05)' },
                { accent: '#ffb340', glow: 'rgba(255,179,64,0.08)',  border: 'rgba(255,179,64,0.22)',  bg: 'rgba(255,179,64,0.05)' },
              ];
              const mc = mealPalette[i % mealPalette.length];

              const n = meal.name.toLowerCase();
              const icon = n.includes('breakfast') ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mc.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : n.includes('lunch') ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mc.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="21" y1="15" x2="21" y2="22"/>
                  <path d="M21 2a5 5 0 0 0-5 5v6h5"/>
                </svg>
              ) : n.includes('dinner') ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mc.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mc.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              );

              const totalMacroKcal = meal.protein * 4 + meal.carbs * 4 + meal.fat * 9;
              const macros = [
                { label: 'Protein', val: meal.protein, color: '#00e87a', pct: totalMacroKcal > 0 ? Math.round((meal.protein * 4 / totalMacroKcal) * 100) : 0 },
                { label: 'Carbs',   val: meal.carbs,   color: '#00c4ff', pct: totalMacroKcal > 0 ? Math.round((meal.carbs * 4 / totalMacroKcal) * 100) : 0 },
                { label: 'Fat',     val: meal.fat,     color: '#ff6b9d', pct: totalMacroKcal > 0 ? Math.round((meal.fat * 9 / totalMacroKcal) * 100) : 0 },
              ];

              return (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${mc.border}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow)',
                  transition: 'var(--transition)',
                }}>

                  {/* ── Card header ───────────────────────────────── */}
                  <div className="diet-meal-header" style={{
                    background: `linear-gradient(135deg, ${mc.bg} 0%, transparent 60%)`,
                    borderBottom: `1px solid ${mc.border}`,
                    padding: '24px 28px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                      {/* Meal icon */}
                      <div style={{
                        width: 60, height: 60, borderRadius: 16, flexShrink: 0,
                        background: mc.glow, border: `1.5px solid ${mc.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {icon}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{meal.name}</div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7,
                          background: 'var(--bg3)', border: '1px solid var(--border2)',
                          borderRadius: 20, padding: '3px 11px',
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{meal.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Calorie badge */}
                    <div className="diet-calorie-badge" style={{
                      background: mc.glow, border: `1.5px solid ${mc.border}`,
                      borderRadius: 16, padding: '12px 20px', textAlign: 'center',
                    }}>
                      <div className="diet-calorie-num" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 40, color: mc.accent, lineHeight: 1 }}>{meal.calories}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600 }}>kcal</div>
                    </div>
                  </div>

                  <div style={{ padding: '22px 28px' }}>

                    {/* ── Macro breakdown ──────────────────────────── */}
                    <div className="diet-macro-grid">
                      {macros.map(m => (
                        <div key={m.label} style={{
                          background: 'var(--bg3)', borderRadius: 14,
                          padding: '14px 16px', border: '1px solid var(--border)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{m.label}</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: m.color, lineHeight: 1 }}>
                              {m.val}<span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 400, marginLeft: 1 }}>g</span>
                            </span>
                          </div>
                          <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 3, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Food items section ───────────────────────── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mc.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        What's on the plate
                      </span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                      {meal.items.map((item, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '13px 16px',
                          background: mc.bg,
                          borderRadius: 12,
                          border: `1px solid ${mc.border}`,
                          borderLeft: `3px solid ${mc.accent}`,
                        }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                            background: mc.glow, border: `1px solid ${mc.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: mc.accent,
                          }}>{j + 1}</div>
                          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', lineHeight: 1.35 }}>{item}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DietPlan;