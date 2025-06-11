const mongoose = require('mongoose');

const ForgotpassSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  authcode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Код дійсний 10 хвилин
  },
});

module.exports = mongoose.model('PassValidator', ForgotpassSchema);
