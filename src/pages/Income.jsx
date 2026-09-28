import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { incomeApi } from '../api/incomeApi';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, getTodayISO } from '../utils/dateUtils';
import Modal from '../components/Modal';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Gift,
  Coins
} from 'lucide-react';

const Income = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'INR';

  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    source: 'Pocket Money',
    incomeDate: getTodayISO(),
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const res = await incomeApi.getIncome();
      setIncomes(res.data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const totalRecordedIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      source: 'Pocket Money',
      incomeDate: getTodayISO(),
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc) => {
    setEditingId(inc.id);
    setFormData({
      amount: inc.amount,
      source: inc.source,
      incomeDate: inc.income_date,
      description: inc.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return;
    try {
      await incomeApi.deleteIncome(id);
      showToast('Income entry removed', 'success');
      setIncomes(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast('Please enter an amount greater than 0', 'warning');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const res = await incomeApi.updateIncome(editingId, {
          ...formData,
          amount: Number(formData.amount)
        });
        showToast('Income updated successfully', 'success');
        setIncomes(prev => prev.map(i => i.id === editingId ? res.data.income : i));
      } else {
        const res = await incomeApi.createIncome({
          ...formData,
          amount: Number(formData.amount)
        });
        showToast('Income added successfully!', 'success');
        setIncomes(prev => [res.data.income, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Income & Allowance</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Record pocket money, freelance gigs, gifts, and odd jobs
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Income Source</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="card" style={{
        background: 'var(--secondary-gradient)',
        color: '#ffffff',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Inflow Recorded
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px', color: '#ffffff' }}>
            {formatCurrency(totalRecordedIncome, currency)}
          </h2>
          <p style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '4px' }}>
            Across {incomes.length} recorded payments
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Coins size={32} />
          <div>
            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Monthly Baseline</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {formatCurrency(user?.monthly_income || 0, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Income Records List */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading income streams...
          </div>
        ) : incomes.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Wallet size={26} />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              Add your pocket money or income to start tracking your finances.
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
              Whether it’s pocket money from parents, birthday cash, or tutoring money, log it here.
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} /> Add First Income
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((inc) => (
                  <tr key={inc.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {formatDate(inc.income_date)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{inc.source}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {inc.description || '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
                      +{formatCurrency(inc.amount, currency)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '6px' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id)}
                          style={{ background: 'transparent', color: 'var(--danger)', padding: '6px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog for Adding / Editing Income */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Income' : 'Record Pocket Money / Income'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Amount ({currency}) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="e.g. 2500"
              style={{ width: '100%', fontSize: '1.2rem', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Source *
            </label>
            <input
              type="text"
              required
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              placeholder="e.g. Monthly Pocket Money, Math Tutoring, Birthday Gift"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Date Received *
            </label>
            <input
              type="date"
              required
              value={formData.incomeDate}
              onChange={(e) => setFormData(prev => ({ ...prev, incomeDate: e.target.value }))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Received via UPI from Mom"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Income' : 'Save Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Income;
