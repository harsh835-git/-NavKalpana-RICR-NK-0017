import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { NavIcons, GoalIcons, Sun, Moon, LogOut, ChevronLeft, ChevronRight, Menu, Check } from '../components/Icons';

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',      icon: NavIcons.dashboard },
  { path: '/workout',      label: 'Workout Plan',   icon: NavIcons.workout },
  { path: '/diet',         label: 'Diet Plan',      icon: NavIcons.diet },
  { path: '/progress',     label: 'Progress',       icon: NavIcons.progress },
  { path: '/measurements', label: 'Measurements',   icon: NavIcons.measurements },
  { path: '/checkin',      label: 'Daily Check-in', icon: NavIcons.checkin },
  { path: '/coach',        label: 'AI Coach',       icon: NavIcons.coach },
];

const GOALS = [
  { value: 'weight_loss',    label: 'Weight Loss',          icon: GoalIcons.weight_loss },
  { value: 'muscle_gain',    label: 'Muscle Gain',          icon: GoalIcons.muscle_gain },
  { value: 'recomposition',  label: 'Body Recomposition',   icon: GoalIcons.recomposition },
  { value: 'maintain',       label: 'Maintain',             icon: GoalIcons.maintain },
  { value: 'endurance',      label: 'Improve Endurance',    icon: GoalIcons.endurance },
];

const getGoal = (user) => {
  const raw = user?.profile?.goal || user?.goal;
  return GOALS.find(g => g.value === raw) || null;
};

const Sidebar = ({ onCollapse, mobileOpen, onMobileToggle }) => {
  const { user, refreshUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast, ToastComponent } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef(null);

  const currentGoal = getGoal(user);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setGoalOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  };

  const changeGoal = async (goal) => {
    if (goal === currentGoal?.value || saving) return;
    setSaving(true);
    try {
      await axios.patch('/api/profile/goal', { goal });
      await refreshUser();
      setGoalOpen(false);
      const newGoal = GOALS.find(g => g.value === goal);
      showToast(`Goal updated to ${newGoal?.label}. Workout & Diet plans refreshed.`);
    } catch (err) {
      showToast('Failed to update goal. Please try again.', 'error');
      console.error('Goal update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const nav = (path) => {
    navigate(path);
    onMobileToggle?.(false);
  };

  return (
    <>
    {ToastComponent}
    {mobileOpen && (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onMobileToggle?.(false)}
        onKeyDown={e => e.key === 'Escape' && onMobileToggle?.(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99,
          display: 'block'
        }}
        className="sidebar-overlay"
        aria-label="Close menu"
      />
    )}
    <aside style={{
      width: collapsed ? 72 : 248,
      minHeight: '100vh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 10px',
      transition: 'width 0.3s ease, transform 0.3s ease',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      overflow: 'hidden',
      transform: mobileOpen ? 'translateX(0)' : undefined
    }}
    className="sidebar-aside"
    data-open={mobileOpen}
    data-collapsed={collapsed}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 28 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#fff'
        }}>F</div>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, whiteSpace: 'nowrap' }}
            className="gradient-text">FitAI</span>
        )}
      </div>

      {/* Goal card with change picker */}
      {!collapsed && (
        <div ref={dropdownRef} style={{ marginBottom: 22, position: 'relative' }}>
          <button
            onClick={() => setGoalOpen(o => !o)}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'var(--surface)', borderRadius: 12,
              border: `1px solid ${goalOpen ? 'rgba(0,232,122,0.35)' : 'var(--border)'}`,
              cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
              display: 'flex', flexDirection: 'column', gap: 4
            }}
            onMouseEnter={e => { if (!goalOpen) e.currentTarget.style.borderColor = 'var(--border2)'; }}
            onMouseLeave={e => { if (!goalOpen) e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Current Goal</span>
              <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {goalOpen ? '▲ close' : '▼ change'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {currentGoal ? (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)' }}>{currentGoal.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentGoal.label}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>No goal set</span>
              )}
            </div>
          </button>

          {/* Dropdown */}
          {goalOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 12, padding: '6px', zIndex: 200,
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeUp 0.18s ease forwards'
            }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', padding: '4px 10px 8px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                Select a new goal
              </div>
              {GOALS.map(g => {
                const isActive = g.value === currentGoal?.value;
                return (
                  <button
                    key={g.value}
                    onClick={() => changeGoal(g.value)}
                    disabled={saving}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8, cursor: isActive ? 'default' : 'pointer',
                      background: isActive ? 'var(--accent-glow)' : 'transparent',
                      border: isActive ? '1px solid rgba(0,232,122,0.25)' : '1px solid transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      transition: 'var(--transition)', textAlign: 'left',
                      opacity: saving && !isActive ? 0.5 : 1
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'var(--accent)' }}>{g.icon}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.label}</span>
                    {isActive && <span style={{ marginLeft: 'auto', display: 'flex', flexShrink: 0 }}><Check size={14} /></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Collapsed goal icon */}
      {collapsed && currentGoal && (
        <div title={currentGoal.label} style={{
          width: 38, height: 38, borderRadius: 10, background: 'var(--surface)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 16, alignSelf: 'center', color: 'var(--accent)'
        }}>
          {currentGoal.icon}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path}
              onClick={() => nav(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 0' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                background: active ? 'var(--accent-glow)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text2)',
                border: active ? '1px solid rgba(0,232,122,0.22)' : '1px solid transparent',
                width: '100%', textAlign: 'left', cursor: 'pointer',
                transition: 'var(--transition)', whiteSpace: 'nowrap',
                fontWeight: active ? 600 : 400, fontSize: 14
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent'; }}}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '10px 0' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, background: 'transparent',
            color: 'var(--text2)', border: '1px solid transparent',
            width: '100%', cursor: 'pointer', fontSize: 14,
            transition: 'var(--transition)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</span>
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Collapse toggle */}
        <button className="sidebar-collapse-btn" onClick={handleCollapse} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '10px 0' : '10px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10, background: 'transparent', color: 'var(--text3)',
          border: '1px solid transparent', width: '100%', cursor: 'pointer',
          fontSize: 14, transition: 'var(--transition)'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Logout */}
        <button onClick={() => { logout(); nav('/'); }} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '10px 0' : '10px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10, background: 'transparent', color: 'var(--danger)',
          border: '1px solid transparent', width: '100%', cursor: 'pointer',
          fontSize: 14, transition: 'var(--transition)'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,102,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center' }}><LogOut size={17} /></span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

export const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} data-collapsed={collapsed}>
      <Sidebar onCollapse={setCollapsed} mobileOpen={mobileOpen} onMobileToggle={setMobileOpen} />
      <main className="main-content" style={{
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg)',
        transition: 'margin-left 0.3s ease'
      }}>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{
            position: 'fixed', top: 16, left: 16, zIndex: 90,
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text)', cursor: 'pointer'
          }}
        >
          <Menu size={22} />
        </button>
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
