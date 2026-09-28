import { useState, useEffect, useCallback } from 'react';
import { expenseApi } from '../api/expenseApi';

export const useExpenses = (initialFilters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchExpenses = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const res = await expenseApi.getExpenses(currentFilters);
      setExpenses(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses(filters);
  }, [filters, fetchExpenses]);

  const removeExpense = async (id) => {
    await expenseApi.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return {
    expenses,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    fetchExpenses,
    removeExpense
  };
};

export default useExpenses;
