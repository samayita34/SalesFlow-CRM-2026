const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a lead name'],
      trim: true,
    },
    email: {
      type: String,
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
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Advertisement', 'Email Campaign', 'Other'],
        message: '{VALUE} is not a supported lead source',
      },
      default: 'Website',
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
        message: '{VALUE} is not a valid lead status',
      },
      default: 'New',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dealValue: {
      type: Number,
      default: 0,
      min: [0, 'Deal value cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lead', leadSchema);
