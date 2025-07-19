const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  company: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'lead'], default: 'lead' },
  industry: { type: String },
  avatar: { type: String },
  lastContact: { type: Date },
}, { timestamps: true });

// Note: The schema uses { timestamps: true }, so each customer document will have 'createdAt' and 'updatedAt' fields automatically managed by Mongoose.
// You can use 'createdAt' for time-based analytics, such as calculating new customers per month or month-over-month growth.

module.exports = mongoose.model('Customer', customerSchema); 