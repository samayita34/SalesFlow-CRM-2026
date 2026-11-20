const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');

// @desc    Get dashboard analytics & statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Overall counts
    const totalLeads = await Lead.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // 2. Aggregate deals value
    const dealValueStats = await Lead.aggregate([
      {
        $group: {
          _id: null,
          totalDealValue: { $sum: '$dealValue' },
          wonDealValue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Won'] }, '$dealValue', 0],
            },
          },
          pipelineValue: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$status', 'Won'] }, { $ne: ['$status', 'Lost'] }] },
                '$dealValue',
                0,
              ],
            },
          },
        },
      },
    ]);

    const totalDealValue = dealValueStats[0]?.totalDealValue || 0;
    const wonDealValue = dealValueStats[0]?.wonDealValue || 0;
    const pipelineValue = dealValueStats[0]?.pipelineValue || 0;

    // 3. Status breakdown
    const leadsByStatusRaw = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$dealValue' },
        },
      },
    ]);

    const leadsByStatus = leadsByStatusRaw.map((item) => ({
      status: item._id,
      count: item.count,
      totalValue: item.totalValue,
    }));

    // Calculate won leads and conversion rate
    const wonCount = leadsByStatus.find((s) => s.status === 'Won')?.count || 0;
    const conversionRate = totalLeads > 0 ? Number(((wonCount / totalLeads) * 100).toFixed(1)) : 0;

    // 4. Source breakdown
    const leadsBySourceRaw = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          totalValue: { $sum: '$dealValue' },
        },
      },
    ]);

    const leadsBySource = leadsBySourceRaw.map((item) => ({
      source: item._id,
      count: item.count,
      totalValue: item.totalValue,
    }));

    // 5. Customer statistics
    const customerStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalSpent' },
          totalCustomerDeals: { $sum: '$totalDeals' },
        },
      },
    ]);

    const totalCustomerRevenue = customerStats[0]?.totalRevenue || 0;

    // 6. Recent Leads
    const recentLeads = await Lead.find()
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Recent Activities
    const recentActivities = await Activity.find()
      .populate('performedBy', 'name email')
      .populate('lead', 'name company')
      .populate('customer', 'name company')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalLeads,
          totalCustomers,
          totalDealValue,
          wonDealValue,
          pipelineValue,
          totalCustomerRevenue,
          conversionRate,
        },
        leadsByStatus,
        leadsBySource,
        recentLeads,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
