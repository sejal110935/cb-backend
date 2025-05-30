const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Department, Year, Section } = require('../models/user');

const seedData = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    // Optional: Clear existing collections before inserting
    await Department.deleteMany({});
    await Year.deleteMany({});
    await Section.deleteMany({});

    // Insert departments
    const departments = await Department.insertMany([
      { name: "Information Science and Engineering" },
      { name: "Computer Science and Engineering" },
      { name: "Electrical and Electronics Engineering" },
      { name: "Electronics and Communication Engineering" },
      { name: "Mechanical Engineering" },
      { name: "Civil Engineering" },
      { name: "Artificial Intelligence and Machine Learning" },
      { name: "Data Science" },
      { name: "Cyber Security" },
      { name: "Information Technology" },
      { name: "Computer Applications" },
      { name: "Business Administration" },
      { name: "Master of Computer Applications" },
      { name: "Master of Business Administration" },
      { name: "Master of Science in Data Science" },
      { name: "Master of Technology in Data Science" },
    ]);

    for (const dept of departments) {
      // Create years for each department
      const years = await Year.insertMany([
        { year: "FIRST", department: dept._id },
        { year: "SECOND", department: dept._id },
        { year: "THIRD", department: dept._id },
        { year: "FOURTH", department: dept._id },
      ]);

      // Create sections for each year
      for (const year of years) {
        await Section.insertMany([
          { name: "A", year: year._id, department: dept._id },
          { name: "B", year: year._id, department: dept._id },
          { name: "C", year: year._id, department: dept._id },
          { name: "D", year: year._id, department: dept._id },
        ]);
      }
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
