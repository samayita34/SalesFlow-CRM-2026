import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-500" color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} className="text-rose-500" color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500" color="#f59e0b" />;
      default:
        return <Info size={18} className="text-blue-500" color="#3b82f6" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}>
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
