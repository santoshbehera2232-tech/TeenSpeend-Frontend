import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title,
  amount,
  currency = 'INR',
  subtitle,
  icon: Icon,
  iconBg = 'var(--primary-50)',
  iconColor = 'var(--primary-600)',
  trend = null, // { value: 12, label: 'vs last month', isPositive: true }
  highlightColor = null
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderTop: highlightColor ? `3px solid ${highlightColor}` : undefined
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.03em' }}>
            {formatCurrency(amount, currency)}
          </h3>
        </div>

        {Icon && (
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
        {subtitle && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {subtitle}
          </p>
        )}

        {trend && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: trend.isPositive ? 'var(--success)' : 'var(--danger)',
            backgroundColor: trend.isPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
