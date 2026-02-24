import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import { useToast } from '../hooks/useToast';

const bodyParts = ['waist', 'chest', 'hips', 'arms', 'thighs'];

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState({ waist: '', chest: '', hips: '', arms: '', thighs: '' });
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState('waist');
  const { showToast, ToastComponent } = useToast();

  const fetchData = async () => {
    const res = await axios.get('/api/measurements');
    setMeasurements(res.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/measurements/log', form);
      showToast('Measurements saved!');
      setForm({ waist: '', chest: '', hips: '', arms: '', thighs: '' });
      fetchData();
    } catch (err) {
      showToast('Error saving', 'error');
    } finally { setLoading(false); }
  };

  const reversed = [...measurements].reverse();

  const chartData = {
    labels: reversed.map(m => new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: `${activeMetric} (cm)`,
      data: reversed.map(m => m[activeMetric]).filter(Boolean),
      fill: true,
      borderColor: '#00c4ff',
      backgroundColor: 'rgba(0,196,255,0.06)',
      tension: 0.4,
      pointBackgroundColor: '#00c4ff',
      pointRadius: 5
    }]
  };

  const latest = measurements[0];
  const first = measurements[measurements.length - 1];

  return (
    <DashboardLayout>
      {ToastComponent}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Body Measurements</h1>
        <p style={{ color: 'var(--text2)' }}>Track body composition beyond the scale</p>
      </div>

      <div className="measurements-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Form */}
        <div className="card measurements-form-card" style={{ alignSelf: 'start', position: 'sticky', top: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Log Measurements</h3>
          <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bodyParts.map(part => (
              <div key={part}>
                <label className="label">{part.charAt(0).toUpperCase() + part.slice(1)} (cm)</label>
                <input className="input-field" type="number" step="0.1" placeholder="e.g. 80"
                  value={form[part]} onChange={e => setForm(f => ({...f, [part]: e.target.value}))} />
              </div>
            ))}
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? <><div className="spinner" />Saving...</> : 'Save Measurements'}
            </button>
          </form>
        </div>

        {/* Stats & charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Changes since start */}
          {latest && first && latest._id !== first._id && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Changes Since Start</h3>
              <div className="grid-3">
                {bodyParts.map(part => {
                  const latestVal = latest[part];
                  const firstVal = first[part];
                  if (!latestVal || !firstVal) return null;
                  const diff = (latestVal - firstVal).toFixed(1);
                  const isGood = parseFloat(diff) <= 0;
                  return (
                    <div key={part} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg3)', borderRadius: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{part}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>{latestVal}</div>
                      <div style={{ fontSize: 13, color: isGood ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
                        {diff > 0 ? '+' : ''}{diff} cm
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="card">
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {bodyParts.map(part => (
                <button key={part} onClick={() => setActiveMetric(part)} style={{
                  padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  background: activeMetric === part ? 'rgba(0,196,255,0.12)' : 'var(--surface)',
                  border: `1px solid ${activeMetric === part ? 'rgba(0,196,255,0.4)' : 'var(--border)'}`,
                  color: activeMetric === part ? 'var(--accent2)' : 'var(--text2)',
                  transition: 'var(--transition)', textTransform: 'capitalize'
                }}>{part}</button>
              ))}
            </div>
            {reversed.filter(m => m[activeMetric]).length > 1 ? (
              <Line data={chartData} options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a72', font: { size: 11 } } },
                  y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5a5a72', callback: v => `${v}cm` } }
                }
              }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
                Log at least 2 entries to see the {activeMetric} trend
              </div>
            )}
          </div>

          {/* Log history */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Measurement History</h3>
            {measurements.length === 0 ? (
              <p style={{ color: 'var(--text2)', textAlign: 'center', padding: '20px 0' }}>No measurements logged yet</p>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: 320, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>Date</th>
                      {bodyParts.map(p => <th key={p} style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>{p}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.slice(0, 8).map((m, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{new Date(m.date).toLocaleDateString()}</td>
                        {bodyParts.map(p => <td key={p} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: m[p] ? 500 : 300 }}>{m[p] ? `${m[p]}cm` : '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Measurements;
