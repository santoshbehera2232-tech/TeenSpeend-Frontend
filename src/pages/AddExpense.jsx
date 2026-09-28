import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { expenseApi } from '../api/expenseApi';
import { categoryApi } from '../api/categoryApi';
import { getTodayISO } from '../utils/dateUtils';
import {
  PlusCircle,
  IndianRupee,
  Calendar,
  CreditCard,
  CheckCircle2,
  Tag,
  ArrowLeft
} from 'lucide-react';

const AddExpense = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const currency = user?.currency || 'INR';

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    expenseDate: getTodayISO(),
    paymentMethod: 'UPI',
    isNecessary: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories();
        const cats = res.data?.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePresetAmount = (amt) => {
    setFormData(prev => ({ ...prev, amount: String(amt) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a short description.');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select a category.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await expenseApi.createExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      showToast('Expense recorded successfully!', 'success');
      navigate('/expenses');
    } catch (err) {
      setError(err.message || 'Failed to record expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/expenses" className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Record An Expense</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Logging your transactions keeps your spending transparent
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            fontSize: '0.88rem',
            fontWeight: 500,
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Amount Input with Large Emphasis */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
              Amount ({currency}) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                name="amount"
                min="0.01"
                step="any"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                style={{
                  width: '100%',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)'
                }}
              />
            </div>

            {/* Quick amount presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick pick:</span>
              {[50, 100, 200, 500, 1000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handlePresetAmount(val)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
              Description *
            </label>
            <input
              type="text"
              name="description"
              required
              placeholder="e.g. Burger & cold drink with Rahul"
              value={formData.description}
              onChange={handleChange}
              maxLength={255}
              style={{ width: '100%' }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
              Category *
            </label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                Date *
              </label>
              <input
                type="date"
                name="expenseDate"
                required
                value={formData.expenseDate}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Need vs Want Switch */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {formData.isNecessary ? 'Essential Need' : 'Discretionary Want'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {formData.isNecessary
                  ? 'Required for study, meals, or travel'
                  : 'Fun treat, impulse snack, or entertainment'}
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isNecessary"
                checked={formData.isNecessary}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Necessary
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Recording Expense...' : '+ Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
