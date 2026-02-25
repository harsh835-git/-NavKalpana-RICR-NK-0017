import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Users, BarChart3, Database,
  Sun, Moon, LogOut, ChevronLeft, ChevronRight, Menu, ShieldCheck
} from 'lucide-react';

const navItems = [
  { path: '/overview',    label: 'Overview',      icon: <LayoutDashboard size={18} /> },
  { path: '/users',       label: 'User Management', icon: <Users size={18} /> },
  { path: '/analytics',  label: 'Analytics',     icon: <BarChart3 size={18} /> },
  { path: '/static-data', label: 'Static Data',   icon: <Database size={18} /> },
];

const Sidebar = ({ onCollapse, mobileOpen, onMobileToggle }) => {
  const { logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  };

  const nav = (path) => {
    navigate(path);
    onMobileToggle?.(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onMobileToggle?.(false)}
          onKeyDown={e => e.key === 'Escape' && onMobileToggle?.(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          className="sidebar-overlay"
          aria-label="Close menu"
        />
      )}
      <aside
        style={{
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
        data-collapsed={collapsed}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 28 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#fff'
          }}>F</div>
          {!collapsed && (
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, whiteSpace: 'nowrap' }}
                className="gradient-text">FitAI</span>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.2 }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Admin badge */}
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', marginBottom: 20,
            background: 'rgba(0, 232, 122, 0.06)',
            border: '1px solid rgba(0,232,122,0.18)',
            borderRadius: 10
          }}>
            <ShieldCheck size={15} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Administrator</span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
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
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 0' : '10px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10, background: 'transparent',
              color: 'var(--text2)', border: '1px solid transparent',
              width: '100%', cursor: 'pointer', fontSize: 14, transition: 'var(--transition)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </span>
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button
            className="sidebar-collapse-btn"
            onClick={handleCollapse}
            style={{
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
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </span>
            {!collapsed && <span>Collapse</span>}
          </button>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
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

export const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} data-collapsed={collapsed}>
      <Sidebar onCollapse={setCollapsed} mobileOpen={mobileOpen} onMobileToggle={setMobileOpen} />
      <main className="main-content" style={{ flex: 1, minHeight: '100vh', background: 'var(--bg)', transition: 'margin-left 0.3s ease' }}>
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
