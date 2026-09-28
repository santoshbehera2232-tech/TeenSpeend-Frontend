import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { categoryApi } from '../api/categoryApi';
import Modal from '../components/Modal';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Tag,
  Plus,
  Trash2,
  ShieldCheck,
  Smartphone,
  Palette
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // New Category Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8b5cf6');
  const [savingCat, setSavingCat] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoadingCats(true);
      const res = await categoryApi.getCategories();
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Please provide a category name', 'warning');
      return;
    }

    try {
      setSavingCat(true);
      const res = await categoryApi.createCategory({
        name: newCatName.trim(),
        color: newCatColor,
        icon: 'Tag'
      });
      showToast('Custom category created!', 'success');
      setCategories(prev => [...prev, res.data.category]);
      setNewCatName('');
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id, isCustom) => {
    if (!isCustom) {
      showToast('Default system categories cannot be deleted', 'warning');
      return;
    }
    if (!window.confirm('Delete this custom category?')) return;

    try {
      await categoryApi.deleteCategory(id);
      showToast('Custom category deleted', 'success');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Preferences & Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Personalize your appearance, custom spending tags, and view security safeguards
        </p>
      </div>

      {/* Appearance & Dark Mode Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={20} color="var(--primary-500)" />
          Theme & Display
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>
              Dark Theme Mode
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Currently active: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{theme} mode</strong>
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
            <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
        </div>
      </div>

      {/* Custom Categories Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} color="var(--primary-500)" />
              Spending Categories
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage global defaults and create your own tags
            </p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Create Custom Tag</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {categories.map((c) => {
            const isCustom = !!c.user_id;
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: c.color || '#6366f1',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </span>
                </div>

                {isCustom ? (
                  <button
                    onClick={() => handleDeleteCategory(c.id, true)}
                    style={{ background: 'transparent', color: 'var(--danger)', padding: '2px' }}
                    title="Delete custom tag"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Isolation Safeguards Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--success)" />
          Security & Privacy Assurances
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--success)' }}>✔</span>
            <span><strong>Multi-User Isolation:</strong> Every single query is strictly authenticated via JWT; users can never view or modify another person's expenses or budgets.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--success)' }}>✔</span>
            <span><strong>Bcrypt Password Protection:</strong> Plaintext passwords are never stored in the database and never exposed through API responses.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--success)' }}>✔</span>
            <span><strong>Supabase Cloud Database:</strong> Enterprise-grade PostgreSQL with automatic connection encryption and row-level security policies.</span>
          </div>
        </div>
      </div>

      {/* Modal for creating custom category */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Category"
      >
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Manga & Comics, Guitar Lessons, Gym"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Tag Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: '48px', height: '38px', padding: '2px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{newCatColor}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingCat}>
              {savingCat ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;
