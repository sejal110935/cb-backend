const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ------------------ USER SCHEMA ----------------
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'cr', 'teacher'],
    default: 'student'
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section"
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
}, { timestamps: true });

// ------------------ DEPARTMENT SCHEMA ------------------
const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Optional but recommended to prevent duplicates
  }
});

// ------------------ YEAR SCHEMA ------------------
const YearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  }
});

// ------------------ SECTION SCHEMA ------------
const SectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
    required: true
  },
  cr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  }
});

// Add compound index to ensure unique section per year per department
SectionSchema.index({ name: 1, year: 1, department: 1 }, { unique: true });
YearSchema.index({ year: 1, department: 1 }, { unique: true });

// ------------------ PASSWORD HASH MIDDLEWARE ------------------
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ------------------ PASSWORD MATCH METHOD ------------------
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ------------------ EXPORTING MODELS ------------------
const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', DepartmentSchema);
const Year = mongoose.model('Year', YearSchema);
const Section = mongoose.model('Section', SectionSchema);

module.exports = {
  User,
  Department,
  Year,
  Section
};
