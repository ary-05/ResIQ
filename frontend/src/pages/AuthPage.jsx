import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [showOTP, setShowOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Forgot password state ─────────────────────────────────────────────────
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = email, 2 = otp, 3 = new password, 4 = done
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const switchToRegister = () => { setError(""); setShowOTP(false); setIsLogin(false); navigate("/register", { replace: true }); };
  const switchToLogin = () => { setError(""); setShowOTP(false); setIsLogin(true); navigate("/login", { replace: true }); };

  // ── OTP input logic (signup verification) ────────────────────────────────────
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  // ── Register → send OTP ──────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (registerData.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await API.post("/api/auth/register", registerData);
      setPendingEmail(registerData.email);
      setShowOTP(true);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter the full 6-digit code");
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/verify-otp", { email: pendingEmail, otp: code });
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/api/auth/resend-otp", { email: pendingEmail });
      setSuccess("New OTP sent to your email");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Login ────────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/login", loginData);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      // If unverified, push to OTP panel
      if (err.response?.data?.needsVerification) {
        setPendingEmail(err.response.data.email);
        setIsLogin(false);
        setShowOTP(true);
        setError("Please verify your email first. We've sent a new OTP.");
        await API.post("/api/auth/resend-otp", { email: err.response.data.email }).catch(() => {});
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password: open / close ──────────────────────────────────────────
  const openForgotPassword = () => {
    setError(""); setSuccess("");
    setResetStep(1);
    setResetEmail(loginData.email || "");
    setResetOtp(["", "", "", "", "", ""]);
    setResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setError(""); setSuccess("");
    setShowForgotPassword(false);
  };

  // ── Forgot password: reset-OTP input logic ─────────────────────────────────
  const handleResetOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...resetOtp];
    next[index] = value.slice(-1);
    setResetOtp(next);
    if (value && index < 5) {
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const handleResetOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !resetOtp[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }
  };

  const handleResetOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setResetOtp(paste.split(""));
      document.getElementById("reset-otp-5")?.focus();
    }
  };

  // ── Forgot password: step 1 → send code ────────────────────────────────────
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!resetEmail.trim()) return setError("Please enter your email");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/forgot-password", { email: resetEmail });
      setSuccess(data.message || "If that email is registered, a reset code has been sent.");
      setResetStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/forgot-password", { email: resetEmail });
      setSuccess(data.message || "A new code has been sent.");
      setResetOtp(["", "", "", "", "", ""]);
      document.getElementById("reset-otp-0")?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password: step 2 → verify code ──────────────────────────────────
  const handleVerifyResetOtp = async () => {
    const code = resetOtp.join("");
    if (code.length < 6) return setError("Please enter the full 6-digit code");
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/verify-reset-otp", { email: resetEmail, otp: code });
      setResetToken(data.resetToken);
      setResetStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
      setResetOtp(["", "", "", "", "", ""]);
      document.getElementById("reset-otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password: step 3 → set new password ─────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    if (newPassword !== confirmNewPassword) return setError("Passwords don't match");
    setLoading(true);
    try {
      await API.post("/api/auth/reset-password", { resetToken, password: newPassword });
      setResetStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password. Please try again from the start.");
    } finally {
      setLoading(false);
    }
  };

  const goldGradient = "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)";
  const inputWrapStyle = { background: "#1a1a1a", border: "1px solid #8a7a5a", borderRadius: "0.5rem", display: "flex", alignItems: "center", padding: "10px 12px" };
  const inputStyle = { flex: 1, outline: "none", fontSize: "0.875rem", background: "transparent", color: "#e8d5a3", caretColor: "#c9a84c" };

  const EyeOpen = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeClosed = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-7s4.477-7 10-7a9.95 9.95 0 016.375 2.325M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
    </svg>
  );

  const QuoteIcon = () => (
    <svg className="w-8 h-8 mb-3" fill="#c9a84c" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );

  const slideIn       = { transform: "translateX(0%)",    opacity: 1, transition: "transform 600ms cubic-bezier(0.77,0,0.175,1), opacity 600ms ease" };
  const slideOutLeft  = { transform: "translateX(-100%)", opacity: 0, transition: "transform 600ms cubic-bezier(0.77,0,0.175,1), opacity 600ms ease" };
  const slideOutRight = { transform: "translateX(100%)",  opacity: 0, transition: "transform 600ms cubic-bezier(0.77,0,0.175,1), opacity 600ms ease" };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 py-8"
      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}>
      <div className="w-full max-w-5xl rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ border: "1px solid #8a7a5a", minHeight: "620px" }}>

        {/* ── LEFT HALF ── */}
        <div className={`${isLogin || showOTP || showForgotPassword ? "block" : "hidden md:block"} w-full md:w-1/2 relative overflow-hidden`}
          style={{ background: "linear-gradient(160deg, #1c1c1c 0%, #252525 100%)" }}>

          {/* LOGIN FORM */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center"
            style={isLogin && !showOTP && !showForgotPassword ? slideIn : slideOutLeft}>

            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="ResIQ" className="w-12 h-12 object-contain" />
              <span className="text-3xl font-bold tracking-wide"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ResIQ
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-1"
              style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Welcome Back!
            </h1>
            <p className="text-sm mb-6" style={{ color: "#a89070" }}>Sign in to your ResIQ account.</p>

            {error && isLogin && !showOTP && !showForgotPassword && (
              <div className="px-4 py-3 rounded-lg mb-4 text-sm border"
                style={{ background: "#2d1a1a", borderColor: "#c0392b", color: "#e74c3c" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "#c9a84c" }}>Email</label>
                <div style={inputWrapStyle}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input type="email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="Enter your email" required style={inputStyle} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium" style={{ color: "#c9a84c" }}>Password</label>
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-xs hover:underline"
                    style={{ color: "#8a7a5a", background: "none", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8a7a5a")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={inputWrapStyle}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showPassword ? "text" : "password"} value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password" required style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: "#8a7a5a" }}>
                    {showPassword ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full font-semibold py-3 rounded-lg text-sm"
                style={{ background: loading ? "#5a4a2a" : goldGradient, color: "#1a1a1a", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-sm text-center mt-5" style={{ color: "#8a7a5a" }}>
              Don't have an account?{" "}
              <button onClick={switchToRegister} className="font-medium hover:underline" style={{ color: "#c9a84c" }}>
                Sign Up
              </button>
            </p>
          </div>

          {/* REGISTER BRANDING — shows on left when register active */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between"
            style={
              !isLogin && !showOTP && !showForgotPassword
                ? slideIn
                : (!isLogin && showOTP && !showForgotPassword ? slideOutLeft : slideOutRight)
            }>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl font-bold leading-tight mb-6"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Your Career Transformation Starts Here
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#a89070" }}>
                Join thousands of job seekers who used ResIQ to craft resumes that get noticed, get shortlisted, and get hired.
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ background: "rgba(201,168,76,0.07)", borderLeft: "4px solid #c9a84c" }}>
              <QuoteIcon />
              <p className="text-sm leading-relaxed italic" style={{ color: "#d4b896" }}>
                Success is not given, it is built, word by word, skill by skill, opportunity by opportunity. The moment you decide to take your career seriously is the moment everything changes.
              </p>
            </div>
          </div>

          {/* OTP PANEL — left side when signup OTP active */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center"
            style={showOTP && !showForgotPassword ? slideIn : slideOutLeft}>

            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="ResIQ" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold tracking-wide"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ResIQ
              </span>
            </div>

            <div className="text-3xl mb-2">📬</div>
            <h1 className="text-2xl font-bold mb-1"
              style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Check your email
            </h1>
            <p className="text-sm mb-2" style={{ color: "#a89070" }}>
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold mb-6" style={{ color: "#c9a84c" }}>{pendingEmail}</p>

            {error && showOTP && !showForgotPassword && (
              <div className="px-4 py-3 rounded-lg mb-4 text-sm border"
                style={{ background: "#2d1a1a", borderColor: "#c0392b", color: "#e74c3c" }}>
                {error}
              </div>
            )}
            {success && showOTP && !showForgotPassword && (
              <div className="px-4 py-3 rounded-lg mb-4 text-sm border"
                style={{ background: "#1a2d1a", borderColor: "#4ade80", color: "#4ade80" }}>
                {success}
              </div>
            )}

            {/* OTP boxes */}
            <div className="flex gap-3 mb-6" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  style={{
                    width: "48px", height: "56px", textAlign: "center",
                    fontSize: "1.4rem", fontWeight: "700",
                    background: "#1a1a1a", border: `1px solid ${digit ? "#c9a84c" : "#8a7a5a"}`,
                    borderRadius: "10px", color: "#e8d5a3", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              ))}
            </div>

            <button onClick={handleVerifyOTP} disabled={loading || otp.join("").length < 6}
              className="w-full font-semibold py-3 rounded-lg text-sm mb-4"
              style={{
                background: loading || otp.join("").length < 6 ? "#5a4a2a" : goldGradient,
                color: "#1a1a1a",
                cursor: loading || otp.join("").length < 6 ? "not-allowed" : "pointer",
              }}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="flex items-center justify-between">
              <button onClick={handleResendOTP} disabled={loading}
                className="text-sm hover:underline" style={{ color: "#c9a84c" }}>
                Resend code
              </button>
              <button onClick={switchToRegister} className="text-sm" style={{ color: "#8a7a5a" }}>
                ← Back
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD PANEL — left side, same slot pattern as OTP */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center"
            style={showForgotPassword ? slideIn : slideOutLeft}>

            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="ResIQ" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold tracking-wide"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ResIQ
              </span>
            </div>

            {/* Step dots */}
            <div className="flex gap-1.5 mb-6">
              {[1, 2, 3].map((n) => (
                <div key={n} style={{
                  width: n === resetStep ? "20px" : "7px", height: "7px", borderRadius: "999px",
                  background: n <= resetStep ? goldGradient : "#3a3020",
                  transition: "all 0.3s ease",
                }} />
              ))}
            </div>

            {(error) && showForgotPassword && (
              <div className="px-4 py-3 rounded-lg mb-4 text-sm border"
                style={{ background: "#2d1a1a", borderColor: "#c0392b", color: "#e74c3c" }}>
                {error}
              </div>
            )}
            {success && showForgotPassword && resetStep !== 4 && (
              <div className="px-4 py-3 rounded-lg mb-4 text-sm border"
                style={{ background: "#1a2d1a", borderColor: "#4ade80", color: "#4ade80" }}>
                {success}
              </div>
            )}

            {/* Step 1: email */}
            {resetStep === 1 && (
              <>
                <h1 className="text-2xl font-bold mb-1"
                  style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Forgot your password?
                </h1>
                <p className="text-sm mb-6" style={{ color: "#a89070" }}>
                  Enter your account email and we'll send you a reset code.
                </p>
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <div style={inputWrapStyle}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email" required style={inputStyle} autoFocus />
                  </div>
                  <button type="submit" disabled={loading} className="w-full font-semibold py-3 rounded-lg text-sm"
                    style={{ background: loading ? "#5a4a2a" : goldGradient, color: "#1a1a1a", cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "Sending code..." : "Send reset code"}
                  </button>
                </form>
                <p className="text-sm text-center mt-5" style={{ color: "#8a7a5a" }}>
                  <button onClick={closeForgotPassword} className="font-medium hover:underline" style={{ color: "#c9a84c" }}>
                    ← Back to Sign In
                  </button>
                </p>
              </>
            )}

            {/* Step 2: OTP */}
            {resetStep === 2 && (
              <>
                <div className="text-3xl mb-2">📬</div>
                <h1 className="text-2xl font-bold mb-1"
                  style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Check your email
                </h1>
                <p className="text-sm mb-2" style={{ color: "#a89070" }}>We sent a 6-digit code to</p>
                <p className="text-sm font-semibold mb-6" style={{ color: "#c9a84c" }}>{resetEmail}</p>

                <div className="flex gap-3 mb-6" onPaste={handleResetOtpPaste}>
                  {resetOtp.map((digit, i) => (
                    <input
                      key={i}
                      id={`reset-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleResetOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleResetOtpKeyDown(e, i)}
                      style={{
                        width: "48px", height: "56px", textAlign: "center",
                        fontSize: "1.4rem", fontWeight: "700",
                        background: "#1a1a1a", border: `1px solid ${digit ? "#c9a84c" : "#8a7a5a"}`,
                        borderRadius: "10px", color: "#e8d5a3", outline: "none",
                        transition: "border-color 0.2s",
                      }}
                    />
                  ))}
                </div>

                <button onClick={handleVerifyResetOtp} disabled={loading || resetOtp.join("").length < 6}
                  className="w-full font-semibold py-3 rounded-lg text-sm mb-4"
                  style={{
                    background: loading || resetOtp.join("").length < 6 ? "#5a4a2a" : goldGradient,
                    color: "#1a1a1a",
                    cursor: loading || resetOtp.join("").length < 6 ? "not-allowed" : "pointer",
                  }}>
                  {loading ? "Verifying..." : "Verify code"}
                </button>

                <div className="flex items-center justify-between">
                  <button onClick={handleResendResetOtp} disabled={loading}
                    className="text-sm hover:underline" style={{ color: "#c9a84c" }}>
                    Resend code
                  </button>
                  <button onClick={() => { setError(""); setSuccess(""); setResetStep(1); }} className="text-sm" style={{ color: "#8a7a5a" }}>
                    ← Back
                  </button>
                </div>
              </>
            )}

            {/* Step 3: new password */}
            {resetStep === 3 && (
              <>
                <h1 className="text-2xl font-bold mb-1"
                  style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Set a new password
                </h1>
                <p className="text-sm mb-6" style={{ color: "#a89070" }}>
                  Choose something you haven't used before.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div style={inputWrapStyle}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input type={showNewPassword ? "text" : "password"} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password" required style={inputStyle} autoFocus />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ color: "#8a7a5a" }}>
                      {showNewPassword ? <EyeOpen /> : <EyeClosed />}
                    </button>
                  </div>
                  <div style={inputWrapStyle}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input type={showNewPassword ? "text" : "password"} value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password" required style={inputStyle} />
                  </div>
                  <button type="submit" disabled={loading} className="w-full font-semibold py-3 rounded-lg text-sm"
                    style={{ background: loading ? "#5a4a2a" : goldGradient, color: "#1a1a1a", cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              </>
            )}

            {/* Step 4: done */}
            {resetStep === 4 && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex items-center justify-center"
                  style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}>
                  <svg className="w-6 h-6" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-1"
                  style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Password reset
                </h1>
                <p className="text-sm mb-6" style={{ color: "#a89070" }}>
                  You can now log in with your new password.
                </p>
                <button onClick={closeForgotPassword} className="w-full font-semibold py-3 rounded-lg text-sm"
                  style={{ background: goldGradient, color: "#1a1a1a", cursor: "pointer" }}>
                  Go to Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT HALF ── */}
        <div className={`${isLogin && !showForgotPassword ? "hidden md:block" : "block"} w-full md:w-1/2 relative overflow-hidden`}
          style={{ background: "linear-gradient(160deg, #2a2210 0%, #1a1508 50%, #0f0e09 100%)", borderLeft: "1px solid #8a7a5a" }}>

          {/* LOGIN BRANDING */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between"
            style={isLogin && !showForgotPassword ? slideIn : slideOutRight}>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl font-bold leading-tight mb-6"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Land Your Dream Job with AI-Powered Resume Analysis
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#a89070" }}>
                Upload your resume, paste the job description, and get instant feedback on ATS score, missing keywords, and actionable improvements.
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ background: "rgba(201,168,76,0.07)", borderLeft: "4px solid #c9a84c" }}>
              <QuoteIcon />
              <p className="text-sm leading-relaxed italic" style={{ color: "#d4b896" }}>
                Your resume is more than a document, it's the first chapter of your professional story. Every skill, experience, and achievement reflects your potential.
              </p>
            </div>
          </div>

          {/* REGISTER FORM */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center"
            style={!isLogin && !showOTP && !showForgotPassword ? slideIn : slideOutLeft}>

            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="ResIQ" className="w-12 h-12 object-contain" />
              <span className="text-3xl font-bold tracking-wide"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ResIQ
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-1"
              style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Create Account
            </h1>
            <p className="text-sm mb-5" style={{ color: "#a89070" }}>Start your journey to a better resume today.</p>

            {error && !isLogin && !showOTP && !showForgotPassword && (
              <div className="px-4 py-3 rounded-lg mb-4 text-sm border"
                style={{ background: "#2d1a1a", borderColor: "#c0392b", color: "#e74c3c" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "#c9a84c" }}>Full Name</label>
                <div style={inputWrapStyle}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input type="text" value={registerData.name} onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="Your full name" required style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "#c9a84c" }}>Email</label>
                <div style={inputWrapStyle}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input type="email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="Enter your email" required style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1" style={{ color: "#c9a84c" }}>Password</label>
                <div style={inputWrapStyle}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showPassword ? "text" : "password"} value={registerData.password}
                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Min. 6 characters" required style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ color: "#8a7a5a" }}>
                    {showPassword ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full font-semibold py-3 rounded-lg text-sm"
                style={{ background: loading ? "#5a4a2a" : goldGradient, color: "#1a1a1a", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Sending code..." : "Continue"}
              </button>
            </form>

            <p className="text-sm text-center mt-5" style={{ color: "#8a7a5a" }}>
              Already have an account?{" "}
              <button onClick={switchToLogin} className="font-medium hover:underline" style={{ color: "#c9a84c" }}>
                Sign In
              </button>
            </p>
          </div>

          {/* OTP BRANDING — right side when signup OTP active */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center"
            style={showOTP && !showForgotPassword ? slideIn : slideOutRight}>
            <div className="flex-1 flex flex-col justify-center">
              <div style={{ fontSize: "3rem", marginBottom: "24px" }}>🔐</div>
              <h2 className="text-4xl font-bold leading-tight mb-6"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                One step away from your dream job
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#a89070" }}>
                Verify your email to keep your account secure. Check your inbox — the code expires in 10 minutes.
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ background: "rgba(201,168,76,0.07)", borderLeft: "4px solid #c9a84c" }}>
              <QuoteIcon />
              <p className="text-sm leading-relaxed italic" style={{ color: "#d4b896" }}>
                Every great career starts with a single verified step. You're almost there.
              </p>
            </div>
          </div>

          {/* FORGOT PASSWORD BRANDING — right side, same slot pattern as OTP branding */}
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center"
            style={showForgotPassword ? slideIn : slideOutRight}>
            <div className="flex-1 flex flex-col justify-center">
              <div style={{ fontSize: "3rem", marginBottom: "24px" }}>🔑</div>
              <h2 className="text-4xl font-bold leading-tight mb-6"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Locked out happens. Getting back in shouldn't be hard.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#a89070" }}>
                Verify it's really you with a one-time code, then set a fresh password and get straight back to your resume analysis.
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ background: "rgba(201,168,76,0.07)", borderLeft: "4px solid #c9a84c" }}>
              <QuoteIcon />
              <p className="text-sm leading-relaxed italic" style={{ color: "#d4b896" }}>
                A forgotten password is never the end of the story, just a short detour back to where you were headed.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;