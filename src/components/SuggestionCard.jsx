import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import {
  Sparkles,
  AlertTriangle,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  PiggyBank,
  Compass,
  ArrowRight
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  AlertTriangle,
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  PiggyBank,
  Compass
};

const SuggestionCard = ({ suggestion, currency = 'INR' }) => {
  const {
    type = 'tip',
    badge = 'Smart Tip',
    icon = 'Sparkles',
    title,
    message,
    whyItMatters,
    suggestedAction,
    potentialSaving
  } = suggestion;

  const IconComponent = ICON_MAP[icon] || Sparkles;

  let borderColor = 'var(--primary-500)';
  let badgeClass = 'badge-primary';
  let iconBg = 'var(--primary-50)';
  let iconColor = 'var(--primary-600)';

  if (type === 'warning') {
    borderColor = 'var(--danger)';
    badgeClass = 'badge-danger';
    iconBg = 'var(--danger-bg)';
    iconColor = 'var(--danger)';
  } else if (type === 'praise') {
    borderColor = 'var(--success)';
    badgeClass = 'badge-success';
    iconBg = 'var(--success-bg)';
    iconColor = 'var(--success)';
  } else if (type === 'alert') {
    borderColor = 'var(--warning)';
    badgeClass = 'badge-warning';
    iconBg = 'var(--warning-bg)';
    iconColor = 'var(--warning)';
  }

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative'
      }}
    >
      {/* Header with Icon, Badge & Potential Saving */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <IconComponent size={20} />
          </div>
          <span className={`badge ${badgeClass}`}>{badge}</span>
        </div>

        {potentialSaving && (
          <div style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            Save up to {formatCurrency(potentialSaving, currency)}
          </div>
        )}
      </div>

      {/* Main Title & Explanation */}
      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {/* Why This Matters */}
      {whyItMatters && (
        <div style={{
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          border: '1px solid var(--border-color)',
          fontSize: '0.84rem'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
            💡 Why this matters
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            {whyItMatters}
          </p>
        </div>
      )}

      {/* Action Step */}
      {suggestedAction && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          fontSize: '0.86rem',
          color: 'var(--text-primary)',
          marginTop: 'auto',
          paddingTop: '6px'
        }}>
          <ArrowRight size={16} color="var(--primary-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Next Action: </strong>
            <span style={{ color: 'var(--text-secondary)' }}>{suggestedAction}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;
