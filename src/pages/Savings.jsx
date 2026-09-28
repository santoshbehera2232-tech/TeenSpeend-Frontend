import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { savingsApi } from '../api/savingsApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';

const Savings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'INR';

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Goal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });
  const [saving, setSaving] = useState(false);

  // Quick Deposit Modal
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await savingsApi.getSavingsGoals();
      setGoals(res.data?.goals || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: 0,
      deadline: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingId(goal.id);
    setFormData({
      name: goal.name,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount || 0,
      deadline: goal.deadline || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this savings goal?')) return;
    try {
      await savingsApi.deleteSavingsGoal(id);
      showToast('Savings goal removed', 'success');
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || Number(formData.targetAmount) <= 0) {
      showToast('Please enter a valid goal name and target amount', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        deadline: formData.deadline || null
      };

      if (editingId) {
        const res = await savingsApi.updateSavingsGoal(editingId, payload);
        showToast('Savings goal updated', 'success');
        setGoals(prev => prev.map(g => g.id === editingId ? res.data.goal : g));
      } else {
        const res = await savingsApi.createSavingsGoal(payload);
        showToast('New savings goal created!', 'success');
        setGoals(prev => [res.data.goal, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      showToast('Enter a deposit amount greater than zero', 'warning');
      return;
    }

    try {
      const newTotal = (depositGoal.current_amount || 0) + Number(depositAmount);
      const res = await savingsApi.updateSavingsGoal(depositGoal.id, { currentAmount: newTotal });
      showToast(`Added ${formatCurrency(depositAmount, currency)} to ${depositGoal.name}!`, 'success');
      setGoals(prev => prev.map(g => g.id === depositGoal.id ? res.data.goal : g));
      setDepositGoal(null);
      setDepositAmount('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + Number(g.current_amount || 0), 0);
  const totalTargetAcrossGoals = goals.reduce((acc, g) => acc + Number(g.target_amount || 0), 0);
  const overallSavedPercent = totalTargetAcrossGoals > 0 ? Math.round((totalSavedAcrossGoals / totalTargetAcrossGoals) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Wishlist & Savings Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Save up for gadgets, concert tickets, trips, or college books
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="card" style={{
        background: 'var(--primary-gradient)',
        color: '#ffffff',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase' }}>
              Total Goals Progress
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {formatCurrency(totalSavedAcrossGoals, currency)}{' '}
              <span style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.85 }}>
                of {formatCurrency(totalTargetAcrossGoals, currency)} target
              </span>
            </h2>
          </div>

          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {overallSavedPercent}%
          </div>
        </div>

        <div className="progress-bar-container" style={{ height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, overallSavedPercent)}%`,
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your wishlist goals...
        </div>
      ) : goals.length === 0 ? (
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Target size={28} />
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
            No savings goals created yet.
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            Saving for a PS5 game, sneakers, or a laptop? Set a target and deposit money step-by-step.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            + Create Your First Goal
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {goals.map((g) => {
            const current = Number(g.current_amount || 0);
            const target = Number(g.target_amount || 1);
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = current >= target;

            return (
              <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: isCompleted ? 'var(--success-bg)' : 'var(--primary-50)',
                      color: isCompleted ? 'var(--success)' : 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isCompleted ? <Award size={20} /> : <Target size={20} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{g.name}</h4>
                      {g.deadline && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Target date: {formatDate(g.deadline)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => handleOpenEdit(g)}
                      style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '6px' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      style={{ background: 'transparent', color: 'var(--danger)', padding: '6px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(current, currency)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(target, currency)} ({pct}%)</span>
                  </div>

                  <div className="progress-bar-container" style={{ height: '8px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: isCompleted ? 'var(--success)' : 'var(--primary-gradient)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
                  {isCompleted ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Target Reached! 🎉
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatCurrency(target - current, currency)} to go
                    </span>
                  )}

                  <button
                    onClick={() => { setDepositGoal(g); setDepositAmount(''); }}
                    className="btn btn-secondary btn-sm"
                  >
                    + Add Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Creation / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Goal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Noise-Cancelling Headphones, Birthday Gift"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Target Amount ({currency}) *
            </label>
            <input
              type="number"
              min="100"
              step="50"
              required
              placeholder="e.g. 6000"
              value={formData.targetAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
              style={{ width: '100%', fontSize: '1.2rem', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Current Amount Already Saved ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.currentAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Target Deadline (Optional)
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Funds / Deposit Modal */}
      {depositGoal && (
        <Modal
          isOpen={!!depositGoal}
          onClose={() => setDepositGoal(null)}
          title={`Add Funds to ${depositGoal.name}`}
        >
          <form onSubmit={handleAddDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Enter the amount of pocket money or saved cash you want to add to this goal:
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Deposit Amount ({currency}) *
              </label>
              <input
                type="number"
                min="10"
                step="any"
                required
                autoFocus
                placeholder="e.g. 500"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                style={{ width: '100%', fontSize: '1.25rem', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDepositGoal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Funds
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Savings;
