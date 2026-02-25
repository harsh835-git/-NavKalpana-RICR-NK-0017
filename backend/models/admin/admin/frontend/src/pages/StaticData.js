import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/Sidebar';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  { value: 'tips', label: 'Fitness Tips', color: 'var(--accent)' },
  { value: 'announcements', label: 'Announcements', color: 'var(--accent2)' },
  { value: 'faq', label: 'FAQ', color: 'var(--warning)' },
  { value: 'goal_info', label: 'Goal Info', color: 'var(--danger)' },
  { value: 'platform_config', label: 'Platform Config', color: 'var(--text2)' }
];

const getCategoryMeta = (cat) => CATEGORIES.find(c => c.value === cat) || { label: cat, color: 'var(--text2)' };

const FormModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    category: item?.category || 'tips',
    key: item?.key || '',
    title: item?.title || '',
    content: item?.content || '',
    isActive: item?.isActive !== false,
    order: item?.order || 0
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!item?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form, item?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{isEdit ? 'Edit Item' : 'New Static Data Item'}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text3)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Category</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  disabled={isEdit}
                  style={{ appearance: 'none', paddingRight: 36 }}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label className="label">Key (unique)</label>
              <input
                className="input-field"
                placeholder="e.g. tip_hydration"
                value={form.key}
                onChange={e => setForm(f => ({ ...f, key: e.target.value.replace(/\s/g, '_').toLowerCase() }))}
                disabled={isEdit}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              className="input-field"
              placeholder="Enter a title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea
              className="input-field"
              placeholder="Enter the content text..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4}
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Display Order</label>
              <input
                className="input-field"
                type="number"
                min="0"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 18px', borderRadius: 10,
                  background: form.isActive ? 'var(--accent-glow)' : 'var(--bg3)',
                  border: `1px solid ${form.isActive ? 'rgba(0,232,122,0.3)' : 'var(--border)'}`,
                  color: form.isActive ? 'var(--accent)' : 'var(--text3)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%'
                }}
              >
                {form.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {form.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.25)', borderRadius: 10, padding: '11px 16px', color: 'var(--danger)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? <span className="spinner" style={{ width: 15, height: 15 }} /> : null}
              {isEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StaticData = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/static-data${activeCategory !== 'all' ? `?category=${activeCategory}` : ''}`);
      setItems(data);
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async (form, id) => {
    if (id) {
      const { data } = await axios.put(`/api/admin/static-data/${id}`, form);
      setItems(prev => prev.map(i => i._id === id ? data : i));
      showToast('Item updated successfully');
    } else {
      const { data } = await axios.post('/api/admin/static-data', form);
      setItems(prev => [...prev, data]);
      showToast('Item created successfully');
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.patch(`/api/admin/static-data/${id}/toggle`);
      setItems(prev => prev.map(i => i._id === id ? data : i));
      showToast(`Item ${data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      showToast('Failed to toggle item', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/static-data/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      showToast('Item deleted');
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = items.filter(i => i.category === cat.value);
    return acc;
  }, {});

  const displayItems = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  return (
    <AdminLayout>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      {(formOpen || editItem) && (
        <FormModal
          item={editItem}
          onClose={() => { setFormOpen(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
      <div style={{ padding: 36 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
              Static <span className="gradient-text">Data</span>
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>
              Manage platform content — tips, announcements, FAQs, and configuration
            </p>
          </div>
          <button
            onClick={() => { setEditItem(null); setFormOpen(true); }}
            className="btn-primary"
            style={{ fontSize: 14, padding: '11px 22px' }}
          >
            <Plus size={16} /> New Item
          </button>
        </div>

        {/* Category summary cards */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {CATEGORIES.map(cat => {
            const catItems = grouped[cat.value] || [];
            const active = catItems.filter(i => i.isActive).length;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value === activeCategory ? 'all' : cat.value)}
                style={{
                  background: activeCategory === cat.value ? `${cat.color}15` : 'var(--surface)',
                  border: `1px solid ${activeCategory === cat.value ? `${cat.color}40` : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', padding: '18px 20px',
                  textAlign: 'left', cursor: 'pointer', transition: 'var(--transition)'
                }}
              >
                <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 800, color: cat.color, lineHeight: 1 }}>
                  {catItems.length}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 6 }}>{cat.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{active} active</div>
              </button>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: activeCategory === 'all' ? 'var(--accent-glow)' : 'var(--surface)',
              border: `1px solid ${activeCategory === 'all' ? 'rgba(0,232,122,0.3)' : 'var(--border)'}`,
              color: activeCategory === 'all' ? 'var(--accent)' : 'var(--text2)',
              transition: 'var(--transition)'
            }}
          >
            All ({items.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              style={{
                padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: activeCategory === cat.value ? `${cat.color}15` : 'var(--surface)',
                border: `1px solid ${activeCategory === cat.value ? `${cat.color}35` : 'var(--border)'}`,
                color: activeCategory === cat.value ? cat.color : 'var(--text2)',
                transition: 'var(--transition)'
              }}
            >
              {cat.label} ({grouped[cat.value]?.length || 0})
            </button>
          ))}
        </div>

        {/* Items list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
            <div style={{ fontSize: 14 }}>No items found. Create one to get started.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayItems.map(item => {
              const meta = getCategoryMeta(item.category);
              return (
                <div
                  key={item._id}
                  className="card"
                  style={{
                    padding: '18px 22px',
                    opacity: item.isActive ? 1 : 0.6,
                    borderLeft: `3px solid ${meta.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: meta.color,
                          background: `${meta.color}15`, padding: '3px 10px',
                          borderRadius: 50, letterSpacing: '0.04em', textTransform: 'uppercase'
                        }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace' }}>#{item.key}</span>
                        <span className={`badge ${item.isActive ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Order: {item.order}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{item.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{item.content}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggle(item._id)}
                        title={item.isActive ? 'Deactivate' : 'Activate'}
                        style={{
                          width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)',
                          border: '1px solid var(--border)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: item.isActive ? 'var(--accent)' : 'var(--text3)',
                          transition: 'var(--transition)'
                        }}
                      >
                        {item.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button
                        onClick={() => setEditItem(item)}
                        title="Edit"
                        style={{
                          width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)',
                          border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent2)'; e.currentTarget.style.borderColor = 'var(--accent2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                        style={{
                          width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)',
                          border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'var(--transition)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StaticData;
