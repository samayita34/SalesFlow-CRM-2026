import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', size = 32, fullHeight = false }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem',
        minHeight: fullHeight ? '60vh' : 'auto',
        gap: '0.875rem',
        color: '#64748b',
      }}
    >
      <Loader2
        size={size}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--primary)',
        }}
      />
      {message && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
