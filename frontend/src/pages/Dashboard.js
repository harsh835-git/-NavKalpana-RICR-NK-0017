import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import { Gauge, BarChart3, Zap, Flame, Leaf, CircleDot, Bot, AlertTriangle } from '../components/Icons';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [habitScore, setHabitScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/progress/stats'),
      axios.get('/api/habit/score')
    ]).then(([pRes, hRes]) => {
      setStats(pRes.data);
      setHabitScore(hRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

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
              Consider a lighter plan or schedule reset.
            </div>
          </div>
          <button className="btn-secondary dropoff-action-btn" onClick={() => navigate('/progress')} style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontSize: 13 }}>View Progress</button>
        </div>
      )}

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

            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 20 }}>Goal Forecast</h3>
              {stats?.forecast ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Current</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>{stats.forecast.currentWeight} kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Goal</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }} className="gradient-text">{stats.forecast.goalWeight} kg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Est. Time</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{stats.forecast.weeksToGoal} weeks</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>≈ {new Date(stats.forecast.estimatedDate).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Avg weekly change</div>
                    <div style={{ color: stats.forecast.avgWeeklyChange < 0 ? 'var(--accent)' : 'var(--warning)', fontWeight: 600 }}>
                      {stats.forecast.avgWeeklyChange > 0 ? '+' : ''}{stats.forecast.avgWeeklyChange} kg/week
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text2)', padding: '30px 0' }}>
                  <p style={{ fontSize: 14 }}>Log at least 2 weight entries to see your forecast</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--text2)' }}>Quick Actions</h3>
            <div className="grid-4">
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
    </DashboardLayout>
  );
};

export default Dashboard;
