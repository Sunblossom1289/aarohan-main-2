const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.models.AppConfig || mongoose.model('AppConfig', appConfigSchema);
