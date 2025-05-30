const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authmiddleware')
const { getUpcomingAssignments , getUserStats , getEnrolledClasses, getUserProfile} = require('../controllers/usercontroller');

router.get('/stats',protect, getUserStats);
router.get('/enrolled-classes', protect , getEnrolledClasses);
router.get('/assignments/upcoming',protect, getUpcomingAssignments);
router.get('/profile/:id',protect, getUserProfile);
module.exports = router;
