import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { activityApi } from '../api/activityApi';
import { leadApi } from '../api/leadApi';
import { customerApi } from '../api/customerApi';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CalendarCheck2,
  Phone,
  Mail,
  Users,
  FileText,
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';

const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Note', 'Task', 'Status Change'];

export const Activities = () => {
  const { setSidebarOpen } = useOutletContext();
  const { toast } = useToast();

  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Call',
    title: '',
    description: '',
    lead: '',
    customer: '',
    status: 'Completed',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;

      const res = await activityApi.getActivities(params);
      if (res.success) {
        setActivities(res.activities);
      }
    } catch (err) {
      toast.error('Failed to load activities: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociations = async () => {
    try {
      const [leadsRes, custsRes] = await Promise.all([
        leadApi.getLeads(),
        customerApi.getCustomers(),
      ]);
      if (leadsRes.success) setLeads(leadsRes.leads);
      if (custsRes.success) setCustomers(custsRes.customers);
    } catch (e) {
      console.error('Error fetching leads/customers for activities:', e);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchAssociations();
  }, [typeFilter]);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Activity title is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!payload.lead) delete payload.lead;
      if (!payload.customer) delete payload.customer;

      const res = await activityApi.createActivity(payload);
      if (res.success) {
        toast.success('Activity logged successfully');
        setIsAddModalOpen(false);
        setFormData({
          type: 'Call',
          title: '',
          description: '',
          lead: '',
          customer: '',
          status: 'Completed',
        });
        fetchActivities();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      const res = await activityApi.deleteActivity(id);
      if (res.success) {
        toast.success('Activity deleted');
        setActivities((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete activity');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call':
        return <Phone size={16} color="#0284c7" />;
      case 'Meeting':
        return <Users size={16} color="#8b5cf6" />;
      case 'Email':
        return <Mail size={16} color="#10b981" />;
      case 'Task':
        return <CheckCircle size={16} color="#f59e0b" />;
      case 'Status Change':
        return <AlertCircle size={16} color="#ec4899" />;
      default:
        return <FileText size={16} color="#64748b" />;
    }
  };

  return (
    <>
      <Navbar
        title="CRM Activity Timeline"
        subtitle="Audited log of sales calls, meetings, notes, and task actions"
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="page-body">
        {/* Controls Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Filter By Type:
              </span>
              <button
                onClick={() => setTypeFilter('')}
                className={`btn btn-sm ${typeFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All Activities
              </button>
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Log Activity
            </button>
          </div>
        </div>

        {/* Timeline Feed */}
        {loading ? (
          <LoadingSpinner message="Loading activity log..." fullHeight />
        ) : activities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <CalendarCheck2 size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
            <p style={{ color: '#64748b' }}>No activities found. Click 'Log Activity' to record client interactions.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((act) => (
              <div
                key={act._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  transition: 'transform 0.15s ease',
                }}
              >
                {/* Icon Box */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(act.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                        {act.title}
                      </h4>
                      <Badge variant={act.type}>{act.type}</Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {new Date(act.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteActivity(act._id)}
                        className="btn-icon"
                        title="Delete log entry"
                        style={{ color: '#94a3b8' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {act.description && (
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.375rem', lineHeight: 1.5 }}>
                      {act.description}
                    </p>
                  )}

                  {/* Association Pills */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                    {act.lead && (
                      <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                        Lead: {act.lead.name} {act.lead.company ? `(${act.lead.company})` : ''}
                      </span>
                    )}
                    {act.customer && (
                      <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>
                        Customer: {act.customer.name} {act.customer.company ? `(${act.customer.company})` : ''}
                      </span>
                    )}
                    <span style={{ color: '#64748b', padding: '0.2rem 0.5rem' }}>
                      Logged by: <strong style={{ color: '#0f172a' }}>{act.performedBy?.name || 'Representative'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Log Activity Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Log CRM Activity"
          footer={
            <>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateActivity} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Logging...' : 'Save Activity'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateActivity}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Activity Type *</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Title / Subject *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Intro discovery call"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Link to Lead (Optional)</label>
                <select
                  className="form-select"
                  value={formData.lead}
                  onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                >
                  <option value="">None</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} {l.company ? `(${l.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Link to Customer (Optional)</label>
                <select
                  className="form-select"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                >
                  <option value="">None</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Activity Notes & Discussion Summary</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Details of what was discussed, next steps agreed upon..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Activities;
