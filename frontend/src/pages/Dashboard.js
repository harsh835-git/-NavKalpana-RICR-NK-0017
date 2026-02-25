import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout, MedicalDisclaimer } from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import { Gauge, BarChart3, Zap, Flame, Leaf, CircleDot, Bot, AlertTriangle, Scale, Target, Activity, Trophy, TrendingUp, Check, ArrowDownCircle, ArrowUpCircle, Dumbbell } from '../components/Icons';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const FITNESS_QUOTES = [
  { quote: "Every rep you skip is a vote for the old you. Every rep you do is a vote for the new you.", author: "Atomic Habits" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "The only bad workout is the one that didn't happen. Show up — even for 10 minutes.", author: "FitAI Coach" },
  { quote: "Progress, not perfection. Consistency over intensity — every single time.", author: "FitAI Coach" },
  { quote: "Your body can do it. It's your mind you need to convince.", author: "Unknown" },
  { quote: "Small steps every day create the biggest changes. Keep going.", author: "FitAI Coach" },
  { quote: "Your future self is watching. Make them proud today.", author: "FitAI Coach" },
  { quote: "A lighter plan followed consistently beats a perfect plan abandoned.", author: "FitAI Coach" },
  { quote: "Rest if you must, but never quit. Your journey is worth it.", author: "Unknown" },
  { quote: "Every champion was once a beginner. What matters is you don't stop.", author: "Unknown" },
];

const getDayQuote = () => FITNESS_QUOTES[new Date().getDate() % FITNESS_QUOTES.length];

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', color: color || 'var(--text2)' }}>{icon}</span>
    </div>
    <div className="stat-card-value" style={{ color: color || 'var(--text)' }}>{value}</div>
    {sub && <div style={{ fontSize: 13, color: 'var(--text2)' }}>{sub}</div>}
  </div>
);

const getBMIInfo = (bmi) => {
  if (!bmi) return { label: '—', color: 'var(--text2)' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--warning)' };
  if (bmi < 25)   return { label: 'Normal', color: 'var(--accent)' };
  if (bmi < 30)   return { label: 'Overweight', color: '#ff9800' };
  return { label: 'Obese', color: 'var(--danger)' };
};

const fmt = (n) => n ? n.toLocaleString() : '—';

const getConsistencyStatus = (habitScore) => {
  const score = habitScore?.weeklyScore ?? habitScore?.monthlyAverage ?? 0;
  if (score >= 75) return { label: 'On Track', color: 'var(--accent)', description: 'Maintaining this pace' };
  if (score >= 50) return { label: 'Slightly Behind', color: '#ff9800', description: 'Small improvements needed' };
  return { label: 'Off Track', color: 'var(--danger)', description: 'Consistency needs attention' };
};

const GoalForecastCard = ({ forecast, habitScore }) => {
  const consistency = getConsistencyStatus(habitScore);
  const score = habitScore?.weeklyScore ?? 0;

  // Optimistic scenario: 85% habit score yields ~20% faster progress than baseline
  // Cap speedup at 1.3x so we never compress a long timeline to 0
  const optimisticSpeedup = score > 0 ? Math.min(1 + (85 - Math.min(score, 85)) / 85 * 0.3, 1.3) : 1.1;
  const optimisticWeeks = forecast ? Math.max(1, Math.round(forecast.weeksToGoal / optimisticSpeedup)) : null;

  // Pessimistic scenario: below 40% habit score extends timeline by 50–100%
  const pessimisticSlowdown = score > 40 ? 1.5 : 2.0;
  const pessimisticWeeks = forecast ? Math.round(forecast.weeksToGoal * pessimisticSlowdown) : null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16 }}>Goal Forecast</h3>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,215,0,0.12)',
          border: '1px solid rgba(255,215,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#ffd700'
        }}>
          <Trophy size={18} />
        </div>
      </div>

      {forecast ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Consistency status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 20,
            background: `${consistency.color}14`,
            border: `1px solid ${consistency.color}40`,
            alignSelf: 'flex-start'
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: consistency.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: consistency.color }}>{consistency.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{consistency.description}</span>
          </div>

          {/* Current vs Goal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Current</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{forecast.currentWeight} kg</div>
            </div>
            <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Goal</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#ffd700' }}>{forecast.goalWeight} kg</div>
            </div>
          </div>

          {/* Main estimate — current pace */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,232,122,0.08) 0%, rgba(0,196,255,0.05) 100%)',
            border: '1px solid rgba(0,232,122,0.2)',
            borderRadius: 12, padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {forecast.rateSource === 'estimated' ? 'Projected Pace' : 'At Current Pace'}
              </div>
              {forecast.rateSource === 'estimated' && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  background: 'rgba(0,196,255,0.1)', border: '1px solid rgba(0,196,255,0.25)',
                  color: 'var(--accent2)'
                }}>Goal-based estimate</span>
              )}
              {forecast.rateSource === 'clamped' && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  background: 'rgba(255,179,64,0.1)', border: '1px solid rgba(255,179,64,0.25)',
                  color: 'var(--warning)'
                }}>Rate adjusted to safe range</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{forecast.weeksToGoal}</span>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>weeks</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
              {new Date(forecast.estimatedDate).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </div>
            {forecast.rateSource === 'estimated' && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                Log 3+ weight entries over 2+ weeks for your real pace
              </div>
            )}
          </div>

          {/* Scenario forecasts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Consistency Scenarios</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{
                background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.2)',
                borderRadius: 10, padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <TrendingUp size={11} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>If consistent</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                  {optimisticWeeks} wks
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>85%+ habit score</div>
              </div>
              <div style={{
                background: 'rgba(255,152,0,0.06)', border: '1px solid rgba(255,152,0,0.2)',
                borderRadius: 10, padding: '10px 12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <AlertTriangle size={11} style={{ color: '#ff9800' }} />
                  <span style={{ fontSize: 10, color: '#ff9800', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>If inconsistent</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#ff9800' }}>
                  {pessimisticWeeks} wks
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>below 40% habit score</div>
              </div>
            </div>
          </div>

          {/* Weekly change */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Avg weekly change</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: forecast.avgWeeklyChange < 0 ? 'var(--accent)' : 'var(--warning)' }}>
              {forecast.avgWeeklyChange > 0 ? '+' : ''}{forecast.avgWeeklyChange} kg/wk
            </span>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text2)', padding: '30px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--text3)' }}>
            <Trophy size={32} />
          </div>
          <p style={{ fontSize: 14 }}>Log at least 2 weight entries to see your forecast</p>
        </div>
      )}
    </div>
  );
};

const TRIGGER_CONFIG = {
  increase_deficit: { icon: <ArrowDownCircle size={15} />, color: '#ff9800',  bg: 'rgba(255,152,0,0.1)',  border: 'rgba(255,152,0,0.25)' },
  reduce_deficit:   { icon: <ArrowUpCircle  size={15} />, color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
  increase_volume:  { icon: <Dumbbell       size={15} />, color: 'var(--accent2)', bg: 'rgba(0,196,255,0.08)',  border: 'rgba(0,196,255,0.25)' },
  simplify_plan:    { icon: <Zap            size={15} />, color: '#ff6b9d',   bg: 'rgba(255,107,157,0.08)', border: 'rgba(255,107,157,0.25)' }
};

const WeeklyEvaluationCard = ({ evaluation }) => {
  const [expanded, setExpanded] = useState(false);

  if (!evaluation) return null;

  const isOnTrack = evaluation.status === 'on_track';
  const isCritical = evaluation.status === 'critical';

  const statusColor  = isOnTrack ? 'var(--accent)' : isCritical ? 'var(--danger)' : '#ff9800';
  const statusBg     = isOnTrack ? 'rgba(0,232,122,0.08)' : isCritical ? 'rgba(239,68,68,0.07)' : 'rgba(255,152,0,0.07)';
  const statusBorder = isOnTrack ? 'rgba(0,232,122,0.25)' : isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(255,152,0,0.25)';
  const statusLabel  = isOnTrack ? 'On Track' : isCritical ? 'Critical Adjustment' : 'Adjustments Applied';

  return (
    <div style={{
      background: statusBg,
      border: `1px solid ${statusBorder}`,
      borderRadius: 16,
      marginBottom: 24,
      overflow: 'hidden'
    }}>
      {/* Header row */}
      <div
        style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor
        }}>
          {isOnTrack ? <Check size={18} /> : <AlertTriangle size={18} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Weekly Evaluation
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
              background: `${statusColor}18`, border: `1px solid ${statusColor}35`,
              color: statusColor
            }}>{statusLabel}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {isOnTrack
              ? 'Progress is within target ranges — no plan changes needed.'
              : `${evaluation.triggers.length} adjustment${evaluation.triggers.length > 1 ? 's' : ''} applied to your plan automatically.`}
          </div>
        </div>

        {/* Stats inline */}
        <div style={{ display: 'flex', gap: 16, flexShrink: 0, alignItems: 'center' }}>
          {evaluation.weeklyWeightChange !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Weekly change</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: evaluation.weeklyWeightChange < 0 ? 'var(--accent)' : 'var(--warning)' }}>
                {evaluation.weeklyWeightChange > 0 ? '+' : ''}{evaluation.weeklyWeightChange} kg
              </div>
            </div>
          )}
          <div style={{ fontSize: 18, color: 'var(--text3)', lineHeight: 1 }}>{expanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {/* Expanded trigger list */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${statusBorder}`, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isOnTrack ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ color: 'var(--accent)', flexShrink: 0 }}><Check size={16} /></div>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                All metrics are within healthy ranges. Keep up the consistency and check back next week.
              </span>
            </div>
          ) : (
            evaluation.triggers.map((trigger, i) => {
              const cfg = TRIGGER_CONFIG[trigger.type] || TRIGGER_CONFIG['simplify_plan'];
              return (
                <div key={i} style={{
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  borderRadius: 12, padding: '12px 16px',
                  borderLeft: `3px solid ${cfg.color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{trigger.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, lineHeight: 1.5 }}>{trigger.detail}</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
                    <span style={{ color: cfg.color, fontWeight: 600 }}>Action: </span>{trigger.recommendation}
                  </div>
                  {trigger.calorieAdjustment !== 0 && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
                      padding: '3px 10px', borderRadius: 20,
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      fontSize: 11, color: 'var(--text3)'
                    }}>
                      Calorie adjustment: <span style={{ fontWeight: 700, color: trigger.calorieAdjustment < 0 ? 'var(--accent)' : 'var(--warning)' }}>
                        {trigger.calorieAdjustment > 0 ? '+' : ''}{trigger.calorieAdjustment} kcal/day
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Overall adherence summary */}
          {!isOnTrack && (evaluation.workoutAdherence !== null || evaluation.dietAdherence !== null) && (
            <div style={{
              display: 'flex', gap: 16, paddingTop: 8,
              borderTop: `1px solid ${statusBorder}`,
              flexWrap: 'wrap'
            }}>
              {evaluation.workoutAdherence !== null && (
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  Workout adherence: <span style={{ fontWeight: 700, color: 'var(--text2)' }}>{evaluation.workoutAdherence}%</span>
                </div>
              )}
              {evaluation.dietAdherence !== null && (
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  Diet adherence: <span style={{ fontWeight: 700, color: 'var(--text2)' }}>{evaluation.dietAdherence}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [habitScore, setHabitScore] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/progress/stats'),
      axios.get('/api/habit/score'),
      axios.get('/api/progress/evaluation').catch(() => ({ data: null })),
      refreshUser()
    ]).then(([pRes, hRes, evRes]) => {
      setStats(pRes.data);
      setHabitScore(hRes.data);
      setEvaluation(evRes.data?.evaluation || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const profile = user?.profile;
  const goalLabel = {
    weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
    recomposition: 'Recomposition', maintain: 'Maintain', endurance: 'Endurance'
  }[profile?.goal] || '';

  const weightData = stats?.weightLogs || [];
  const chartData = {
    labels: weightData.map(w => new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [{
      data: weightData.map(w => w.weight),
      fill: true,
      borderColor: '#00e87a',
      backgroundColor: 'rgba(0,232,122,0.08)',
      tension: 0.4,
      pointBackgroundColor: '#00e87a',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw} kg` } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a72', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a72', callback: v => `${v}kg` } }
    }
  };

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
          Hey, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--text2)' }}>
          {goalLabel && <><span className="badge badge-green" style={{ marginRight: 8 }}>{goalLabel}</span></>}
          {profile?.targetCalories && `${profile.targetCalories} kcal target · `}
          {profile?.bmi && `BMI ${profile.bmi}`}
        </p>
      </div>

      {/* Drop-off warning */}
      {stats?.stats?.dropOffRisk && (
        <div className="dropoff-warning">
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--danger)', flexShrink: 0 }}><AlertTriangle size={20} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 2 }}>Drop-off Risk Detected</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {stats.stats.consecutiveMissed >= 3 ? '3 consecutive missed workouts. ' : ''}
              {stats.stats.noLogDays ? 'No logs in 14+ days. ' : ''}
              Your plan has been automatically lightened — focus on showing up, not intensity.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
            <button className="btn-secondary dropoff-action-btn" onClick={() => navigate('/workout')} style={{ whiteSpace: 'nowrap', fontSize: 13 }}>Lighter Plan</button>
            <button className="btn-secondary dropoff-action-btn" onClick={() => navigate('/progress')} style={{ whiteSpace: 'nowrap', fontSize: 13 }}>View Progress</button>
          </div>
        </div>
      )}

      {/* Motivation banner — shown when habit score is low or drop-off risk */}
      {!loading && (habitScore?.weeklyScore < 60 || stats?.stats?.dropOffRisk) && (() => {
        const q = getDayQuote();
        return (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,232,122,0.07) 0%, rgba(0,196,255,0.07) 100%)',
            border: '1px solid rgba(0,232,122,0.2)',
            borderRadius: 16, padding: '18px 22px',
            marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(0,232,122,0.12)',
              border: '1px solid rgba(0,232,122,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Keep Going — You've Got This
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', fontStyle: 'italic', marginBottom: 4, lineHeight: 1.6 }}>
                "{q.quote}"
              </p>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>— {q.author}</span>
            </div>
          </div>
        );
      })()}

      {/* Stats grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <StatCard label="Habit Score" value={habitScore?.weeklyScore || 0} sub="This week" icon={<Gauge size={22} />} color="var(--accent)" />
            <StatCard label="Monthly Avg" value={habitScore?.monthlyAverage || 0} sub="30-day habit avg" icon={<BarChart3 size={22} />} />
            <StatCard label="Workout Adh." value={`${stats?.stats?.workoutAdherence || 0}%`} sub="Completion rate" icon={<Zap size={22} />} color="var(--accent2)" />
            <StatCard label="Streak" value={`${stats?.stats?.streak || 0}d`} sub="Current streak" icon={<Flame size={22} />} color="var(--warning)" />
          </div>

          {/* Weekly automated evaluation */}
          <WeeklyEvaluationCard evaluation={evaluation} />

          {/* Body Metrics */}
          {profile && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Body Metrics</h3>
              <div className="grid-4" style={{ marginBottom: 24 }}>
                <StatCard
                  label="BMI"
                  value={profile.bmi ?? '—'}
                  sub={getBMIInfo(profile.bmi).label}
                  icon={<Scale size={22} />}
                  color={getBMIInfo(profile.bmi).color}
                />
                <StatCard
                  label="Maintenance Cal."
                  value={profile.maintenanceCalories ? `${fmt(profile.maintenanceCalories)} kcal` : '—'}
                  sub="Mifflin-St Jeor"
                  icon={<Flame size={22} />}
                  color="var(--warning)"
                />
                <StatCard
                  label="Target Calories"
                  value={profile.targetCalories ? `${fmt(profile.targetCalories)} kcal` : '—'}
                  sub={profile.goal === 'weight_loss' ? 'Deficit –500 kcal' : profile.goal === 'muscle_gain' ? 'Surplus +300 kcal' : profile.goal === 'recomposition' ? 'Slight deficit –100' : profile.goal === 'endurance' ? 'Surplus +100 kcal' : 'Maintenance'}
                  icon={<Target size={22} />}
                  color="var(--accent2)"
                />
                <StatCard
                  label="Safety Floor"
                  value={profile.sex === 'male' ? '1,500 kcal' : '1,200 kcal'}
                  sub={profile.sex === 'male' ? 'Men: 1500–1800 kcal' : 'Women: 1200–1400 kcal'}
                  icon={<Activity size={22} />}
                  color="var(--accent)"
                />
              </div>
            </>
          )}

          {/* Weight chart + forecast */}
          <div className="dashboard-chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16 }}>Weight Trend</h3>
                <button className="btn-secondary" onClick={() => navigate('/progress')} style={{ fontSize: 12, padding: '6px 14px' }}>Log →</button>
              </div>
              {weightData.length > 1 ? (
                <Line data={chartData} options={chartOpts} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: 'var(--text3)' }}><BarChart3 size={32} /></div>
                  <p>Log your weight to see trends here</p>
                </div>
              )}
            </div>

            <GoalForecastCard forecast={stats?.forecast} habitScore={habitScore} />
          </div>

          {/* Quick actions */}
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text2)' }}>Quick Actions</h3>
            <div className="grid-4 text-white">
              {[
                { label: 'Today\'s Workout', path: '/workout', icon: <Zap size={22} />, color: 'var(--accent)' },
                { label: 'Diet Plan', path: '/diet', icon: <Leaf size={22} />, color: 'var(--accent2)' },
                { label: 'Daily Check-in', path: '/checkin', icon: <CircleDot size={22} />, color: 'var(--warning)' },
                { label: 'Ask AI Coach', path: '/coach', icon: <Bot size={22} />, color: '#ff6b9d' }
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  textAlign: 'left', width: '100%'
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>{a.icon}</div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <MedicalDisclaimer style={{ marginTop: 32 }} />
    </DashboardLayout>
  );
};

export default Dashboard;
