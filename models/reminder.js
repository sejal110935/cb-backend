// models/reminder.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: false,
  },
  completed: {
    type: Boolean,
    default: false,
    required: false,
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  relatedTo: {
    type: String,
    enum: ['Cloud Computing', 'Computer Networks', 'DataBase Management System', 'Advanced Data Structure', 'Service Oriented Architecture','Object Oriented Programming','Other' ],
    default: 'Other',
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  // Section-based segregation
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
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
  // Who created this reminder
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
