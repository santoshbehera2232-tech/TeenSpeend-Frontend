import React from 'react';

const ChartCard = ({ title, subtitle, action, children, height = 300 }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '14px' }}>
        <div>
          <h4 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {title}
          </h4>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div style={{ width: '100%', height: `${height}px`, minHeight: `${height}px`, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
