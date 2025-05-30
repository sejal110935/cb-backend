const Schedule = require("../models/schedule")

// Add a new schedule - FIXED
exports.createSchedule = async (req, res) => {
  try {
    console.log("Create schedule request body:", req.body)
    console.log("User from token:", req.user)

    const { subject, startTime, endTime, day, room, recurrence, date, teacher } = req.body

    // Validate required fields
    if (!subject || !startTime || !endTime || !day || !room || !recurrence || !date) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Capitalize day to match enum
    const formattedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()

    const scheduleData = {
      ...req.body,
      day: formattedDay,
      section: req.user.section,
      year: req.user.year,
      department: req.user.department,
      createdBy: req.user.id,
    }

    const newSchedule = new Schedule(scheduleData)
    const saved = await newSchedule.save()

    // FIXED: Populate the saved SCHEDULE (not announcement)
    const populatedSchedule = await Schedule.findById(saved._id)
      .populate("section", "name")
      .populate("year", "year")
      .populate("department", "name code")
      .populate("createdBy", "name email role")

    res.status(201).json(populatedSchedule)
  } catch (error) {
    console.error("Schedule creation failed:", error)
    res.status(500).json({ message: "Error creating schedule", error: error.message })
  }
};

exports.getDailySchedules = async (req, res) => {
  try {
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ message: "Missing 'date' query parameter" })
    }

    const inputDate = new Date(date)
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" })
    }

    const dayStart = new Date(inputDate.setHours(0, 0, 0, 0))
    const dayEnd = new Date(inputDate.setHours(23, 59, 59, 999))

    const schedules = await Schedule.find({
      date: { $gte: dayStart, $lte: dayEnd },
      section: req.user.section,
    })
      .sort({ startTime: 1 })
      .populate("section", "name")
      .populate("year", "year")
      .populate("department", "name code")
      .populate("createdBy", "name email role")

    res.status(200).json(schedules)
  } catch (error) {
    console.error("Failed to fetch daily schedules:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
};

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: "User section not found" })
    }

    const schedules = await Schedule.find({ section: req.user.section })
      .lean()
      .populate("section", "name")
      .populate("year", "year")
      .populate("department", "name code")
      .populate("createdBy", "name email role")

    // FIXED: Return schedules in format expected by frontend
    const formattedSchedules = schedules.map((sch) => ({
      _id: sch._id,
      subject: sch.subject,
      room: sch.room,
      date: sch.date,
      startTime: sch.startTime,
      endTime: sch.endTime,
      day: sch.day,
      recurrence: sch.recurrence,
      teacher: sch.teacher,
      section: sch.section,
      year: sch.year,
      department: sch.department,
      createdBy: sch.createdBy,
      createdAt: sch.createdAt,
      updatedAt: sch.updatedAt,
    }))

    return res.status(200).json(formattedSchedules)
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }
    const schedule = await Schedule.findOne({ 
      _id: req.params.id, 
      section: req.user.section 
    })
      .populate('section', 'name')
      .populate('year', 'year')
      .populate('department', 'name code')
      .populate('createdBy', 'name email role');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedule', error });
  }
};

exports.getSchedulesByTeacher = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }

    const schedules = await Schedule.find({ teacher: req.params.teacher })
    .sort({ day: 1, startTime: 1 })
    .populate('section', 'name')
    .populate('year', 'year')
    .populate('department', 'name code')
    .populate('createdBy', 'name email role');

    if (schedules.length === 0) {
      return res.status(404).json({ message: 'No schedules found for this teacher' });
    }
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
}

// Update schedule - FIXED
exports.updateSchedule = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: "User section not found" })
    }

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      section: req.user.section,
    })

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // FIXED: Check if user can update (creator or CR) - using schedule not reminder
    const canUpdate = schedule.createdBy.toString() === req.user.id || req.user.role === "cr"
    if (!canUpdate) {
      return res.status(403).json({ message: "Not authorized to update this schedule" })
    }

    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("section", "name")
      .populate("year", "year")
      .populate("department", "name code")
      .populate("createdBy", "name email role")

    if (!updated) return res.status(404).json({ message: "Schedule not found" })
    res.status(200).json(updated)
  } catch (error) {
    res.status(500).json({ message: "Error updating schedule", error })
  }
}

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: "User section not found" })
    }

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      section: req.user.section,
    })

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // FIXED: Use schedule.createdBy instead of reminder.createdBy
    const canDelete = schedule.createdBy.toString() === req.user.id || req.user.role === "cr"
    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized to delete this schedule" })
    }

    const deleted = await Schedule.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: "Schedule not found" })

    res.status(200).json({ message: "Schedule deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting schedule", error })
  }
}
// Get schedules by day
exports.getSchedulesByDay = async (req, res) => {
  try {
    if (!req.user || !req.user.section) {
      return res.status(401).json({ message: 'User section not found' });
    }
    const schedules = await Schedule.find({ day: req.params.day })
    .sort({ startTime: 1 })
    .populate('section', 'name')
    .populate('year', 'year')
    .populate('department', 'name code')
    .populate('createdBy', 'name email role');
    if (schedules.length === 0) {
      return res.status(404).json({ message: 'No schedules found for this day' });
    }
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
};
