// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedulecontroller');
const { protect, authorizeRoles } = require('../middleware/authmiddleware');

// Create
router.post('/create',protect, authorizeRoles('teacher', 'cr'), scheduleController.createSchedule);

// Read all schedules for a specific section
router.get('/daily/date/:date',protect, scheduleController.getDailySchedules);
// Read all
router.get('/',protect, scheduleController.getAllSchedules);

// Read one
router.get('/:id',protect, scheduleController.getScheduleById);

// Get schedules by day
router.get('/day/:day',protect, scheduleController.getSchedulesByDay);

// Get schedules by teacher
router.get('/teacher/:teacher',protect, scheduleController.getSchedulesByTeacher);

// Update
router.put('/:id',protect, authorizeRoles('teacher', 'cr'), scheduleController.updateSchedule);

// Delete
router.delete('/:id', protect, authorizeRoles('teacher', 'cr'), scheduleController.deleteSchedule);

module.exports = router;
