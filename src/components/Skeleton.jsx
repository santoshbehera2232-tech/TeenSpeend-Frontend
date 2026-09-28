import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--border-color)',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
        ...style
      }}
    >
      <style>{`
        @keyframes skeletonPulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <Skeleton width="40%" height="16px" />
    <Skeleton width="70%" height="32px" />
    <Skeleton width="50%" height="14px" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton width="30%" height="24px" />
      <Skeleton width="15%" height="32px" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '12px' }}>
        <Skeleton width="20%" height="20px" />
        <Skeleton width="40%" height="20px" />
        <Skeleton width="20%" height="20px" />
        <Skeleton width="20%" height="20px" />
      </div>
    ))}
  </div>
);

export default Skeleton;
