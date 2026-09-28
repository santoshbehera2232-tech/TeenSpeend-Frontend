import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { AlertTriangle, CheckCircle, Flame } from 'lucide-react';

const BudgetProgress = ({
  categoryName,
  budgetAmount,
  spentAmount,
  percentageUsed,
  currency = 'INR',
  status = 'healthy'
}) => {
  const isOver = percentageUsed >= 100;
  const isWarning = percentageUsed >= 85 && percentageUsed < 100;
  const remaining = Math.max(0, budgetAmount - spentAmount);

  let barColor = 'var(--primary-gradient)';
  let badgeClass = 'badge-primary';
  let statusText = 'On Track';

  if (isOver) {
    barColor = 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)';
    badgeClass = 'badge-danger';
    statusText = 'Budget Exceeded!';
  } else if (isWarning) {
    barColor = 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)';
    badgeClass = 'badge-warning';
    statusText = 'Approaching Limit';
  }

  return (
    <div style={{
      padding: '16px',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      marginBottom: '12px',
      transition: 'transform 0.15s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{categoryName}</span>
          <span className={`badge ${badgeClass}`}>
            {isOver && <Flame size={12} />}
            {isWarning && <AlertTriangle size={12} />}
            {!isOver && !isWarning && <CheckCircle size={12} />}
            {statusText}
          </span>
        </div>

        <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
          {percentageUsed}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="progress-bar-container" style={{ height: '9px', marginBottom: '10px' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(100, percentageUsed)}%`,
            background: barColor
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <div>
          <span>Spent: </span>
          <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(spentAmount, currency)}</strong>
          <span> of {formatCurrency(budgetAmount, currency)}</span>
        </div>

        <div>
          {isOver ? (
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
              Over by {formatCurrency(spentAmount - budgetAmount, currency)}
            </span>
          ) : (
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
              {formatCurrency(remaining, currency)} remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;
