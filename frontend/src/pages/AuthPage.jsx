import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const switchToRegister = () => { setError(""); setIsLogin(false); navigate("/register", { replace: true }); };
  const switchToLogin = () => { setError(""); setIsLogin(true); navigate("/login", { replace: true }); };

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const { data } = await API.post("/api/auth/login", loginData);
      login(data); navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (registerData.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/register", registerData);
      login(data); navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
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

  const slideIn  = { transform: "translateX(0%)",    opacity: 1, transition: "transform 600ms cubic-bezier(0.77,0,0.175,1), opacity 600ms ease" };
  const slideOutLeft  = { transform: "translateX(-100%)", opacity: 0, transition: "transform 600ms cubic-bezier(0.77,0,0.175,1), opacity 600ms ease" };
  const slideOutRight = { transform: "translateX(100%)",  opacity: 0, transition: "transform 600ms cubic-bezier(0.77,0,0.175,1), opacity 600ms ease" };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}>
      <div className="w-full max-w-5xl rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ border: "1px solid #8a7a5a", height: "620px" }}>

        {/* ── LEFT HALF ── */}
        <div className="w-1/2 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #1c1c1c 0%, #252525 100%)" }}>

          {/* LOGIN FORM — slides out left when switching to register */}
          <div className="absolute inset-0 p-10 flex flex-col justify-center"
            style={isLogin ? slideIn : slideOutLeft}>

            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="ResIQ" className="w-12 h-12 object-contain" />
              <span className="text-3xl font-bold tracking-wide"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ResIQ
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-1" style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Welcome Back!</h1>
            <p className="text-sm mb-6" style={{ color: "#a89070" }}>Sign in to your ResIQ account.</p>

            {error && isLogin && (
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
                <label className="text-sm font-medium block mb-1" style={{ color: "#c9a84c" }}>Password</label>
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

          {/* REGISTER BRANDING — slides in from right when switching to register */}
          <div className="absolute inset-0 p-10 flex flex-col justify-between"
            style={isLogin ? slideOutRight : slideIn}>

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
                Success is not given, it is built, word by word, skill by skill, opportunity by opportunity. The moment you decide to take your career seriously is the moment everything changes. A great resume is not about impressing a machine - it is about telling your story so powerfully that no one can ignore it.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT HALF ── */}
        <div className="w-1/2 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #2a2210 0%, #1a1508 50%, #0f0e09 100%)", borderLeft: "1px solid #8a7a5a" }}>

          {/* LOGIN BRANDING — slides out right when switching to register */}
          <div className="absolute inset-0 p-10 flex flex-col justify-between"
            style={isLogin ? slideIn : slideOutRight}>

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
                Your resume is more than a document, it's the first chapter of your professional story. Every skill, experience, and achievement reflects your potential. A well-crafted resume creates opportunities before you even walk into the room. Make every word count, and let your resume open the doors to your future.
              </p>
            </div>
          </div>

          {/* REGISTER FORM — slides in from left when switching to register */}
          <div className="absolute inset-0 p-10 flex flex-col justify-center"
            style={isLogin ? slideOutLeft : slideIn}>

            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="ResIQ" className="w-12 h-12 object-contain" />
              <span className="text-3xl font-bold tracking-wide"
                style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ResIQ
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-1" style={{ background: goldGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Create Account</h1>
            <p className="text-sm mb-5" style={{ color: "#a89070" }}>Start your journey to a better resume today.</p>

            {error && !isLogin && (
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-sm text-center mt-5" style={{ color: "#8a7a5a" }}>
              Already have an account?{" "}
              <button onClick={switchToLogin} className="font-medium hover:underline" style={{ color: "#c9a84c" }}>
                Sign In
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;