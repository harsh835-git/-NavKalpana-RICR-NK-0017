import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/Sidebar';
import { RefreshCw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
);

const PALETTE = [
  'rgba(0,232,122,0.75)', 'rgba(0,196,255,0.75)',
  'rgba(255,179,64,0.75)', 'rgba(255,68,102,0.75)',
  'rgba(144,144,176,0.6)', 'rgba(180,100,255,0.75)'
];

const LABELS = {
  goals: { weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain', recomposition: 'Recomposition', maintain: 'Maintain', endurance: 'Endurance' },
  activityLevels: { sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate', active: 'Active', very_active: 'Very Active' },
  experienceLevels: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
  workoutTypes: { home: 'Home', gym: 'Gym' },
  dietPreferences: { vegetarian: 'Vegetarian', eggetarian: 'Eggetarian', non_vegetarian: 'Non-Vegetarian' },
  genderSplit: { male: 'Male', female: 'Female' }
};

const buildDoughnut = (data, key) => {
  const labelMap = LABELS[key] || {};
  const keys = Object.keys(data);
  const values = Object.values(data);
  return {
    labels: keys.map(k => labelMap[k] || k),
    datasets: [{
      data: values,
      backgroundColor: PALETTE.slice(0, keys.length),
      borderWidth: 0,
      hoverOffset: 8
    }]
  };
};

const buildBar = (data, key) => {
  const labelMap = LABELS[key] || {};
  const keys = Object.keys(data);
  return {
    labels: keys.map(k => labelMap[k] || k),
    datasets: [{
      label: 'Users',
      data: Object.values(data),
      backgroundColor: PALETTE.slice(0, keys.length),
      borderRadius: 8,
      borderSkipped: false
    }]
  };
};

const doughnutOptions = {
  responsive: true,
  cutout: '60%',
  plugins: {
    legend: { position: 'right', labels: { color: 'var(--text2)', font: { size: 12 }, padding: 14, boxWidth: 14 } }
  }
};

const barOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: 'var(--text3)', font: { size: 11 } }, grid: { display: false } },
    y: { ticks: { color: 'var(--text3)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
};

const ChartCard = ({ title, subtitle, children }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Analytics = () => {
  const [dist, setDist] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [reg7, setReg7] = useState(null);
  const [reg30, setReg30] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, b, r7, r30] = await Promise.all([
        axios.get('/api/admin/analytics/distributions'),
        axios.get('/api/admin/analytics/bmi-stats'),
        axios.get('/api/admin/analytics/registrations?days=7'),
        axios.get('/api/admin/analytics/registrations?days=30')
      ]);
      setDist(d.data);
      setBmi(b.data);
      setReg7(r7.data);
      setReg30(r30.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const reg30Chart = reg30 ? {
    labels: reg30.labels,
    datasets: [{
      label: 'New Users',
      data: reg30.data,
      borderColor: 'rgba(0, 232, 122, 0.8)',
      backgroundColor: 'rgba(0, 232, 122, 0.08)',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: 'rgba(0, 232, 122, 0.9)',
      fill: true,
      tension: 0.4
    }]
  } : null;

  const reg7Chart = reg7 ? {
    labels: reg7.labels,
    datasets: [{
      label: 'New Users',
      data: reg7.data,
      backgroundColor: PALETTE[1],
      borderRadius: 8
    }]
  } : null;

  const bmiChart = bmi ? {
    labels: Object.keys(bmi),
    datasets: [{
      data: Object.values(bmi),
      backgroundColor: ['rgba(0,196,255,0.75)', 'rgba(0,232,122,0.75)', 'rgba(255,179,64,0.75)', 'rgba(255,68,102,0.75)'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  } : null;

  if (loading) return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div style={{ padding: 36 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
              Platform <span className="gradient-text">Analytics</span>
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              Detailed breakdowns of user behavior and demographics
            </p>
          </div>
          <button
            onClick={fetchAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Registration trends */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          <ChartCard title="Registration Trend" subtitle="30-day rolling new user sign-ups">
            {reg30Chart
              ? <Line data={reg30Chart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: 'var(--text3)', font: { size: 11 } }, grid: { display: false } }, y: { ticks: { color: 'var(--text3)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } } } }} />
              : <EmptyChart />
            }
          </ChartCard>

          <ChartCard title="Last 7 Days" subtitle="Daily new registrations this week">
            {reg7Chart
              ? <Bar data={reg7Chart} options={barOptions} />
              : <EmptyChart />
            }
          </ChartCard>
        </div>

        {/* User distribution charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <ChartCard title="Fitness Goals" subtitle="Distribution across active users">
            {dist?.goals && Object.keys(dist.goals).length > 0
              ? <Doughnut data={buildDoughnut(dist.goals, 'goals')} options={doughnutOptions} />
              : <EmptyChart />
            }
          </ChartCard>

          <ChartCard title="Activity Levels" subtitle="Self-reported lifestyle activity">
            {dist?.activityLevels && Object.keys(dist.activityLevels).length > 0
              ? <Bar data={buildBar(dist.activityLevels, 'activityLevels')} options={barOptions} />
              : <EmptyChart />
            }
          </ChartCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
          <ChartCard title="Experience Levels" subtitle="User fitness background">
            {dist?.experienceLevels && Object.keys(dist.experienceLevels).length > 0
              ? <Doughnut data={buildDoughnut(dist.experienceLevels, 'experienceLevels')} options={{ ...doughnutOptions, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text2)', font: { size: 11 }, padding: 10, boxWidth: 12 } } } }} />
              : <EmptyChart />
            }
          </ChartCard>

          <ChartCard title="Workout Types" subtitle="Home vs Gym preference">
            {dist?.workoutTypes && Object.keys(dist.workoutTypes).length > 0
              ? <Doughnut data={buildDoughnut(dist.workoutTypes, 'workoutTypes')} options={{ ...doughnutOptions, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text2)', font: { size: 11 }, padding: 10, boxWidth: 12 } } } }} />
              : <EmptyChart />
            }
          </ChartCard>

          <ChartCard title="Gender Split" subtitle="Male vs Female users">
            {dist?.genderSplit && Object.keys(dist.genderSplit).length > 0
              ? <Doughnut data={buildDoughnut(dist.genderSplit, 'genderSplit')} options={{ ...doughnutOptions, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text2)', font: { size: 11 }, padding: 10, boxWidth: 12 } } } }} />
              : <EmptyChart />
            }
          </ChartCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <ChartCard title="Diet Preferences" subtitle="User dietary choices">
            {dist?.dietPreferences && Object.keys(dist.dietPreferences).length > 0
              ? <Bar data={buildBar(dist.dietPreferences, 'dietPreferences')} options={barOptions} />
              : <EmptyChart />
            }
          </ChartCard>

          <ChartCard title="BMI Distribution" subtitle="Body mass index categories across users">
            {bmiChart && Object.values(bmi).some(v => v > 0)
              ? <Doughnut data={bmiChart} options={{ ...doughnutOptions, plugins: { legend: { position: 'right', labels: { color: 'var(--text2)', font: { size: 12 }, padding: 14, boxWidth: 14 } } } }} />
              : <EmptyChart label="No BMI data available yet" />
            }
          </ChartCard>
        </div>
      </div>
    </AdminLayout>
  );
};

const EmptyChart = ({ label = 'No data available yet' }) => (
  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
    {label}
  </div>
);

export default Analytics;
