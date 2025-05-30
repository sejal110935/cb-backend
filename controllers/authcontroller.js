const { User, Department, Year, Section } = require('../models/user'); // Fixed: import from user.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config()

// Generate JWT Token
// Generate JWT Token - FIXED VERSION
const generateToken = (user) => {
  console.log('Generating token for user:', {
    id: user._id,
    role: user.role,
    section: user.section,
    year: user.year,
    department: user.department
  });

  return jwt.sign(
    { 
      id: user._id.toString(),
      role: user.role,
      // Handle both populated objects and ObjectId strings
      section: user.section?._id?.toString() || user.section?.toString(),
      year: user.year?._id?.toString() || user.year?.toString(),
      department: user.department?._id?.toString() || user.department?.toString()
    },
    process.env.JWT_SECRET,
    { expiresIn: '10d' }
  );
};

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, departmentName, yearValue, sectionName } = req.body;
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    
    // Step 1: Get department
    const department = await Department.findOne({ name: departmentName });
    if (!department) return res.status(400).json({ message: 'Department not found' });

    const yearMap = {
      '1ST': 'FIRST',
      'FIRST': 'FIRST',
      '1': 'FIRST',
      '2': 'SECOND',
      '2ND': 'SECOND',
      'SECOND': 'SECOND',
      '3': 'THIRD',
      '3RD': 'THIRD',
      'THIRD': 'THIRD',
      '4': 'FOURTH',
      '4TH': 'FOURTH',
      'FOURTH': 'FOURTH'
    };
    const normalizedInput = yearValue.trim().toUpperCase();
    const normalizedYear = yearMap[normalizedInput];
    const year = await Year.findOne({ year: normalizedYear, department: department._id });
    if (!year) return res.status(400).json({ message: 'Year not found for this department' });

    // Step 3: Get section in that year
    const section = await Section.findOne({ name: sectionName, year: year._id });
    if (!section) return res.status(400).json({ message: 'Section not found for this year' });

    // Step 4: Create user
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role,
      section: section._id,
      year: year._id,
      department: department._id
    });

    // Step 5: If user is CR, update section's CR field
    if (role === 'cr') {
      await Section.findByIdAndUpdate(section._id, { cr: user._id });
    }

    // Create a user object with populated fields for token generation
    const userForToken = {
      _id: user._id,
      role: user.role,
      section: { _id: section._id },
      year: { _id: year._id },
      department: { _id: department._id }
    };

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      section: section._id,
      year: year._id,
      department: department._id,
      token: generateToken(userForToken),
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login - FIXED VERSION
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and check password with populated fields
    const user = await User.findOne({ email })
      .populate('section')
      .populate('year') 
      .populate('department');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Ensure all required fields are present for token generation
    if (!user.section || !user.year || !user.department) {
      return res.status(500).json({ message: 'User data incomplete - missing section, year, or department' });
    }
    // Log the user object before token generation
    console.log('User object for token generation:', {
      _id: user._id,
      role: user.role,
      section: user.section._id,
      year: user.year._id,
      department: user.department._id
    });
    // Create user object with ObjectIds for token generation
    const userForToken = {
      _id: user._id,
      role: user.role,
      section: user.section._id,
      year: user.year._id,
      department: user.department._id
    };

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      section: user.section._id,
      year: user.year._id,
      department: user.department._id,
      token: generateToken(userForToken),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};