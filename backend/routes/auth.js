const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTPEmail, sendPasswordResetEmail } = require("../utils/mailer");
const { authLimiter, otpRequestLimiter, verifyLimiter } = require("../middleware/rateLimiters");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", authLimiter, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });
  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  try {
    const existing = await User.findOne({ email });

    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (existing && !existing.isVerified) {
      existing.password = hashed;
      existing.name = name;
      existing.otp = otp;
      existing.otpExpiry = otpExpiry;
      await existing.save();
    } else {
      await User.create({ name, email, password: hashed, otp, otpExpiry });
    }

    try {
      await sendOTPEmail(email, name, otp);
    } catch (mailErr) {
      console.error("Mail send failed:", mailErr.message);
    }

    res.status(201).json({ message: "OTP sent", email });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post("/verify-otp", verifyLimiter, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP has expired. Please register again." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
router.post("/resend-otp", otpRequestLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(email, user.name, otp);
    } catch (mailErr) {
      console.error("Resend mail failed:", mailErr.message);
    }

    res.json({ message: "OTP resent" });
  } catch (err) {
    console.error("Resend OTP error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first", needsVerification: true, email });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);
    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
// Sends a reset OTP if the email belongs to a verified account.
// Always returns the same message either way, so an attacker can't use this
// endpoint to discover which emails are registered.
router.post("/forgot-password", otpRequestLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Email is required" });

  const genericResponse = { message: "If that email is registered, a reset code has been sent." };

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.json(genericResponse);
    }

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    // Clear any previous reset token so an old one can't still be used
    user.resetTokenHash = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    try {
      await sendPasswordResetEmail(email, user.name, otp);
    } catch (mailErr) {
      console.error("Reset mail failed:", mailErr.message);
    }

    res.json(genericResponse);
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/auth/verify-reset-otp ───────────────────────────────────────────
// Checks the OTP and, if valid, issues a short-lived single-use reset token.
// The token itself is required by /reset-password — knowing the OTP alone
// is not enough to change the password.
router.post("/verify-reset-otp", verifyLimiter, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetOtp)
      return res.status(400).json({ message: "Invalid or expired code" });

    if (user.resetOtp !== otp)
      return res.status(400).json({ message: "Invalid code" });

    if (user.resetOtpExpiry < new Date())
      return res.status(400).json({ message: "Code has expired. Please request a new one." });

    const resetToken = jwt.sign(
      { id: user._id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    user.resetTokenHash = await bcrypt.hash(resetToken, 10);
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ resetToken });
  } catch (err) {
    console.error("Verify reset OTP error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
// Takes the reset token from /verify-reset-otp plus a new password.
// The token is single-use: it's invalidated the moment it's used.
router.post("/reset-password", verifyLimiter, async (req, res) => {
  const { resetToken, password } = req.body;
  if (!resetToken || !password)
    return res.status(400).json({ message: "Reset token and new password are required" });
  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  try {
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    if (decoded.purpose !== "password_reset")
      return res.status(400).json({ message: "Invalid reset token" });

    const user = await User.findById(decoded.id);
    if (!user || !user.resetTokenHash || !user.resetTokenExpiry || user.resetTokenExpiry < new Date())
      return res.status(400).json({ message: "Reset link is invalid or has expired" });

    const matches = await bcrypt.compare(resetToken, user.resetTokenHash);
    if (!matches)
      return res.status(400).json({ message: "Reset link is invalid or has expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;