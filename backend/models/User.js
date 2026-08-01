const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },

  // ── Password reset flow ──────────────────────────────────────────────────
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
  resetTokenHash: { type: String },   // bcrypt hash of the short-lived reset JWT
  resetTokenExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);