// backend/models/CounselorAvailability.js
const mongoose = require('mongoose');

const counselorAvailabilitySchema = new mongoose.Schema({
  counselor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Counselor', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true // "10:00", "10:30", etc.
  },
  endTime: { 
    type: String, 
    required: true // "10:30", "11:00", etc.
  },
  
  // Booking status
  isBooked: { 
    type: Boolean, 
    default: false 
  },
  bookedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    default: null
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for fast queries
counselorAvailabilitySchema.index({ date: 1, startTime: 1, isBooked: 1 });
counselorAvailabilitySchema.index({ counselor: 1, date: 1 });

module.exports = mongoose.model('CounselorAvailability', counselorAvailabilitySchema);
