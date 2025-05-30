const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  console.log('Backend received token:', token);
  console.log('Authorization Header:', req.headers.authorization);
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token content:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
   console.error('JWT Verification Error:', err.message);
   return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: 'Access Denied' });
    next();
  };
};
