const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dateTime: { type: Date, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema); 