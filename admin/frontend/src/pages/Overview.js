import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/Sidebar';
import {
  Users, UserCheck, Activity, MessageCircle,
  TrendingUp, Ruler, Calendar, ClipboardList,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  plugins: { legend: { labels: { color: 'var(--text2)', font: { family: 'Inter', size: 12 } } } },
  scales: {
    x: { ticks: { color: 'var(--text3)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: 'var(--text3)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
};

const GOAL_LABELS = {
  weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
  recomposition: 'Recomposition', maintain: 'Maintain', endurance: 'Endurance'
};

const StatCard = ({ icon, label, value, sub, color = 'var(--accent)', trend }) => (
  <div className="card fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color
      }}>
        {icon}
      </div>
      {trend !== undefined && (
        <span style={{
          fontSize: 12, fontWeight: 600, padding: '4px 10px',
          borderRadius: 50, background: trend >= 0 ? 'var(--accent-glow)' : 'rgba(255,68,102,0.12)',
          color: trend >= 0 ? 'var(--accent)' : 'var(--danger)'
        }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <div className="stat-card-value" style={{ color }}>{value ?? <span className="spinner" style={{ width: 24, height: 24 }} />}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>}
    </div>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [regData, setRegData] = useState(null);
  const [distData, setDistData] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, r, d, ra] = await Promise.all([
          axios.get('/api/admin/analytics/overview'),
          axios.get('/api/admin/analytics/registrations?days=14'),
          axios.get('/api/admin/analytics/distributions'),
          axios.get('/api/admin/analytics/recent-activity')
        ]);
        setStats(s.data);
        setRegData(r.data);
        setDistData(d.data);
        setRecentUsers(ra.data);
      } catch (err) {
        console.error('Overview fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const registrationChart = regData ? {
    labels: regData.labels,
    datasets: [{
      label: 'New Registrations',
      data: regData.data,
      backgroundColor: 'rgba(0, 232, 122, 0.18)',
      borderColor: 'rgba(0, 232, 122, 0.8)',
      borderWidth: 2,
      borderRadius: 6,
    }]
  } : null;

  const goalChart = distData?.goals ? {
    labels: Object.keys(distData.goals).map(k => GOAL_LABELS[k] || k),
    datasets: [{
      data: Object.values(distData.goals),
      backgroundColor: [
        'rgba(0,232,122,0.75)', 'rgba(0,196,255,0.75)',
        'rgba(255,179,64,0.75)', 'rgba(255,68,102,0.75)', 'rgba(144,144,176,0.5)'
      ],
      borderWidth: 0,
      hoverOffset: 8
    }]
  } : null;

  const profileRate = stats ? Math.round((stats.profileCompleteUsers / Math.max(stats.totalUsers, 1)) * 100) : 0;
  const verifyRate = stats ? Math.round((stats.verifiedUsers / Math.max(stats.totalUsers, 1)) * 100) : 0;

  return (
    <AdminLayout>
      <div style={{ padding: 36 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Platform <span className="gradient-text">Overview</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            Real-time snapshot of FitAI platform activity and user metrics
          </p>
        </div>

        {/* Stat grid */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <StatCard icon={<Users size={20} />} label="Total Users" value={stats?.totalUsers} sub="All registered accounts" />
          <StatCard icon={<UserCheck size={20} />} label="Verified Users" value={stats?.verifiedUsers} sub={`${verifyRate}% verification rate`} color="var(--accent2)" />
          <StatCard icon={<CheckCircle2 size={20} />} label="Profiles Complete" value={stats?.profileCompleteUsers} sub={`${profileRate}% completion rate`} color="var(--warning)" />
          <StatCard icon={<MessageCircle size={20} />} label="AI Chat Sessions" value={stats?.totalChats} sub="Total conversations" color="var(--danger)" />
        </div>

        <div className="grid-4" style={{ marginBottom: 36 }}>
          <StatCard icon={<TrendingUp size={20} />} label="Progress Logs" value={stats?.totalProgress} sub="Weight & fitness entries" />
          <StatCard icon={<Ruler size={20} />} label="Measurements" value={stats?.totalMeasurements} sub="Body measurement records" color="var(--accent2)" />
          <StatCard icon={<Activity size={20} />} label="Daily Check-ins" value={stats?.totalCheckins} sub="Energy level records" color="var(--warning)" />
          <StatCard icon={<ClipboardList size={20} />} label="Profile Setup Rate" value={stats ? `${profileRate}%` : null} sub={`${stats?.profileCompleteUsers ?? 0} of ${stats?.totalUsers ?? 0} users`} color="var(--danger)" />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 28 }}>
          {/* Registration chart */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>User Registrations</h3>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>Last 14 days</p>
              </div>
              <span className="badge badge-green"><Calendar size={11} /> Daily</span>
            </div>
            {registrationChart ? (
              <Bar data={registrationChart} options={{ ...chartDefaults, responsive: true, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} height={80} />
            ) : (
              <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, marginBottom: 28 }}>
          {/* Recent users */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Recent Registrations</h3>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><div className="spinner" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentUsers.map((u, i) => (
                  <div key={u._id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', background: 'var(--bg3)',
                    borderRadius: 10, animation: `fadeUp 0.${3 + i}s ease forwards`
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff',
                      flexShrink: 0
                    }}>
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.email}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className={`badge ${u.isVerified ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 24, fontSize: 14 }}>
                    No users yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Goal distribution doughnut */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Goal Distribution</h3>
            {goalChart ? (
              <Doughnut
                data={goalChart}
                options={{
                  responsive: true,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: 'var(--text2)', font: { size: 11 }, padding: 14, boxWidth: 12 }
                    }
                  }
                }}
              />
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading
                  ? <div className="spinner" style={{ width: 28, height: 28 }} />
                  : <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
                      <AlertCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                      <div>No profile data yet</div>
                    </div>
                }
              </div>
            )}
          </div>
        </div>

        {/* Completion rates */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Platform Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Email Verification Rate', value: verifyRate, color: 'var(--accent)', count: stats?.verifiedUsers, total: stats?.totalUsers },
              { label: 'Profile Completion Rate', value: profileRate, color: 'var(--accent2)', count: stats?.profileCompleteUsers, total: stats?.totalUsers }
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                  {item.count ?? 0} of {item.total ?? 0} users
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Overview;
