import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, subtitle, color = 'var(--primary)' }) => {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.375rem', letterSpacing: '-0.03em' }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div
            style={{
              padding: '0.625rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
          {change && (
            <span
              style={{
                color: change.startsWith('+') ? 'var(--success)' : change.startsWith('-') ? 'var(--danger)' : 'var(--primary)',
                fontWeight: 600,
              }}
            >
              {change}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
