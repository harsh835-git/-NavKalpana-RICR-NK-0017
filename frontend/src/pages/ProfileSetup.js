import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Flame, Dumbbell, Scale, Target, Activity, Check, Home, Egg, Leaf, Utensils } from '../components/Icons';

const steps = [
  { id: 'basic',       title: 'Basic Info',     subtitle: 'Tell us about yourself' },
  { id: 'fitness',     title: 'Fitness Level',  subtitle: 'Your current state' },
  { id: 'goal',        title: 'Your Goal',      subtitle: 'What do you want to achieve?' },
  { id: 'preferences', title: 'Preferences',    subtitle: 'Customize your plan' }
];

const ProfileSetup = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    age: '', sex: '', height: '', currentWeight: '', goalWeight: '',
    activityLevel: '', experienceLevel: '', goal: '',
    workoutType: '', dietPreference: ''
  });
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('/api/profile/setup', {
        ...form,
        age: +form.age, height: +form.height,
        currentWeight: +form.currentWeight, goalWeight: +form.goalWeight
      });
      await refreshUser();
      showToast('Profile complete! Let\'s go!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const SelectBtn = ({ value, label, field, current }) => (
    <button type="button" onClick={() => update(field, value)} style={{
      padding: '12px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 500,
      background: current === value ? 'rgba(0,232,122,0.12)' : 'var(--bg3)',
      border: `1px solid ${current === value ? 'rgba(0,232,122,0.4)' : 'var(--border2)'}`,
      color: current === value ? 'var(--accent)' : 'var(--text)',
      transition: 'var(--transition)', fontSize: 14
    }}>{label}</button>
  );

  const PreferenceCard = ({ value, label, description, icon, field, current }) => (
    <button type="button" onClick={() => update(field, value)} style={{
      padding: '18px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%',
      background: current === value ? 'rgba(0,232,122,0.08)' : 'var(--bg3)',
      border: `1.5px solid ${current === value ? 'rgba(0,232,122,0.4)' : 'var(--border2)'}`,
      color: 'var(--text)', transition: 'var(--transition)', display: 'flex', alignItems: 'center', gap: 14
    }}>
      <span style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 12,
        background: current === value ? 'rgba(0,232,122,0.15)' : 'var(--surface)',
        border: `1px solid ${current === value ? 'rgba(0,232,122,0.3)' : 'var(--border)'}`,
        color: current === value ? 'var(--accent)' : 'var(--text2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'var(--transition)'
      }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{description}</div>
      </div>
      {current === value && (
        <span style={{ marginLeft: 'auto', color: 'var(--accent)', flexShrink: 0 }}>
          <Check size={18} strokeWidth={3} />
        </span>
      )}
    </button>
  );

  const LAST_STEP = steps.length - 1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {ToastComponent}
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, marginBottom: 8 }}>FitAI</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Set up your profile</h1>
          <p style={{ color: 'var(--text2)' }}>We'll calculate your personalized plan</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i <= step ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface)',
                border: `1px solid ${i <= step ? 'transparent' : 'var(--border2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: i <= step ? '#000' : 'var(--text3)',
                transition: 'var(--transition)'
              }}>{i < step ? <Check size={14} strokeWidth={3} /> : i + 1}</div>
              {i < LAST_STEP && (
                <div style={{ width: 32, height: 1, background: i < step ? 'var(--accent)' : 'var(--border2)', transition: 'background 0.4s' }} />
              )}
            </div>
          ))}
        </div>

        <div className="card profile-setup-card" style={{ borderRadius: 20, padding: 32 }}>
          <h2 style={{ marginBottom: 4 }}>{steps[step].title}</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 14 }}>{steps[step].subtitle}</p>

          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="grid-2">
                <div>
                  <label className="label">Age</label>
                  <input className="input-field" type="number" placeholder="25" value={form.age} onChange={e => update('age', e.target.value)} />
                </div>
                <div>
                  <label className="label">Height (cm)</label>
                  <input className="input-field" type="number" placeholder="175" value={form.height} onChange={e => update('height', e.target.value)} />
                </div>
                <div>
                  <label className="label">Current Weight (kg)</label>
                  <input className="input-field" type="number" placeholder="75" value={form.currentWeight} onChange={e => update('currentWeight', e.target.value)} />
                </div>
                <div>
                  <label className="label">Goal Weight (kg)</label>
                  <input className="input-field" type="number" placeholder="68" value={form.goalWeight} onChange={e => update('goalWeight', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Biological Sex</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <SelectBtn value="male" label="Male" field="sex" current={form.sex} />
                  <SelectBtn value="female" label="Female" field="sex" current={form.sex} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Fitness Level */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label className="label">Activity Level</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { v: 'sedentary',  l: 'Sedentary — Little to no exercise' },
                    { v: 'light',      l: 'Lightly Active — 1-3 days/week' },
                    { v: 'moderate',   l: 'Moderately Active — 3-5 days/week' },
                    { v: 'active',     l: 'Very Active — 6-7 days/week' },
                    { v: 'very_active', l: 'Extra Active — Physical job + exercise' }
                  ].map(o => <SelectBtn key={o.v} value={o.v} label={o.l} field="activityLevel" current={form.activityLevel} />)}
                </div>
              </div>
              <div>
                <label className="label">Experience Level</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { v: 'beginner',     l: 'Beginner (0-1 yr)' },
                    { v: 'intermediate', l: 'Intermediate (1-3 yr)' },
                    { v: 'advanced',     l: 'Advanced (3+ yr)' }
                  ].map(o => <SelectBtn key={o.v} value={o.v} label={o.l} field="experienceLevel" current={form.experienceLevel} />)}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Goal */}
          {step === 2 && (
            <div>
              <label className="label">Primary Goal</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { v: 'weight_loss',   l: 'Weight Loss',          d: 'Caloric deficit + cardio focus',         icon: <Flame size={18} /> },
                  { v: 'muscle_gain',   l: 'Muscle Gain',          d: 'Caloric surplus + progressive overload',  icon: <Dumbbell size={18} /> },
                  { v: 'recomposition', l: 'Body Recomposition',   d: 'Lose fat while building muscle',          icon: <Scale size={18} /> },
                  { v: 'maintain',      l: 'Maintain',             d: 'Keep current physique',                   icon: <Target size={18} /> },
                  { v: 'endurance',     l: 'Improve Endurance',    d: 'Cardio + stamina training',               icon: <Activity size={18} /> }
                ].map(o => (
                  <button key={o.v} type="button" onClick={() => update('goal', o.v)} style={{
                    padding: '14px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    background: form.goal === o.v ? 'rgba(0,232,122,0.08)' : 'var(--bg3)',
                    border: `1px solid ${form.goal === o.v ? 'rgba(0,232,122,0.4)' : 'var(--border2)'}`,
                    color: 'var(--text)', transition: 'var(--transition)', display: 'flex', alignItems: 'flex-start', gap: 12
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', flexShrink: 0 }}>{o.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{o.l}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{o.d}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Preferences */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Workout type */}
              <div>
                <label className="label">Where will you work out?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PreferenceCard
                    field="workoutType" current={form.workoutType}
                    value="home"
                    icon={<Home size={20} />}
                    label="Home Workout"
                    description="Bodyweight & minimal equipment — no gym needed"
                  />
                  <PreferenceCard
                    field="workoutType" current={form.workoutType}
                    value="gym"
                    icon={<Dumbbell size={20} />}
                    label="Gym Workout"
                    description="Full equipment access — barbells, machines, cables"
                  />
                </div>
              </div>

              {/* Diet preference */}
              <div>
                <label className="label">What is your diet preference?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PreferenceCard
                    field="dietPreference" current={form.dietPreference}
                    value="vegetarian"
                    icon={<Leaf size={20} />}
                    label="Vegetarian"
                    description="Plant-based — paneer, tofu, dal, legumes, dairy"
                  />
                  <PreferenceCard
                    field="dietPreference" current={form.dietPreference}
                    value="eggetarian"
                    icon={<Egg size={20} />}
                    label="Eggetarian"
                    description="Eggs + vegetarian — best of both worlds"
                  />
                  <PreferenceCard
                    field="dietPreference" current={form.dietPreference}
                    value="non_vegetarian"
                    icon={<Utensils size={20} />}
                    label="Non-Vegetarian"
                    description="Chicken, fish, eggs & all food groups"
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            {step > 0 && (
              <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>Back</button>
            )}
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => step < LAST_STEP ? setStep(s => s + 1) : handleSubmit()}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" /> Saving...</>
                : step < LAST_STEP ? 'Continue' : 'Complete Setup'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
