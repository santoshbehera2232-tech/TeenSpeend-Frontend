import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { expenseApi } from '../api/expenseApi';
import { categoryApi } from '../api/categoryApi';
import ExpenseTable from '../components/ExpenseTable';
import Modal from '../components/Modal';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';

const Expenses = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency || 'INR';

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('expense_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Edit Modal State
  const [editExpense, setEditExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    categoryId: '',
    expenseDate: '',
    paymentMethod: 'UPI',
    isNecessary: true
  });
  const [editLoading, setEditLoading] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getCategories();
        setCategories(res.data?.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch expenses whenever filters change
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        sortBy,
        sortOrder
      };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await expenseApi.getExpenses(params);
      setExpenses(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, sortBy, sortOrder, selectedCategory, paymentMethod, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchExpenses();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteExpense = async (id) => {
    try {
      await expenseApi.deleteExpense(id);
      showToast('Expense removed successfully', 'success');
      setExpenses(prev => prev.filter(e => e.id !== id));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenEdit = (expense) => {
    setEditExpense(expense);
    setEditForm({
      amount: expense.amount,
      description: expense.description,
      categoryId: expense.category_id || '',
      expenseDate: expense.expense_date,
      paymentMethod: expense.payment_method || 'UPI',
      isNecessary: expense.is_necessary
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.amount || !editForm.description || !editForm.expenseDate) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    try {
      setEditLoading(true);
      const res = await expenseApi.updateExpense(editExpense.id, editForm);
      showToast('Expense updated successfully!', 'success');
      setEditExpense(null);
      // Update item in local list
      setExpenses(prev => prev.map(item => item.id === editExpense.id ? res.data.expense : item));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Add Expense Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Expense History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Search, filter, and audit every single purchase
          </p>
        </div>

        <Link to="/add-expense" className="btn btn-primary">
          <Plus size={18} />
          <span>Record New Expense</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '18px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            style={{ width: '100%' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
            style={{ width: '100%' }}
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            style={{ width: '100%' }}
          />

          {/* End Date */}
          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            style={{ width: '100%' }}
          />
        </div>

        {/* Sorting controls & Clear Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so);
              }}
              style={{ padding: '4px 8px', fontSize: '0.82rem' }}
            >
              <option value="expense_date_desc">Newest First</option>
              <option value="expense_date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>

          {(search || selectedCategory || paymentMethod || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setPaymentMethod('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              style={{ background: 'transparent', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.82rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Expense Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <ExpenseTable
          expenses={expenses}
          currency={currency}
          loading={loading}
          onDelete={handleDeleteExpense}
          onEdit={handleOpenEdit}
        />

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)'
          }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Showing {expenses.length} of {pagination.total} records (Page {pagination.page} of {pagination.totalPages})
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(prev => prev + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editExpense && (
        <Modal
          isOpen={!!editExpense}
          onClose={() => setEditExpense(null)}
          title="Edit Expense"
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Amount ({currency})
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Description
              </label>
              <input
                type="text"
                required
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={editForm.categoryId}
                onChange={(e) => setEditForm(prev => ({ ...prev, categoryId: e.target.value }))}
                style={{ width: '100%' }}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={editForm.expenseDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expenseDate: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Payment Method
                </label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  style={{ width: '100%' }}
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={editForm.isNecessary}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isNecessary: e.target.checked }))}
                />
                <span>This is a necessary expense (Need vs Want)</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditExpense(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Expenses;
