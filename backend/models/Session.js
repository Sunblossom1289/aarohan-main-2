// backend/models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  counselor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Counselor', 
    required: true
  },
  availabilitySlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CounselorAvailability',
    required: true
  },
  status: { 
    type: String, 
    enum: ['confirmed', 'completed', 'cancelled'], 
    default: 'confirmed' 
  },
  
  // Session timing
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },     // "10:30"
  scheduledEndTime: { type: String, required: true },   // "11:00"
  
  // Google Meet
  meetLink: { type: String },
  calendarEventId: { type: String },  // Google Calendar event ID (for cleanup)

  // Post-Session
  counselorNotes: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Indexes for queries
sessionSchema.index({ student: 1, status: 1 });
sessionSchema.index({ counselor: 1, status: 1 });
sessionSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Session', sessionSchema);
