const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

// @desc    Get all leads (with filtering, search, and sorting)
// @route   GET /api/leads
// @access  Private (Admin & Employee)
const getLeads = async (req, res, next) => {
  try {
    const { status, source, assignedTo, search, sortBy, sortOrder } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by source
    if (source) {
      query.source = source;
    }

    // Filter by assigned user
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Role-based visibility: employees can optionally be restricted or view their own,
    // but default behavior allows employee to view all leads or filter by own assignedTo
    if (req.user.role === 'employee' && req.query.mine === 'true') {
      query.assignedTo = req.user._id;
    }

    // Search by name, company, or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private (Admin & Employee)
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      'assignedTo',
      'name email role'
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private (Admin & Employee)
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source, status, assignedTo, dealValue } =
      req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Lead name is required',
      });
    }

    // If assignedTo is not specified, default to current user if employee
    const assignedUser = assignedTo || req.user._id;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source: source || 'Website',
      status: status || 'New',
      assignedTo: assignedUser,
      dealValue: dealValue || 0,
    });

    // Auto-create Activity log
    await Activity.create({
      type: 'Note',
      title: 'Lead Created',
      description: `Lead '${lead.name}' created by ${req.user.name}`,
      lead: lead._id,
      performedBy: req.user._id,
      status: 'Completed',
    });

    const populatedLead = await Lead.findById(lead._id).populate(
      'assignedTo',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private (Admin & Employee)
const updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead not found with id ${req.params.id}`,
      });
    }

    const previousStatus = lead.status;

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email role');

    // If status was changed, log an activity
    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        type: 'Status Change',
        title: `Status updated to ${lead.status}`,
        description: `Lead status changed from ${previousStatus} to ${lead.status} by ${req.user.name}`,
        lead: lead._id,
        performedBy: req.user._id,
        status: 'Completed',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin or Assigned User)
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead not found with id ${req.params.id}`,
      });
    }

    // If employee, only allow deleting if assigned to them or if role is admin
    if (
      req.user.role !== 'admin' &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Employees can only delete leads assigned to them',
      });
    }

    await lead.deleteOne();

    // Clean up or keep activities
    await Activity.deleteMany({ lead: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};
