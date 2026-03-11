// models/counselor.js

const mongoose = require('mongoose');

const counselorSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  password: String,  // bcrypt hashed password
  dateOfBirth: Date,
  age: Number,
  email: String,
  photo: String,
  district: String,
  languages: [String],
  experience: Number,
  specializations: [String],
  bio: String,
  
  // Professional Qualifications
  qualification: String,  // e.g., "M.A. Psychology", "M.Sc. Psychology"
  university: String,
  yearOfGraduation: Number,
  
  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Profile completion
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  // Admin access
  hasAdminAccess: {
    type: Boolean,
    default: false
  },
  
  // Stats
  assignedStudents: {
    type: Number,
    default: 0
  },
  sessionsCompleted: {
    type: Number,
    default: 0
  },
  
  // Availability
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

module.exports = mongoose.model('Counselor', counselorSchema);
