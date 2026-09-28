import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { budgetApi } from '../api/budgetApi';
import { categoryApi } from '../api/categoryApi';
import { formatCurrency } from '../utils/formatCurrency';
import { getMonthName } from '../utils/dateUtils';
import BudgetProgress from '../components/BudgetProgress';
import Modal from '../components/Modal';
import {
  PieChart,
  Plus,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle,
  Coins
} from 'lucide-react';

const Budget = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'INR';

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [budgetData, setBudgetData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: today.getMonth() + 1,
    year: today.getFullYear()
  });
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetApi.getBudgets(selectedMonth, selectedYear);
      setBudgetData(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getCategories();
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleOpenAdd = () => {
    setFormData({
      categoryId: '',
      amount: '',
      month: selectedMonth,
      year: selectedYear
    });
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget target?')) return;
    try {
      await budgetApi.deleteBudget(id);
      showToast('Budget target removed', 'success');
      fetchBudgets();
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
      await budgetApi.createBudget({
        categoryId: formData.categoryId || null,
        amount: Number(formData.amount),
        month: formData.month,
        year: formData.year
      });
      showToast('Budget target saved successfully!', 'success');
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const budgets = budgetData?.budgets || [];
  const totalBudgetSpent = budgetData?.totalExpensesInMonth || 0;
  const overallBudgetObj = budgets.find(b => b.categoryId === null);
  const categoryBudgets = budgets.filter(b => b.categoryId !== null);

  const totalCap = overallBudgetObj
    ? overallBudgetObj.budgetAmount
    : budgets.reduce((acc, b) => acc + b.budgetAmount, 0);

  const overallPercent = totalCap > 0 ? Math.round((totalBudgetSpent / totalCap) * 100) : 0;
  const isOverallExceeded = overallPercent >= 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Budgeting & Limits</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Set category guardrails so you never run out of pocket money
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ fontWeight: 600 }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>

          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={18} />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Exceeded Banner Warning if Over 100% */}
      {isOverallExceeded && totalCap > 0 && (
        <div style={{
          backgroundColor: 'var(--danger-bg)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          color: 'var(--danger)',
          animation: 'shake 0.4s ease'
        }}>
          <Flame size={28} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--danger)' }}>
              Monthly Spending Limit Exceeded!
            </h4>
            <p style={{ fontSize: '0.88rem', marginTop: '2px' }}>
              You have spent {formatCurrency(totalBudgetSpent, currency)} against your planned {formatCurrency(totalCap, currency)} ({overallPercent}%). Consider cutting non-essential purchases for the rest of {getMonthName(selectedMonth)}.
            </p>
          </div>
        </div>
      )}

      {/* Overall Month Budget Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {getMonthName(selectedMonth)} {selectedYear} Overall Cap
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '2px' }}>
              {formatCurrency(totalBudgetSpent, currency)}{' '}
              <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                spent of {formatCurrency(totalCap, currency)} planned
              </span>
            </h3>
          </div>

          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: isOverallExceeded ? 'var(--danger)' : overallPercent >= 85 ? 'var(--warning)' : 'var(--success)'
          }}>
            {overallPercent}%
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="progress-bar-container" style={{ height: '14px', borderRadius: 'var(--radius-full)' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, overallPercent)}%`,
              background: isOverallExceeded
                ? 'var(--danger)'
                : overallPercent >= 85
                ? 'var(--warning)'
                : 'var(--primary-gradient)'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          <span>
            {isOverallExceeded
              ? `Exceeded by ${formatCurrency(totalBudgetSpent - totalCap, currency)}`
              : `${formatCurrency(Math.max(0, totalCap - totalBudgetSpent), currency)} remaining safe to spend`}
          </span>
          <span>{budgets.length} active budget rules</span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
          Category Specific Budgets
        </h3>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Calculating budget statuses...
          </div>
        ) : categoryBudgets.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.92rem' }}>
              No category-specific budgets set for this month.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Setting limits on "Food & Snacks" or "Entertainment" helps you prevent overspending before it happens!
            </p>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              + Set Category Budget
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoryBudgets.map(b => (
              <div key={b.id} style={{ position: 'relative' }}>
                <BudgetProgress
                  categoryName={b.categoryName}
                  budgetAmount={b.budgetAmount}
                  spentAmount={b.spentAmount}
                  percentageUsed={b.percentageUsed}
                  currency={currency}
                  status={b.status}
                />
                <button
                  onClick={() => handleDeleteBudget(b.id)}
                  title="Remove budget target"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '16px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    padding: '4px'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for setting new Budget */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Budget Target"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Target Category (Leave blank for overall monthly limit)
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              style={{ width: '100%' }}
            >
              <option value="">🎯 Overall Monthly Budget Limit</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
              Budget Limit Amount ({currency}) *
            </label>
            <input
              type="number"
              min="50"
              step="50"
              required
              placeholder="e.g. 2500"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              style={{ width: '100%', fontSize: '1.2rem', fontWeight: 700 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Month
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: Number(e.target.value) }))}
                style={{ width: '100%' }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Set Budget Target'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;
