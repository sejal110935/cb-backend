// controllers/reminderController.js
const Reminder = require('../models/reminder');

// Create a reminder (Only CR and Teachers can create)
exports.createReminder = async (req, res) => {
  try {
    // Check required fields
    if (!req.body.title || !req.body.time || !req.body.relatedTo) {
      return res.status(400).json({ message: 'Missing required fields: title, time, relatedTo' });
    }

    // Check if user is authorized to create reminders
    if (!req.user || (req.user.role !== 'cr' && req.user.role !== 'teacher')) {
      return res.status(403).json({ message: 'Only CR and Teachers can create reminders' });
    }

    // Create reminder with user's section info
    const reminderData = {
      ...req.body,
      section: req.user.section,
      year: req.user.year,
      department: req.user.department,
      createdBy: req.user.id
    };

    const reminder = new Reminder(reminderData);
    const saved = await reminder.save();
    
    // Populate the saved reminder for response
    const populatedReminder = await Reminder.findById(saved._id)
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    res.status(201).json(populatedReminder);
  } catch (error) {
    console.error("Reminder creation failed:", error);
    res.status(500).json({ message: 'Failed to create reminder', error: error.message });
  }
};

// Get all reminders for user's section
exports.getAllReminders = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    // Fetch reminders only for user's section
    const reminders = await Reminder.find({ section: req.user.section })
      .sort({ date: 1, time: 1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Failed to fetch reminders', error: error.message });
  }
};

// Get single reminder by ID (must belong to user's section)
exports.getReminderById = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const reminder = await Reminder.findOne({ 
      _id: req.params.id, 
      section: req.user.section 
    })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json(reminder);
  } catch (error) {
    console.error('Error retrieving reminder:', error);
    res.status(500).json({ message: 'Error retrieving reminder', error: error.message });
  }
};

// Get reminders by priority (within user's section)
exports.getRemindersByPriority = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const { priority } = req.params;
    const reminders = await Reminder.find({ 
      priority: priority,
      section: req.user.section 
    })
      .sort({ date: 1, time: 1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by priority:', error);
    res.status(500).json({ message: 'Error fetching reminders', error: error.message });
  }
};

// Get reminders by subject (within user's section)
exports.getRemindersBySubject = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const { subject } = req.params;
    const reminders = await Reminder.find({ 
      relatedTo: subject,
      section: req.user.section 
    })
      .sort({ date: 1, time: 1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by subject:', error);
    res.status(500).json({ message: 'Error fetching reminders', error: error.message });
  }
};

// Get pending reminders (not completed) for user's section
exports.getPendingReminders = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const reminders = await Reminder.find({ 
      completed: false,
      section: req.user.section 
    })
      .sort({ date: 1, time: 1 })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    res.status(500).json({ message: 'Error fetching pending reminders', error: error.message });
  }
};

// Update reminder (Only creator or CR can update)
exports.updateReminder = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    // Find the reminder
    const reminder = await Reminder.findOne({ 
      _id: req.params.id, 
      section: req.user.section 
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check if user can update (creator or CR)
    const canUpdate = reminder.createdBy.toString() === req.user.id || req.user.role === 'cr';
    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this reminder' });
    }

    const updated = await Reminder.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    )
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    res.status(200).json(updated);
  }  catch (error) {
    res.status(500).json({ message: 'Error updating reminder status', error });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: "User section not found" })
    }

    // Find the REMINDER (not announcement)
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      section: req.user.section,
    })

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" })
    }

    // FIXED: Check if user can delete using reminder.createdBy (not announcement.createdBy)
    const canDelete = reminder.createdBy.toString() === req.user.id || req.user.role === "cr"
    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized to delete this reminder" })
    }

    await Reminder.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Reminder deleted successfully" })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    res.status(500).json({ message: "Error deleting reminder", error: error.message })
  }
};