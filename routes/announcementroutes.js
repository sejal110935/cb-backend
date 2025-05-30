// routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementcontroller');
const { protect, authorizeRoles } = require('../middleware/authmiddleware');

// Create
router.post('/create',protect, authorizeRoles('teacher', 'cr'), announcementController.createAnnouncement);

// Read all
router.get('/',protect, announcementController.getAllAnnouncements);

// Read one
router.get('/:id',protect, announcementController.getAnnouncementById);

// Get announcements by target audience
router.get('/audience/:audience', announcementController.getAnnouncementsByAudience);

// Update
router.put('/:id',protect, authorizeRoles('teacher', 'cr'), announcementController.updateAnnouncement);

// Delete
router.delete('/:id',protect, authorizeRoles('teacher', 'cr'), announcementController.deleteAnnouncement);

//Urgent
router.delete('/urgent',protect, announcementController.getUrgentAnnouncements)

//Category
router.get('/category/:category',protect, announcementController.getAnnouncementsByCategory)



module.exports = router;
