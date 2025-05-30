// models/schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  subject: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: "09:00"
  },
  endTime: {
    type: String,
    required: true, // Format: "10:00"
  },
  teacher: {
    type: String,
    required: false,
  },
  room: {
    type: String,
    required: true,
  },
  recurrence:{
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'none', 'once'],
    default: 'once',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: false,
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  // Who created this announcement
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
