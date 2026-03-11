const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  dreamCareer: String,
  dateOfBirth: { type: Date },
  registrationStep: { type: Number, default: 1 },
  email: String,
  age: Number,
  gender: {
    type: String,
    enum: ['M', 'F', 'O']
  },
  school: String,
  grade: Number,
  district: String,
  
  // Parent Info
  parentName: String,
  parentRelation: String,
  parentPhone: String,
  parentEmail: String,
  parentOccupation: String,
  
  // Academic Info
  lastExamScore: Number,
  previousGrade: String,
  
  // Legacy fields
  mathScore: Number,
  scienceScore: Number,
  englishScore: Number,

  // Subjects List
  subjects: [{
    name: { type: String },
    score: { type: Number } 
  }],
  
  // Counseling Credits
  counselingCredits: {
    type: Number,
    default: 0
  },

  // Test Credits (1 credit = 1 full assessment attempt)
  testCredits: {
    type: Number,
    default: 0
  },
  
  // Program & Status
  program: {
    type: Number,
    default: 1
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },

  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailOtp: String,
  emailOtpExpiry: Date,
  
  // Test Status
  aptitudeStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  personalityStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  interestStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },

  lastPersonalityResult: { type: Schema.Types.ObjectId, ref: 'TestResult' },
  lastAptitudeResult:    { type: Schema.Types.ObjectId, ref: 'TestResult' },
  lastInterestResult:    { type: Schema.Types.ObjectId, ref: 'TestResult' },
  
  // ✅ MODIFIED SECTION
  aptitudeResults: {
    // CHANGED: [Number] -> [Schema.Types.Mixed]
    // This allows saving the full array of answer objects that your frontend is sending
    // without crashing the database.
    answers: [mongoose.Schema.Types.Mixed], 
    
    score: Number,
    dimensionScores: mongoose.Schema.Types.Mixed,
    completedAt: Date
  },
  
  personalityResults: {
    answers: [Number], // You might need to change this too if Personality test has the same issue
    traits: mongoose.Schema.Types.Mixed,
    completedAt: Date
  },
  interestResults: {
    // ✅ CHANGED: Allow Mixed type for Part A answers (flexible)
    answers: [mongoose.Schema.Types.Mixed], 
    
    // ✅ NEW FIELD: To store the Part B "Career Reality" cards data
    careerReality: [mongoose.Schema.Types.Mixed], 
    
    // Standard fields
    categories: mongoose.Schema.Types.Mixed,
    topInterests: [String],
    completedAt: Date
  },
  
  // Counseling
  assignedCounselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counselor'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

module.exports = mongoose.model('Student', studentSchema);