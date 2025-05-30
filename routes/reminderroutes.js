// routes/reminderRoutes.js
const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/remindercontroller');
const { protect, authorizeRoles } = require('../middleware/authmiddleware');

//create a reminder
router.post('/create', protect, authorizeRoles('teacher', 'cr'), reminderController.createReminder);

//get all reminders
router.get('/',protect, reminderController.getAllReminders);

//get a single reminder
router.get('/:id',protect, reminderController.getReminderById);

//get a single reminder priority
router.get('/priority/:priority',protect,reminderController.getRemindersByPriority);

//get reminder by subject
router.get('/subject/:subject',protect,reminderController.getRemindersBySubject);

//get reminders by pending
router.get('/pending', protect,reminderController.getPendingReminders);


//update a reminder
router.put('/:id', protect, authorizeRoles('teacher', 'cr'), reminderController.updateReminder);

//delete a reminder
router.delete('/:id', protect, authorizeRoles('teacher', 'cr'), reminderController.deleteReminder);

module.exports = router;
