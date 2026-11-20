import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { leadApi } from '../api/leadApi';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const STAGES = [
  { id: 'New', label: 'New Lead', color: '#94a3b8' },
  { id: 'Contacted', label: 'Contacted', color: '#38bdf8' },
  { id: 'Qualified', label: 'Qualified', color: '#0284c7' },
  { id: 'Proposal Sent', label: 'Proposal Sent', color: '#6366f1' },
  { id: 'Negotiation', label: 'Negotiation', color: '#f59e0b' },
  { id: 'Won', label: 'Closed Won', color: '#10b981' },
  { id: 'Lost', label: 'Closed Lost', color: '#ef4444' },
];

export const Pipeline = () => {
  const { setSidebarOpen } = useOutletContext();
  const { toast } = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Lead Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    dealValue: 10000,
    status: 'New',
    source: 'Website',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await leadApi.getLeads();
      if (res.success) {
        setLeads(res.leads);
      }
    } catch (err) {
      toast.error('Failed to load pipeline: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageChange = async (leadId, nextStatus) => {
    try {
      const res = await leadApi.updateLead(leadId, { status: nextStatus });
      if (res.success) {
        toast.success(`Deal moved to stage: ${nextStatus}`);
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, status: nextStatus } : l))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to advance stage');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Lead name is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await leadApi.createLead({
        ...formData,
        dealValue: Number(formData.dealValue) || 0,
      });
      if (res.success) {
        toast.success('Lead added to pipeline');
        setIsModalOpen(false);
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          dealValue: 10000,
          status: 'New',
          source: 'Website',
        });
        fetchLeads();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Group leads by stage
  const groupedLeads = STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter((l) => l.status === stage.id);
    return acc;
  }, {});

  const totalPipelineValue = leads
    .filter((l) => l.status !== 'Won' && l.status !== 'Lost')
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);

  const totalWonValue = leads
    .filter((l) => l.status === 'Won')
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);

  return (
    <>
      <Navbar
        title="Sales Pipeline Stages"
        subtitle="Visual deal workflow and pipeline progression"
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="page-body">
        {/* Header Summary Bar */}
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Deals in Pipeline
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatCurrency(totalPipelineValue)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Won Revenue
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                {formatCurrency(totalWonValue)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button onClick={fetchLeads} className="btn btn-secondary btn-sm" title="Refresh Pipeline">
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> New Opportunity
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading sales pipeline stages..." fullHeight />
        ) : (
          /* Kanban Board Columns */
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
              alignItems: 'flex-start',
            }}
          >
            {STAGES.map((stage, stageIdx) => {
              const stageDeals = groupedLeads[stage.id] || [];
              const stageValue = stageDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);

              return (
                <div
                  key={stage.id}
                  style={{
                    flex: '0 0 290px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 220px)',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      borderTopLeftRadius: 'var(--radius-md)',
                      borderTopRightRadius: 'var(--radius-md)',
                      borderTop: `3px solid ${stage.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                        {stage.label}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: '#e2e8f0',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '9999px',
                          color: '#475569',
                        }}
                      >
                        {stageDeals.length}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                      {formatCurrency(stageValue)}
                    </div>
                  </div>

                  {/* Deals Cards Container */}
                  <div
                    style={{
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      overflowY: 'auto',
                      flex: 1,
                    }}
                  >
                    {stageDeals.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem 1rem',
                          textAlign: 'center',
                          color: '#94a3b8',
                          fontSize: '0.8125rem',
                          border: '1px dashed #cbd5e1',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        No deals in this stage
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal._id}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #e2e8f0',
                            boxShadow: 'var(--shadow-xs)',
                            padding: '0.875rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                              {deal.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {deal.company || 'Direct Contact'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0284c7' }}>
                              {formatCurrency(deal.dealValue)}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                              {deal.source || 'Website'}
                            </span>
                          </div>

                          {/* Quick Stage Transitions */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9' }}>
                            {stageIdx > 0 ? (
                              <button
                                onClick={() => handleStageChange(deal._id, STAGES[stageIdx - 1].id)}
                                className="btn-icon"
                                title={`Move back to ${STAGES[stageIdx - 1].label}`}
                                style={{ padding: '3px', fontSize: '0.6875rem' }}
                              >
                                <ChevronLeft size={14} /> Back
                              </button>
                            ) : (
                              <div />
                            )}

                            {stageIdx < STAGES.length - 1 && (
                              <button
                                onClick={() => handleStageChange(deal._id, STAGES[stageIdx + 1].id)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
                                title={`Advance to ${STAGES[stageIdx + 1].label}`}
                              >
                                Advance <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Deal Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Deal to Sales Pipeline"
          footer={
            <>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateLead} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Adding...' : 'Add Deal'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateLead}>
            <div className="form-group">
              <label className="form-label">Deal / Opportunity Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Enterprise Software License"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Global Logistics Inc"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Deal Value ($)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-input"
                  value={formData.dealValue}
                  onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="buyer@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Stage</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Pipeline;
