// controllers/announcementController.js
const Announcement = require('../models/announcement');

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    console.log('Create announcement request body:', req.body);
    console.log('User from token:', req.user);

    if (!req.user || (req.user.role !== 'cr' && req.user.role !== 'teacher')) {
      return res.status(403).json({ message: 'Only CR and Teachers can create announcements' });
    }
    // Create announcement with user's section info
    const announcementData = {
      ...req.body,
      section: req.user.section,
      year: req.user.year,
      department: req.user.department
    };
    const newAnnouncement = new Announcement(announcementData);
    const saved = await newAnnouncement.save();

    // Populate the saved announcement for response
    const populatedAnnouncement = await Announcement.findById(saved._id)
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code');

    res.status(201).json(populatedAnnouncement);
  } catch (err) {
    console.error('Error in createAnnouncement:', err.message);
    res.status(500).json({ message: 'Error creating announcement' , error: err.message  });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }
    const announcements = await Announcement.find({ section: req.user.section })
      .sort({ createdAt: -1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const announcement = await Announcement.findOne({ 
      _id: req.params.id, 
      section: req.user.section 
    })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    console.error('Error retrieving announcement:', error);
    res.status(500).json({ message: 'Error retrieving announcement', error: error.message });
  }
};

exports.getAnnouncementsByAudience = async (req, res) => {
    try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const { audience } = req.params;
    const announcements = await Announcement.find({ 
      audience: audience,
      section: req.user.section 
    })
      .sort({ createdAt: -1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements by audience:', error);
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};

// Get announcements by category (within user's section)
exports.getAnnouncementsByCategory = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const { category } = req.params;
    const announcements = await Announcement.find({ 
      category: category,
      section: req.user.section 
    })
      .sort({ createdAt: -1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements by category:', error);
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};
// Update an announcement (Only creator or CR can update)
exports.updateAnnouncement = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    // Find the announcement
    const announcement = await Announcement.findOne({ 
      _id: req.params.id, 
      section: req.user.section 
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can update (creator or CR)
     if (req.user.role !== 'cr' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    const updated = await Announcement.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    )
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
};

// Delete an announcement (Only creator or CR can delete)
exports.deleteAnnouncement = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    // Find the announcement
    const announcement = await Announcement.findOne({ 
      _id: req.params.id, 
      section: req.user.section 
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user can delete (creator or CR)
    const canDelete = announcement.author.toString() === req.user.id || req.user.role === 'cr';
    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
};

// Get urgent announcements for user's section
exports.getUrgentAnnouncements = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const announcements = await Announcement.find({ 
      urgent: true,
      section: req.user.section 
    })
      .sort({ createdAt: -1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')

    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching urgent announcements:', error);
    res.status(500).json({ message: 'Error fetching urgent announcements', error: error.message });
  }
};