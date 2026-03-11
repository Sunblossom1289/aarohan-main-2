const mongoose = require('mongoose');

const TestSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  testType: { type: String, default: 'aptitude' },
  status: { type: String, default: 'In Progress' },
  
  // These 3 fields are CRITICAL for resuming the adaptive test
  answers: { type: Array, default: [] },       
  blockHistory: { type: Array, default: [] },  
  categoryState: { type: Object, default: {} }, 
  
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestSession', TestSessionSchema);