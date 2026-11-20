import React from 'react';
import { Inbox } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="table-responsive" style={{ padding: '2rem' }}>
        <LoadingSpinner message="Fetching data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-responsive" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            color: '#94a3b8',
            marginBottom: '0.75rem',
          }}
        >
          <Inbox size={24} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  width: col.width || 'auto',
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row._id || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  style={{
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
