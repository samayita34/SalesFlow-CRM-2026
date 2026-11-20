import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users2,
  Building2,
  TrendingUp,
  Award,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Clock,
  Briefcase,
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
} from 'recharts';

const STATUS_COLORS = {
  New: '#94a3b8',
  Contacted: '#38bdf8',
  Qualified: '#0284c7',
  'Proposal Sent': '#6366f1',
  Negotiation: '#f59e0b',
  Won: '#10b981',
  Lost: '#ef4444',
};

const PIE_COLORS = ['#0284c7', '#38bdf8', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const Dashboard = () => {
  const { setSidebarOpen } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
        title="CRM Executive Dashboard"
        subtitle="Real-time pipeline performance and sales analytics"
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="page-body">
        {/* Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Overview Summary</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Connected to MongoDB Atlas database
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm" title="Refresh metrics">
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/leads" className="btn btn-primary btn-sm">
              <Plus size={14} /> Add Lead
            </Link>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Calculating dashboard analytics..." fullHeight />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
              <StatCard
                title="Total Leads"
                value={data?.summary?.totalLeads ?? 0}
                icon={Users2}
                subtitle={`${data?.summary?.conversionRate || 0}% conversion rate`}
                color="#0284c7"
              />
              <StatCard
                title="Active Customers"
                value={data?.summary?.totalCustomers ?? 0}
                icon={Building2}
                subtitle="Accounts converted"
                color="#10b981"
              />
              <StatCard
                title="Pipeline Deal Value"
                value={formatCurrency(data?.summary?.pipelineValue)}
                icon={TrendingUp}
                subtitle="Active open deals"
                color="#f59e0b"
              />
              <StatCard
                title="Won Deals Revenue"
                value={formatCurrency(data?.summary?.wonDealValue)}
                icon={Award}
                subtitle={`Total deal volume: ${formatCurrency(data?.summary?.totalDealValue)}`}
                color="#6366f1"
              />
            </div>

            {/* Charts Section */}
            <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
              {/* Status Breakdown Bar Chart */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Leads by Status Stage</h3>
                    <p className="card-subtitle">Count of leads across pipeline phases</p>
                  </div>
                </div>
                <div style={{ height: '280px', width: '100%' }}>
                  {data?.leadsByStatus?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.leadsByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <XAxis dataKey="status" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(value, name, item) => [
                            `${value} leads (${formatCurrency(item.payload.totalValue)})`,
                            'Count',
                          ]}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {data.leadsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#0284c7'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      No lead status data available
                    </div>
                  )}
                </div>
              </div>

              {/* Source Breakdown Pie Chart */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Lead Acquisition Sources</h3>
                    <p className="card-subtitle">Distribution by marketing channel</p>
                  </div>
                </div>
                <div style={{ height: '280px', width: '100%' }}>
                  {data?.leadsBySource?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.leadsBySource}
                          dataKey="count"
                          nameKey="source"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={45}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {data.leadsBySource.map((entry, index) => (
                            <Cell key={`source-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} leads`, 'Count']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      No lead source data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tables: Recent Leads & Recent Activities */}
            <div className="grid-2">
              {/* Recent Leads */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Recent Leads</h3>
                    <p className="card-subtitle">Latest prospects added to the database</p>
                  </div>
                  <Link to="/leads" className="btn btn-outline btn-sm">
                    View All <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data?.recentLeads?.length > 0 ? (
                    data.recentLeads.map((lead) => (
                      <div
                        key={lead._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                            }}
                          >
                            <Briefcase size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{lead.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {lead.company || 'No company'} • {lead.source || 'Website'}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                            {formatCurrency(lead.dealValue)}
                          </div>
                          <Badge variant={lead.status}>{lead.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>
                      No recent leads found.
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Recent CRM Activity</h3>
                    <p className="card-subtitle">Audited timeline of team actions</p>
                  </div>
                  <Link to="/activities" className="btn btn-outline btn-sm">
                    View All <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data?.recentActivities?.length > 0 ? (
                    data.recentActivities.map((act) => (
                      <div
                        key={act._id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <Clock size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                              {act.title}
                            </span>
                            <Badge variant={act.type}>{act.type}</Badge>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                            {act.description}
                          </p>
                          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                            By {act.performedBy?.name || 'User'} • {new Date(act.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>
                      No recent activities recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
