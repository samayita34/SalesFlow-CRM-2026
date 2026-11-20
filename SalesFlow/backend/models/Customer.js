const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add customer name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add customer email'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'Prospect', 'Churned'],
        message: '{VALUE} is not a valid customer status',
      },
      default: 'Active',
    },
    totalDeals: {
      type: Number,
      default: 0,
      min: [0, 'Total deals cannot be negative'],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Total spent cannot be negative'],
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', customerSchema);
