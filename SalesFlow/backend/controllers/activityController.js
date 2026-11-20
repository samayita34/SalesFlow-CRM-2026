const Activity = require('../models/Activity');

// @desc    Get activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const { lead, customer, type, limit } = req.query;

    const query = {};
    if (lead) query.lead = lead;
    if (customer) query.customer = customer;
    if (type) query.type = type;

    const maxResults = limit ? parseInt(limit, 10) : 50;

    const activities = await Activity.find(query)
      .populate('performedBy', 'name email role')
      .populate('lead', 'name company status')
      .populate('customer', 'name company')
      .sort({ createdAt: -1 })
      .limit(maxResults);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res, next) => {
  try {
    const { type, title, description, lead, customer, dueDate, status } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Activity type and title are required',
      });
    }

    const activity = await Activity.create({
      type,
      title,
      description,
      lead: lead || null,
      customer: customer || null,
      performedBy: req.user._id,
      dueDate: dueDate || null,
      status: status || 'Completed',
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate('performedBy', 'name email role')
      .populate('lead', 'name company')
      .populate('customer', 'name company');

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      activity: populatedActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: `Activity not found with id ${req.params.id}`,
      });
    }

    // Role check: Only admin or the person who logged it can delete
    if (
      req.user.role !== 'admin' &&
      activity.performedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this activity',
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
  createActivity,
  deleteActivity,
};
