const Announcement = require('../models/announcement');
const Reminder = require('../models/reminder');
const Schedule = require('../models/schedule');
const User = require('../models/user');

// ✅ GET /api/user/profile/id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // populated by protect middleware
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { name, email, role, section, department, year, createdAt, updatedAt } = user;

    res.status(200).json({ name, email, role, section, department, year, createdAt, updatedAt });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile", error: err.message });
  }
};
// ✅ GET /api/user/stats
const getUserStats = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.section) {
      return res.status(400).json({ message: "User or section not found" });
    }

    const [announcementCount, reminderCount, scheduleCount] = await Promise.all([
      Announcement.countDocuments({ section: user.section }),
      Reminder.countDocuments({ section: user.section }),
      Schedule.countDocuments({ section: user.section })
    ]);

    res.status(200).json({
      totalAnnouncements: announcementCount,
      totalReminders: reminderCount,
      totalSchedules: scheduleCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user stats", error: err.message });
  }
};

// ✅ GET /api/user/enrolled-classes
const getEnrolledClasses = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.section) {
      return res.status(400).json({ message: "User section not found" });
    }

    console.log("Fetching classes for user:", user.email, "Section:", user.section);

    // Get today's day name
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const todayName = dayNames[today.getDay()];

    console.log("Today is:", todayName);

    // Find schedules for today based on day name (not date)
    const enrolledClasses = await Schedule.find({
      section: user.section,
      day: { $regex: new RegExp(todayName, 'i') } // Case-insensitive match
    }).sort({ startTime: 1 });

    console.log("Found classes:", enrolledClasses.length);

    if (enrolledClasses.length === 0) {
      return res.status(200).json([]);
    }

    // Get today's date in YYYY-MM-DD format
    const todayDateString = today.toISOString().split('T')[0];

    const formatted = enrolledClasses.map(cls => {
      // Create proper datetime strings
      const startDateTime = `${todayDateString}T${cls.startTime}:00`;
      const endDateTime = `${todayDateString}T${cls.endTime}:00`;

      // Map subjects to icons and colors
      const getSubjectIcon = (subject) => {
        const subjectMap = {
          'Cloud Computing': 'BookOpen',
          'Computer Networks': 'BookOpen',
          'DataBase Management System': 'BookOpen',
          'Advanced Data Structure': 'BookOpen',
          'Service Oriented Architecture': 'BookOpen',
          'Object Oriented Programming': 'BookOpen',
          'Other': 'BookOpen',
        };
        
        const lowerSubject = subject.toLowerCase();
        for (const [key, icon] of Object.entries(subjectMap)) {
          if (lowerSubject.includes(key)) {
            return icon;
          }
        }
        return 'BookOpen';
      };

      const getSubjectColor = (subject) => {
        const colorMap = {
          'Cloud Computing': 'blue',
          'Computer Networks': 'green',
          'DataBase Management System': 'purple',
          'Advanced Data Structure': 'orange',
          'Service Oriented Architecture': 'orange',
          'Object Oriented Programmingr': 'indigo',
          'programming': 'indigo',
          'Other': 'red',
        };
        
        const lowerSubject = subject.toLowerCase();
        for (const [key, color] of Object.entries(colorMap)) {
          if (lowerSubject.includes(key)) {
            return color;
          }
        }
        return 'blue';
      };

      return {
        subject: cls.subject,
        location: cls.room || 'TBA',
        startTime: startDateTime,
        endTime: endDateTime,
        professor: cls.teacher || 'TBA',
        icon: getSubjectIcon(cls.subject),
        color: getSubjectColor(cls.subject),
      };
    });

    console.log("Formatted classes:", formatted);
    res.status(200).json(formatted);

  } catch (err) {
    console.error("Error in getEnrolledClasses:", err);
    res.status(500).json({ message: "Failed to fetch enrolled classes", error: err.message });
  }
};


// ✅ GET /api/user/deadlines
const getUpcomingAssignments = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.section) {
      return res.status(400).json({ message: "User or section not found" });
    }

    const today = new Date();
    const upcomingAssignments = await Reminder.find({
      section: user.section,
      dueDate: { $gte: today },
      isCompleted: false
    }).sort({ dueDate: 1 });

    const formatted = upcomingAssignments.map(r => ({
      title: r.title,
      subject: r.relatedTo || 'Unknown',
      dueDate: r.dueDate,
      priority: r.priority
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch upcoming deadlines", error: err.message });
  }
};

module.exports = {
  getUserProfile,
  getUserStats,
  getEnrolledClasses,
  getUpcomingAssignments
};
