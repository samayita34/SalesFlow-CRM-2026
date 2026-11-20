import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ title = 'Dashboard', subtitle = '', onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '1px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          Atlas Connected
        </div>

        {/* User Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: '#ffffff',
          }}
        >
          <ShieldCheck size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || 'User'}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              padding: '0.125rem 0.375rem',
              borderRadius: '4px',
              backgroundColor: user?.role === 'admin' ? '#fef3c7' : '#e0f2fe',
              color: user?.role === 'admin' ? '#92400e' : '#0369a1',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {user?.role || 'employee'}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
