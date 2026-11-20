import React from 'react';

export const Badge = ({ variant = 'default', children, showDot = true }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'Won':
      case 'Active':
      case 'Completed':
      case 'admin':
        return 'badge-success';
      case 'Qualified':
      case 'Proposal Sent':
      case 'Negotiation':
      case 'Contacted':
        return 'badge-primary';
      case 'New':
      case 'Prospect':
      case 'Pending':
      case 'employee':
        return 'badge-info';
      case 'Lost':
      case 'Inactive':
      case 'Churned':
      case 'Cancelled':
        return 'badge-danger';
      case 'Call':
      case 'Meeting':
      case 'Email':
      case 'Note':
      case 'Task':
      case 'Status Change':
        return 'badge-default';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`badge ${getVariantClass()}`}>
      {showDot && <span className="badge-dot" />}
      {children}
    </span>
  );
};

export default Badge;
