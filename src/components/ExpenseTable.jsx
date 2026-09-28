import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateUtils';
import { Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ExpenseTable = ({
  expenses = [],
  currency = 'INR',
  onDelete = () => {},
  onEdit = () => {},
  loading = false
}) => {
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const confirmDelete = async () => {
    if (deleteCandidate) {
      await onDelete(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading expenses...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div style={{
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-color)'
      }}>
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
          💸
        </div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
          Your spending history is empty.
        </h4>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          Start logging snacks, travel, and books to uncover your money habits and build your savings!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Payment</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => {
              const cat = expense.categories;
              return (
                <tr key={expense.id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {formatDate(expense.expense_date)}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {expense.description}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: cat?.color ? `${cat.color}15` : 'var(--primary-50)',
                        color: cat?.color || 'var(--primary-600)'
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: cat?.color || 'var(--primary-600)'
                        }}
                      />
                      {cat?.name || 'General'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {expense.payment_method || 'UPI'}
                  </td>
                  <td>
                    {expense.is_necessary ? (
                      <span className="badge badge-success" title="Necessary Need">
                        <CheckCircle2 size={12} /> Need
                      </span>
                    ) : (
                      <span className="badge badge-warning" title="Discretionary Want">
                        <XCircle size={12} /> Want
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.98rem' }}>
                    {formatCurrency(expense.amount, currency)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onEdit(expense)}
                        title="Edit expense"
                        style={{
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(expense)}
                        title="Delete expense"
                        style={{
                          background: 'transparent',
                          color: 'var(--danger)',
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          title="Delete Expense?"
        >
          <div style={{ padding: '8px 0' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px',
              backgroundColor: 'var(--danger-bg)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              color: 'var(--danger)'
            }}>
              <AlertTriangle size={24} />
              <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                Are you sure you want to permanently remove this expense?
              </p>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <strong>{deleteCandidate.description}</strong> for{' '}
              <strong>{formatCurrency(deleteCandidate.amount, currency)}</strong> on {formatDate(deleteCandidate.expense_date)}.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Delete Expense
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ExpenseTable;
