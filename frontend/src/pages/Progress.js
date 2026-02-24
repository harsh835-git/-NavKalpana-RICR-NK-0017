import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/Sidebar';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from 'chart.js';
import { useToast } from '../hooks/useToast';
import { StatusIcons } from '../components/Icons';

ChartJS.register(LineElement, BarElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

const Progress = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ weight: '', workoutCompletion: '', dietAdherence: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { showToast, ToastComponent } = useToast();

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        axios.get('/api/progress'),
        axios.get('/api/progress/stats')
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setDataLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/progress/log', form);
      showToast('Progress logged!');
      setForm({ weight: '', workoutCompletion: '', dietAdherence: '', notes: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving', 'error');
    } finally { setLoading(false); }
  };

  const weightData = stats?.weightLogs || [];
  const weightChartData = {
    labels: weightData.slice(-12).map(w => new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Weight (kg)',
      data: weightData.slice(-12).map(w => w.weight),
      fill: true,
      borderColor: '#00e87a',
      backgroundColor: 'rgba(0,232,122,0.06)',
      tension: 0.4,
      pointBackgroundColor: '#00e87a',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a72', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a72' } }
    }
  };

  const SelectOpt = ({ value, label, field, current }) => (
    <button type="button" onClick={() => setForm(f => ({...f, [field]: value}))} style={{
      padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
      background: current === value ? 'rgba(0,232,122,0.12)' : 'var(--bg3)',
      border: `1px solid ${current === value ? 'rgba(0,232,122,0.4)' : 'var(--border2)'}`,
      color: current === value ? 'var(--accent)' : 'var(--text)', transition: 'var(--transition)'
    }}>{label}</button>
  );

  return (
    <DashboardLayout>
      {ToastComponent}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Progress Tracking</h1>
        <p style={{ color: 'var(--text2)' }}>Log your weekly progress to track transformation</p>
      </div>

      <div className="progress-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
        {/* Log form */}
        <div className="card progress-form-card" style={{ position: 'sticky', top: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Log Today</h3>
          <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Weight (kg)</label>
              <input className="input-field" type="number" step="0.1" placeholder="74.5"
                value={form.weight} onChange={e => setForm(f => ({...f, weight: e.target.value}))} />
            </div>
            <div>
              <label className="label">Workout</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SelectOpt value="completed" label={<><span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>{StatusIcons.completed}</span>Completed</>} field="workoutCompletion" current={form.workoutCompletion} />
                <SelectOpt value="partial" label={<><span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>{StatusIcons.partial}</span>Partial</>} field="workoutCompletion" current={form.workoutCompletion} />
                <SelectOpt value="skipped" label={<><span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>{StatusIcons.skipped}</span>Skipped</>} field="workoutCompletion" current={form.workoutCompletion} />
              </div>
            </div>
            <div>
              <label className="label">Diet</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SelectOpt value="followed" label={<><span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>{StatusIcons.followed}</span>Followed</>} field="dietAdherence" current={form.dietAdherence} />
                <SelectOpt value="mostly" label={<><span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>{StatusIcons.mostly}</span>Mostly</>} field="dietAdherence" current={form.dietAdherence} />
                <SelectOpt value="deviated" label={<><span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>{StatusIcons.deviated}</span>Deviated</>} field="dietAdherence" current={form.dietAdherence} />
              </div>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input-field" placeholder="How did it feel?" rows={3}
                value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? <><div className="spinner" />Saving...</> : 'Log Progress'}
            </button>
          </form>
        </div>

        {/* Charts & history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Habit scores */}
          {stats?.stats && (
            <div className="grid-3">
              {[
                { label: 'Habit Score', value: stats.stats.habitScore, color: 'var(--accent)' },
                { label: 'Workout Adh.', value: `${stats.stats.workoutAdherence}%`, color: 'var(--accent2)' },
                { label: 'Diet Adh.', value: `${stats.stats.dietAdherence}%`, color: '#ff6b9d' }
              ].map(s => (
                <div key={s.label} className="card">
                  <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${typeof s.value === 'string' ? parseInt(s.value) : s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weight chart */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>Weight Trend</h3>
            {weightData.length > 1 ? (
              <Line data={weightChartData} options={chartOpts} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
                Log at least 2 entries to see your weight trend
              </div>
            )}
          </div>

          {/* Log history */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Logs</h3>
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text2)', textAlign: 'center', padding: '24px 0' }}>No logs yet. Start logging!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {logs.slice(0, 10).map((log, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10,
                    flexWrap: 'wrap', gap: 8
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>
                      {new Date(log.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {log.weight && <span style={{ fontWeight: 600 }}>{log.weight} kg</span>}
                    {log.workoutCompletion && (
                      <span className={`badge ${log.workoutCompletion === 'completed' ? 'badge-green' : log.workoutCompletion === 'partial' ? 'badge-orange' : 'badge-red'}`}>
                        {log.workoutCompletion}
                      </span>
                    )}
                    {log.dietAdherence && (
                      <span className={`badge ${log.dietAdherence === 'followed' ? 'badge-green' : log.dietAdherence === 'mostly' ? 'badge-orange' : 'badge-red'}`}>
                        {log.dietAdherence}
                      </span>
                    )}
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

export default Progress;
