import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { customerApi } from '../api/customerApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const STATUSES = ['Active', 'Inactive', 'Prospect', 'Churned'];

export const Customers = () => {
  const { setSidebarOpen } = useOutletContext();
  const { user } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const initialForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active',
    totalDeals: 1,
    totalSpent: 0,
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await customerApi.getCustomers(params);
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      toast.error('Failed to load customers: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Customer name and email are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        totalDeals: Number(formData.totalDeals) || 0,
        totalSpent: Number(formData.totalSpent) || 0,
      };
      const res = await customerApi.createCustomer(payload);
      if (res.success) {
        toast.success(`Customer '${formData.name}' created`);
        setIsAddModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        totalDeals: Number(formData.totalDeals) || 0,
        totalSpent: Number(formData.totalSpent) || 0,
      };
      const res = await customerApi.updateCustomer(selectedCustomer._id, payload);
      if (res.success) {
        toast.success(`Customer '${formData.name}' updated`);
        setIsEditModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      setSubmitting(true);
      const res = await customerApi.deleteCustomer(selectedCustomer._id);
      if (res.success) {
        toast.success('Customer deleted successfully');
        setIsDeleteModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer (requires Admin)');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (c) => {
    setSelectedCustomer(c);
    setFormData({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      status: c.status || 'Active',
      totalDeals: c.totalDeals || 0,
      totalSpent: c.totalSpent || 0,
      notes: c.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (c) => {
    setSelectedCustomer(c);
    setIsDeleteModalOpen(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const activeCount = customers.filter((c) => c.status === 'Active').length;

  const columns = [
    {
      header: 'Customer & Organization',
      accessor: 'name',
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {c.company || 'Private Client'}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Email',
      accessor: 'email',
      render: (c) => (
        <span style={{ fontSize: '0.8125rem', color: '#334155' }}>
          {c.email}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (c) => <Badge variant={c.status}>{c.status}</Badge>,
    },
    {
      header: 'Total Deals',
      accessor: 'totalDeals',
      render: (c) => <span>{c.totalDeals || 0} deals</span>,
    },
    {
      header: 'Lifetime Value (LTV)',
      accessor: 'totalSpent',
      render: (c) => (
        <span style={{ fontWeight: 600, color: '#0284c7' }}>
          {formatCurrency(c.totalSpent)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
          <button onClick={() => openEditModal(c)} className="btn-icon" title="Edit Customer">
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => openDeleteModal(c)}
            className="btn-icon"
            style={{ color: 'var(--danger)' }}
            title="Delete Customer (Admin only)"
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
        title="Customer Accounts"
        subtitle="Manage converted accounts, contract value, and customer history"
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="page-body">
        {/* KPI Mini Row */}
        <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
          <StatCard
            title="Total Customers"
            value={customers.length}
            icon={Building2}
            subtitle={`${activeCount} active client accounts`}
            color="#0284c7"
          />
          <StatCard
            title="Customer Lifetime Value"
            value={formatCurrency(totalSpentAll)}
            icon={DollarSign}
            subtitle="Total revenue generated"
            color="#10b981"
          />
          <StatCard
            title="Avg Revenue / Client"
            value={formatCurrency(customers.length > 0 ? totalSpentAll / customers.length : 0)}
            icon={TrendingUp}
            subtitle="Average account spend"
            color="#6366f1"
          />
        </div>

        {/* Search & Actions Bar */}
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', justifyContent: 'space-between' }}>
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

            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.45rem 0.75rem' }}
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }} className="btn btn-primary btn-sm">
                <Plus size={15} /> Add Customer
              </button>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customer accounts found. Click 'Add Customer' to create a new client record."
        />

        {/* Add Customer Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Customer"
          footer={
            <>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateCustomer} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Creating...' : 'Create Customer'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateCustomer}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TechCorp Solutions"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="alex@techcorp.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1-555-0188"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Deals</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.totalDeals}
                  onChange={(e) => setFormData({ ...formData, totalDeals: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Revenue ($)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-input"
                  value={formData.totalSpent}
                  onChange={(e) => setFormData({ ...formData, totalSpent: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Key requirements, client preferences, or contract details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Edit Customer Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Customer: ${selectedCustomer?.name}`}
          footer={
            <>
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateCustomer} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleUpdateCustomer}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
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
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
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

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Deals</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.totalDeals}
                  onChange={(e) => setFormData({ ...formData, totalDeals: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Revenue ($)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-input"
                  value={formData.totalSpent}
                  onChange={(e) => setFormData({ ...formData, totalSpent: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Notes</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Customer Deletion"
          maxWidth="440px"
          footer={
            <>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteCustomer} disabled={submitting} className="btn btn-danger">
                {submitting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Are you sure you want to delete customer account{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomer?.name}</strong>?
            {user?.role !== 'admin' && (
              <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--danger)', fontWeight: 500 }}>
                Note: Customer deletion requires Administrator permissions.
              </span>
            )}
          </p>
        </Modal>
      </div>
    </>
  );
};

export default Customers;
