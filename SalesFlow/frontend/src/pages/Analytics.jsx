import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#0284c7', '#38bdf8', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const Analytics = () => {
  const { setSidebarOpen } = useOutletContext();
  const { toast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load analytics: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <>
      <Navbar
        title="Sales Analytics & Intelligence"
        subtitle="Deep dive into deal values, conversion channels, and pipeline velocity"
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="page-body">
        {/* Header Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Performance Reports</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Live metrics calculated directly from Atlas</p>
          </div>
          <button onClick={fetchAnalytics} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Recompute Evals
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Calculating analytics charts..." fullHeight />
        ) : (
          <>
            {/* KPI Metrics */}
            <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
              <StatCard
                title="Conversion Rate"
                value={`${data?.summary?.conversionRate || 0}%`}
                icon={TrendingUp}
                subtitle="Won leads / Total prospects"
                color="#10b981"
              />
              <StatCard
                title="Total Deal Volume"
                value={formatCurrency(data?.summary?.totalDealValue)}
                icon={DollarSign}
                subtitle="All pipeline opportunities"
                color="#0284c7"
              />
              <StatCard
                title="Won Deals Revenue"
                value={formatCurrency(data?.summary?.wonDealValue)}
                icon={Award}
                subtitle="Closed deals"
                color="#6366f1"
              />
              <StatCard
                title="Customer Revenue"
                value={formatCurrency(data?.summary?.totalCustomerRevenue)}
                icon={BarChart3}
                subtitle="Direct account contracts"
                color="#f59e0b"
              />
            </div>

            {/* In-depth Charts */}
            <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
              {/* Deal Value per Status Stage */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Deal Value By Stage ($ USD)</h3>
                    <p className="card-subtitle">Aggregate dollar value across sales progression stages</p>
                  </div>
                </div>
                <div style={{ height: '320px', width: '100%' }}>
                  {data?.leadsByStatus?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.leadsByStatus} margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="status" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
                        />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value), 'Total Deal Value']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}
                        />
                        <Bar dataKey="totalValue" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      No deal value data available
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Source Value & Count */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Lead Source Performance</h3>
                    <p className="card-subtitle">Volume and quality generated by marketing channel</p>
                  </div>
                </div>
                <div style={{ height: '320px', width: '100%' }}>
                  {data?.leadsBySource?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.leadsBySource} margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="source" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(value, name, item) => [
                            `${value} leads (${formatCurrency(item.payload.totalValue)})`,
                            'Lead Count',
                          ]}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      No source data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Share Donut & Breakdown Table */}
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Pipeline Share by Status</h3>
                    <p className="card-subtitle">Percentage proportion of deals</p>
                  </div>
                </div>
                <div style={{ height: '280px', width: '100%' }}>
                  {data?.leadsByStatus?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.leadsByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {data.leadsByStatus.map((entry, index) => (
                            <Cell key={`donut-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => [`${v} leads`, 'Count']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      No data
                    </div>
                  )}
                </div>
              </div>

              {/* Conversion Efficiency Breakdown */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Stage Conversion Summary</h3>
                    <p className="card-subtitle">Breakdown counts and dollar metrics</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {data?.leadsByStatus?.map((item) => (
                    <div
                      key={item.status}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.status}</span>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{item.count} opportunities</span>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0284c7' }}>
                          {formatCurrency(item.totalValue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Analytics;
