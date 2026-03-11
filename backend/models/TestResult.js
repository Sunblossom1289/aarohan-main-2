// models/TestResult.js

const mongoose = require('mongoose');

const { Schema } = mongoose;

// ✅ UPDATED: Save both answer ID and text
const QuestionResponseSchema = new Schema({
  index: { type: Number, required: true },          // 0-based index in test
  questionId: { type: String },                     // e.g. Q1, db id, etc.
  text: { type: String, required: true },           // full question text
  answer: { type: Schema.Types.Mixed, required: false, default: null }, // number or string
}, { _id: false });

const TestResultSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },

  testType: { 
    type: String, 
    enum: ['aptitude', 'personality', 'interest'], 
    required: true 
  },

  // Metadata
  completedAt: { type: Date, default: Date.now },
  timeTaken: { type: Number },           // seconds
  violations: [{ type: Schema.Types.Mixed }],  // objects from anti-cheat

  // Raw responses
  questions: [QuestionResponseSchema],

  // Summary scores (flexible structure)
  summary: {
    // for personality (OCEAN)
    oceanScores: { type: Schema.Types.Mixed }, // { Openness: {...}, ... }

    // for aptitude
    aptitudeScores: { type: Schema.Types.Mixed }, // { Numerical: 80, Logical: 75, ... }
    totalAptitudeScore: { type: Number },

    // for interest
    interestScores: { type: Schema.Types.Mixed }, // e.g. RIASEC or custom

    // any other computed info
    extra: { type: Schema.Types.Mixed }
  }
}, { timestamps: true });

module.exports = mongoose.model('TestResult', TestResultSchema);
