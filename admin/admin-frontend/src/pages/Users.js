import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/Sidebar';
import {
  Search, Trash2, Eye, UserCheck, UserX,
  ChevronLeft, ChevronRight, X, User,
  TrendingUp, Ruler, Activity, MessageCircle, AlertTriangle
} from 'lucide-react';

const FILTERS = [
  { value: 'all', label: 'All Users' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'profile_complete', label: 'Profile Complete' },
  { value: 'profile_incomplete', label: 'Profile Incomplete' }
];

const GOAL_LABELS = {
  weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
  recomposition: 'Recomposition', maintain: 'Maintain', endurance: 'Endurance'
};

const UserDetailModal = ({ user, onClose, onVerifyToggle, onDelete }) => {
  const [stats, setStats] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    axios.get(`/api/admin/users/${user._id}/stats`).then(r => setStats(r.data)).catch(() => {});
  }, [user._id]);

  const p = user.profile || {};

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff', flexShrink: 0
            }}>
              {user.name?.[0]?.toUpperCase() || <User size={22} />}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{user.name || 'Unknown'}</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text3)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <span className={`badge ${user.isVerified ? 'badge-green' : 'badge-orange'}`}>
            {user.isVerified ? 'Email Verified' : 'Email Unverified'}
          </span>
          <span className={`badge ${p.profileComplete ? 'badge-blue' : 'badge-gray'}`}>
            {p.profileComplete ? 'Profile Complete' : 'Profile Incomplete'}
          </span>
          {p.goal && <span className="badge badge-green">{GOAL_LABELS[p.goal] || p.goal}</span>}
        </div>

        {/* Profile details */}
        {p.profileComplete && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Profile Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Age', p.age ? `${p.age} yrs` : '—'],
                ['Sex', p.sex || '—'],
                ['Height', p.height ? `${p.height} cm` : '—'],
                ['Current Weight', p.currentWeight ? `${p.currentWeight} kg` : '—'],
                ['Goal Weight', p.goalWeight ? `${p.goalWeight} kg` : '—'],
                ['BMI', p.bmi ? p.bmi.toFixed(1) : '—'],
                ['Activity Level', p.activityLevel?.replace('_', ' ') || '—'],
                ['Experience', p.experienceLevel || '—'],
                ['Workout Type', p.workoutType || '—'],
                ['Diet', p.dietPreference?.replace('_', ' ') || '—'],
                ['Maintenance Cal', p.maintenanceCalories ? `${p.maintenanceCalories} kcal` : '—'],
                ['Target Cal', p.targetCalories ? `${p.targetCalories} kcal` : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity stats */}
        {stats && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Activity Stats</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { icon: <TrendingUp size={14} />, label: 'Progress', val: stats.progressCount, color: 'var(--accent)' },
                { icon: <Ruler size={14} />, label: 'Measure', val: stats.measurementCount, color: 'var(--accent2)' },
                { icon: <Activity size={14} />, label: 'Checkins', val: stats.checkinCount, color: 'var(--warning)' },
                { icon: <MessageCircle size={14} />, label: 'Chats', val: stats.chatCount, color: 'var(--danger)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member since */}
        <div style={{ marginBottom: 24, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13, color: 'var(--text2)' }}>
          Member since: <strong style={{ color: 'var(--text)' }}>{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onVerifyToggle(user._id, user.isVerified)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 10,
              background: user.isVerified ? 'rgba(255,179,64,0.1)' : 'var(--accent-glow)',
              border: `1px solid ${user.isVerified ? 'rgba(255,179,64,0.3)' : 'rgba(0,232,122,0.3)'}`,
              color: user.isVerified ? 'var(--warning)' : 'var(--accent)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}
          >
            {user.isVerified ? <UserX size={15} /> : <UserCheck size={15} />}
            {user.isVerified ? 'Mark Unverified' : 'Mark Verified'}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', borderRadius: 10,
                background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.3)',
                color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Trash2 size={15} /> Delete User
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,68,102,0.1)', borderRadius: 10, padding: '6px 12px', border: '1px solid rgba(255,68,102,0.3)' }}>
              <AlertTriangle size={14} color="var(--danger)" />
              <span style={{ fontSize: 12, color: 'var(--danger)' }}>Confirm delete?</span>
              <button onClick={() => onDelete(user._id)} style={{ background: 'var(--danger)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Yes</button>
              <button onClick={() => setConfirmDelete(false)} style={{ background: 'var(--surface2)', color: 'var(--text2)', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/users?page=${page}&limit=15&search=${search}&filter=${filter}`);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);

  const handleVerifyToggle = async (userId, currentState) => {
    try {
      const { data } = await axios.patch(`/api/admin/users/${userId}/verify`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: data.isVerified } : u));
      if (selectedUser?._id === userId) setSelectedUser(prev => ({ ...prev, isVerified: data.isVerified }));
      showToast(data.message);
    } catch {
      showToast('Failed to update user', 'error');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      setTotal(t => t - 1);
      setSelectedUser(null);
      showToast('User deleted successfully');
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  const pageBtns = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '...') pages.push('...');
    }
    return pages;
  };

  return (
    <AdminLayout>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onVerifyToggle={handleVerifyToggle}
          onDelete={handleDelete}
        />
      )}
      <div style={{ padding: 36 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
              User <span className="gradient-text">Management</span>
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              {total} total user{total !== 1 ? 's' : ''} registered
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input
              className="input-field"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 42 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                style={{
                  padding: '9px 16px', borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: filter === f.value ? 'var(--accent-glow)' : 'var(--surface)',
                  border: `1px solid ${filter === f.value ? 'rgba(0,232,122,0.3)' : 'var(--border)'}`,
                  color: filter === f.value ? 'var(--accent)' : 'var(--text2)',
                  transition: 'var(--transition)', whiteSpace: 'nowrap'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Goal</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                    No users found
                  </td></tr>
                ) : users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0
                        }}>
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>{user.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{user.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span className={`badge ${user.isVerified ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        {user.profile?.profileComplete && (
                          <span className="badge badge-blue" style={{ fontSize: 11 }}>Profile Done</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {user.profile?.goal ? GOAL_LABELS[user.profile.goal] || user.profile.goal : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          title="View details"
                          style={{
                            width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)',
                            border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent2)'; e.currentTarget.style.borderColor = 'var(--accent2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleVerifyToggle(user._id, user.isVerified)}
                          title={user.isVerified ? 'Mark unverified' : 'Mark verified'}
                          style={{
                            width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)',
                            border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          {user.isVerified ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          title="Delete user"
                          style={{
                            width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)',
                            border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'var(--transition)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={15} />
                </button>
                {pageBtns().map((p, i) => (
                  p === '...'
                    ? <span key={i} style={{ color: 'var(--text3)', padding: '0 4px' }}>...</span>
                    : <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
