// models/announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: false,
  },
  urgent: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'event', 'other' , 'assignment', 'exam'],
    default: 'general',
   },
   audience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'parents'],
    default: 'all', 
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
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
