import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users2,
  Kanban,
  Building2,
  CalendarCheck2,
  BarChart3,
  LogOut,
  Zap,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: Users2 },
    { to: '/pipeline', label: 'Sales Pipeline', icon: Kanban },
    { to: '/customers', label: 'Customers', icon: Building2 },
    { to: '/activities', label: 'Activities', icon: CalendarCheck2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.4)',
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              SalesFlow
            </h2>
            <span style={{ fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Enterprise CRM
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ padding: '1.25rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem 0.5rem' }}>
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Current User Card & Logout */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid #1e293b',
            backgroundColor: '#0b1120',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || 'CRM User'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'capitalize' }}>
                  {user?.role || 'Employee'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="btn-icon"
              style={{ color: '#94a3b8', padding: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
