const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['Call', 'Email', 'Meeting', 'Note', 'Task', 'Status Change'],
        message: '{VALUE} is not a valid activity type',
      },
      required: [true, 'Please specify an activity type'],
    },
    title: {
      type: String,
      required: [true, 'Please provide an activity title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must be linked to a user'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid activity status',
      },
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
