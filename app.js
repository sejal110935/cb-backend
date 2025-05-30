// app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// DB connection
const connectDB = require('./config/db'); // Add this line

// Routes
const scheduleRoutes = require('./routes/scheduleroutes');
const announcementRoutes = require('./routes/announcementroutes');
const reminderRoutes = require('./routes/reminderroutes');
const authRoutes = require('./routes/authroutes');
const userRoutes = require('./routes/userroutes');
const authMiddleware = require('./middleware/authmiddleware');
dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://classbuddy-one.vercel.app', // ✅ Replace with your actual Vercel frontend URL
];

app.use(cors({
  origin: allowedOrigins, // Your Next.js app URL
  credentials: true
}));
app.use(express.json());

// Routes middleware
app.use('/api/schedules', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
