const rateLimit = require("express-rate-limit");

// General guard for login/register — stops password-guessing at scale
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many attempts. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter guard for anything that sends an email (OTP / reset code) —
// prevents someone from spamming a user's inbox or burning your mail quota
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many code requests. Please wait a few minutes and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter guard for OTP/token verification — makes brute-forcing a 6-digit
// code or guessing a reset token impractical
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please request a new code." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, otpRequestLimiter, verifyLimiter };