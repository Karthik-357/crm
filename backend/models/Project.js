const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['proposal', 'in-progress', 'completed', 'on-hold'], default: 'proposal' },
  startDate: { type: Date },
  endDate: { type: Date },
  value: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema); 