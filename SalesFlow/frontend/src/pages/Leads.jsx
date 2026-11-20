import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { leadApi } from '../api/leadApi';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

const SOURCE_OPTIONS = [
  'Website',
  'Referral',
  'Cold Call',
  'Social Media',
  'Advertisement',
  'Email Campaign',
  'Other',
];

export const Leads = () => {
  const { setSidebarOpen } = useOutletContext();
  const { toast } = useToast();

  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
    dealValue: 0,
    assignedTo: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;

      const res = await leadApi.getLeads(params);
      if (res.success) {
        setLeads(res.leads);
      }
    } catch (err) {
      toast.error('Failed to load leads: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authApi.getUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, [statusFilter, sourceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      dealValue: lead.dealValue || 0,
      assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Lead name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...formData, dealValue: Number(formData.dealValue) || 0 };
      if (!payload.assignedTo) delete payload.assignedTo;

      const res = await leadApi.createLead(payload);
      if (res.success) {
        toast.success(`Lead '${formData.name}' created successfully`);
        setIsAddModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Lead name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...formData, dealValue: Number(formData.dealValue) || 0 };
      if (!payload.assignedTo) delete payload.assignedTo;

      const res = await leadApi.updateLead(selectedLead._id, payload);
      if (res.success) {
        toast.success(`Lead '${formData.name}' updated`);
        setIsEditModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      const res = await leadApi.updateLead(leadId, { status: newStatus });
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteLead = async () => {
    try {
      setSubmitting(true);
      const res = await leadApi.deleteLead(selectedLead._id);
      if (res.success) {
        toast.success('Lead deleted successfully');
        setIsDeleteModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
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

  const columns = [
    {
      header: 'Lead Name & Company',
      accessor: 'name',
      render: (lead) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {lead.company || 'Individual Prospect'}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      render: (lead) => (
        <div style={{ fontSize: '0.8125rem' }}>
          {lead.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
              <Mail size={13} color="#94a3b8" /> {lead.email}
            </div>
          )}
          {lead.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <Phone size={13} color="#94a3b8" /> {lead.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Deal Value',
      accessor: 'dealValue',
      render: (lead) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {formatCurrency(lead.dealValue)}
        </span>
      ),
    },
    {
      header: 'Source',
      accessor: 'source',
      render: (lead) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {lead.source || 'Website'}
        </span>
      ),
    },
    {
      header: 'Status Stage',
      accessor: 'status',
      render: (lead) => (
        <select
          value={lead.status}
          onChange={(e) => handleQuickStatusChange(lead._id, e.target.value)}
          className="form-select"
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            width: 'auto',
            borderRadius: '9999px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Assigned Representative',
      accessor: 'assignedTo',
      render: (lead) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
          <UserCheck size={14} color="#0284c7" />
          <span>{lead.assignedTo?.name || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (lead) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
          <button
            onClick={() => openEditModal(lead)}
            className="btn-icon"
            title="Edit Lead"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => openDeleteModal(lead)}
            className="btn-icon"
            style={{ color: 'var(--danger)' }}
            title="Delete Lead"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar
        title="Leads Management"
        subtitle="Track, qualify, and convert prospective sales opportunities"
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="page-body">
        {/* Controls Bar */}
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                <input
                  type="text"
                  placeholder="Search by name, company, email..."
                  className="form-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">
                Search
              </button>
            </form>

            {/* Filter Dropdowns & Add Button */}
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
              >
                <option value="">All Sources</option>
                {SOURCE_OPTIONS.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>

              <button onClick={openAddModal} className="btn btn-primary btn-sm">
                <Plus size={15} /> Add New Lead
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <DataTable
          columns={columns}
          data={leads}
          loading={loading}
          emptyMessage="No leads found matching your criteria. Click 'Add New Lead' to create one."
        />

        {/* Add Lead Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Lead"
          footer={
            <>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateLead} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Creating...' : 'Create Lead'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateLead}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. john@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1-555-0100"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Deal Value ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-input"
                  placeholder="25000"
                  value={formData.dealValue}
                  onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status Stage</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Lead Source</label>
                <select
                  className="form-select"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  {SOURCE_OPTIONS.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <option value="">Default (Me)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </Modal>

        {/* Edit Lead Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Lead: ${selectedLead?.name}`}
          footer={
            <>
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateLead} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleUpdateLead}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Deal Value ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-input"
                  value={formData.dealValue}
                  onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status Stage</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Lead Source</label>
                <select
                  className="form-select"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  {SOURCE_OPTIONS.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select
                  className="form-select"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <option value="">Default (Me)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Lead Deletion"
          maxWidth="440px"
          footer={
            <>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteLead} disabled={submitting} className="btn btn-danger">
                {submitting ? 'Deleting...' : 'Delete Lead'}
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Are you sure you want to delete lead{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{selectedLead?.name}</strong>?
            This will permanently remove the lead and all associated activities from MongoDB Atlas.
          </p>
        </Modal>
      </div>
    </>
  );
};

export default Leads;
