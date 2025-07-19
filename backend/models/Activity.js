const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['call', 'email', 'meeting', 'note'], required: true },
  description: { type: String },
  date: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema); 