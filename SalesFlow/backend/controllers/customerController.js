const Customer = require('../models/Customer');
const Activity = require('../models/Activity');

// @desc    Get all customers (with filtering, search, and sorting)
// @route   GET /api/customers
// @access  Private (Admin & Employee)
const getCustomers = async (req, res, next) => {
  try {
    const { status, assignedTo, search, sortBy, sortOrder } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email role')
      .populate('leadId', 'name dealValue status')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private (Admin & Employee)
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('leadId', 'name dealValue status');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private (Admin & Employee)
const createCustomer = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      status,
      totalDeals,
      totalSpent,
      leadId,
      assignedTo,
      notes,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required',
      });
    }

    const assignedUser = assignedTo || req.user._id;

    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      phone,
      company,
      status: status || 'Active',
      totalDeals: totalDeals || 0,
      totalSpent: totalSpent || 0,
      leadId: leadId || null,
      assignedTo: assignedUser,
      notes: notes || '',
    });

    await Activity.create({
      type: 'Note',
      title: 'Customer Added',
      description: `Customer '${customer.name}' created by ${req.user.name}`,
      customer: customer._id,
      performedBy: req.user._id,
      status: 'Completed',
    });

    const populatedCustomer = await Customer.findById(customer._id)
      .populate('assignedTo', 'name email role')
      .populate('leadId', 'name dealValue status');

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: populatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private (Admin & Employee)
const updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with id ${req.params.id}`,
      });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email role')
      .populate('leadId', 'name dealValue status');

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin Only)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with id ${req.params.id}`,
      });
    }

    await customer.deleteOne();
    await Activity.deleteMany({ customer: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
