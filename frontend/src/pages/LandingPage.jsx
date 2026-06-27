import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    black: "#0a0a0a",
    dark: "#111111",
    card: "#161616",
    border: "rgba(138,122,90,0.35)",
    gold: "#c9a84c",
    goldEnd: "#a8956e",
    cream: "#e8d5a3",
    muted: "#8a7a5a",
    green: "#4ade80",
    red: "#f87171",
};

const goldGrad = "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)";
const goldGrad2 = "linear-gradient(135deg, #c9a84c 0%, #a8956e 100%)";

// ── Helpers ───────────────────────────────────────────────────────────────────
const GoldText = ({ children }) => (
    <span style={{ background: goldGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {children}
    </span>
);

// Scroll-reveal hook
const useReveal = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
};

const Reveal = ({ children, delay = 0, style = {} }) => {
    const [ref, visible] = useReveal();
    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            ...style,
        }}>
            {children}
        </div>
    );
};

// ── Animated score counter ────────────────────────────────────────────────────
const Counter = ({ to, duration = 1600 }) => {
    const [val, setVal] = useState(0);
    const [ref, visible] = useReveal();
    useEffect(() => {
        if (!visible) return;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const pct = Math.min((ts - start) / duration, 1);
            setVal(Math.floor(pct * to));
            if (pct < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [visible, to, duration]);
    return <span ref={ref}>{val}</span>;
};

// ── Particle background ─────────────────────────────────
const GlowOrbs = () => (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {/* Large ambient glow blobs */}
        <div style={{
            position: "absolute", width: "600px", height: "600px",
            borderRadius: "50%", top: "-200px", left: "50%", transform: "translateX(-50%)",
            background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
        }} />
        <div style={{
            position: "absolute", width: "400px", height: "400px",
            borderRadius: "50%", bottom: "0", right: "-100px",
            background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
            filter: "blur(30px)",
        }} />
        <div style={{
            position: "absolute", width: "300px", height: "300px",
            borderRadius: "50%", top: "30%", left: "-80px",
            background: "radial-gradient(circle, rgba(168,149,110,0.06) 0%, transparent 70%)",
            filter: "blur(24px)",
        }} />
        {/* Subtle grid overlay */}
        <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
        linear-gradient(rgba(138,122,90,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(138,122,90,0.04) 1px, transparent 1px)
      `,
            backgroundSize: "60px 60px",
        }} />
    </div>
);

// ── Floating score card (hero visual) ─────────────────────────────────────────
const HeroVisual = () => {
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setTimeout(() => setAnimate(true), 600); }, []);

    const sections = [
        { label: "Skills", score: 9, color: C.green },
        { label: "Experience", score: 7, color: C.gold },
        { label: "Keywords", score: 4, color: "#fb923c" },
        { label: "Education", score: 8, color: C.green },
    ];

    return (
        <div style={{ position: "relative", width: "340px", margin: "0 auto" }}>
            {/* Glow behind card */}
            <div style={{
                position: "absolute", inset: "-20px", borderRadius: "32px",
                background: "radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%)",
                filter: "blur(20px)",
            }} />

            {/* Main card */}
            <div style={{
                position: "relative", borderRadius: "20px", overflow: "hidden",
                background: "linear-gradient(145deg, #1c1c1c, #141414)",
                border: `1px solid rgba(201,168,76,0.3)`,
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)",
                padding: "28px",
                transform: animate ? "perspective(1000px) rotateX(2deg) rotateY(-4deg)" : "perspective(1000px) rotateX(8deg) rotateY(-8deg)",
                transition: "transform 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <p style={{ color: C.muted, fontSize: "0.7rem", letterSpacing: "0.1em", marginBottom: "4px" }}>ATS SCORE</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                            <span style={{
                                fontSize: "3rem", fontWeight: "800", background: goldGrad,
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1
                            }}>
                                {animate ? "87" : "0"}
                            </span>
                            <span style={{ color: C.muted, fontSize: "1.2rem" }}>/100</span>
                        </div>
                    </div>
                    {/* Mini gauge */}
                    <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="#2a2a2a" strokeWidth="6" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke="url(#g)" strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${animate ? 87 * 1.634 : 0} 163.4`}
                            strokeDashoffset="40.85"
                            style={{ transition: "stroke-dasharray 1.4s ease 0.8s" }}
                            transform="rotate(-90 32 32)" />
                        <defs>
                            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#c9a84c" />
                                <stop offset="100%" stopColor="#e8d5a3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Section bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                    {sections.map((s, i) => (
                        <div key={s.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ color: C.muted, fontSize: "0.72rem" }}>{s.label}</span>
                                <span style={{ color: C.cream, fontSize: "0.72rem", fontWeight: "700" }}>{s.score}/10</span>
                            </div>
                            <div style={{ height: "5px", borderRadius: "3px", background: "#2a2a2a" }}>
                                <div style={{
                                    height: "100%", borderRadius: "3px", background: s.color,
                                    width: animate ? `${s.score * 10}%` : "0%",
                                    transition: `width 1s ease ${0.8 + i * 0.12}s`,
                                    opacity: 0.9,
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Keywords */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["React", "Node.js", "REST APIs", "TypeScript"].map((k) => (
                        <span key={k} style={{
                            padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem",
                            background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", color: C.green,
                        }}>{k}</span>
                    ))}
                    {["Docker", "GraphQL"].map((k) => (
                        <span key={k} style={{
                            padding: "3px 10px", borderRadius: "20px", fontSize: "0.68rem",
                            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: C.red,
                        }}>{k}</span>
                    ))}
                </div>
            </div>

            {/* Floating badge */}
            <div style={{
                position: "absolute", bottom: "-16px", right: "-16px",
                padding: "10px 16px", borderRadius: "12px",
                background: "linear-gradient(135deg, #1c1c1c, #141414)",
                border: `1px solid rgba(74,222,128,0.4)`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                opacity: animate ? 1 : 0,
                transform: animate ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.6s ease 1.4s",
            }}>
                <p style={{ color: C.green, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.05em" }}>✦ STRONG MATCH</p>
                <p style={{ color: C.muted, fontSize: "0.65rem", marginTop: "2px" }}>Top 15% for this role</p>
            </div>
        </div>
    );
};

// ── Navbar ────────────────────────────────────────────────────────────────────
const LandingNav = ({ onLogin, onSignup }) => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    return (
        <nav style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            padding: "0 40px",
            height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
            borderBottom: scrolled ? "1px solid rgba(138,122,90,0.2)" : "none",
            backdropFilter: scrolled ? "blur(16px)" : "none",
            transition: "all 0.3s ease",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={logo} alt="ResIQ" style={{ width: "32px", height: "32px", borderRadius: "7px" }} />
                <span className="text-xl font-bold tracking-wide"
                    style={{ background: goldGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ResIQ</span>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button onClick={onLogin}
                    style={{
                        padding: "8px 20px", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer",
                        background: "transparent", border: `1px solid ${C.border}`, color: C.muted,
                        transition: "color 0.2s, border-color 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = C.cream; e.currentTarget.style.borderColor = C.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                    Log in
                </button>
                <button onClick={onSignup}
                    style={{
                        padding: "8px 20px", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer",
                        background: goldGrad2, border: "none", color: "#1a1a1a", fontWeight: "700",
                        boxShadow: "0 4px 16px rgba(201,168,76,0.3)", transition: "opacity 0.2s, transform 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    Get started
                </button>
            </div>
        </nav>
    );
};

// ── Steps data ────────────────────────────────────────────────────────────────
const STEPS = [
    { icon: "📄", label: "Upload", desc: "Drop your resume PDF & job Desc (TXT/PDF) & hit analyse." },
    { icon: "⚡", label: "Analyze", desc: "Gemini AI reads your resume against the JD and scores every section instantly." },
    { icon: "✍️", label: "Improve", desc: "Use ResAI to rewrite bullets, fix keywords, and craft copy-pasteable text." },
];

const FEATURES = [
    { icon: "🎯", title: "ATS Score", desc: "Know exactly where you stand before you hit apply. Scored 0–100 against the real job description." },
    { icon: "🔑", title: "Keyword Analysis", desc: "See which keywords you're hitting and which ones are costing you interviews & get suggestions to add them naturally." },
    { icon: "📊", title: "Section Breakdown", desc: "Skills, experience, education, and more, graded individually so you fix the right thing first." },
    { icon: "⚡", title: "Quick Wins", desc: "Prioritized list of changes that move your score the most with the least effort." },
    { icon: "✍️", title: "ResAI Chat", desc: "AI writing assistant with full resume context. Rewrite bullets, summaries, or a cover letter intro on demand." },
    { icon: "📁", title: "History", desc: "Every analysis saved. Compare how your resume performs across different roles over time." },
];


// ── Main Landing Page ─────────────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();

    const goLogin = () => navigate("/login");
    const goSignup = () => navigate("/register");

    return (
        <div style={{ background: C.black, minHeight: "100vh", color: C.cream, fontFamily: "Nunito, system-ui, -apple-system, sans-serif", overflowX: "hidden", position: "relative" }}>
            <GlowOrbs />
            <LandingNav onLogin={goLogin} onSignup={goSignup} />

            {/* ── HERO ── */}
            <section style={{
                position: "relative", minHeight: "100vh", display: "flex", alignItems: "center",
                padding: "120px 40px 80px"
            }}>

                <div style={{
                    maxWidth: "1100px", margin: "0 auto", width: "100%",
                    display: "flex", alignItems: "center", gap: "60px", flexWrap: "wrap"
                }}>

                    {/* Left copy */}
                    <div style={{ flex: "1 1 420px", position: "relative", zIndex: 1 }}>
                        {/* Eyebrow */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "6px 14px", borderRadius: "20px", marginBottom: "24px",
                            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)"
                        }}>
                            <div style={{
                                width: "6px", height: "6px", borderRadius: "50%", background: C.gold,
                                animation: "pulse 2s infinite"
                            }} />
                            <span style={{ color: C.gold, fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.06em" }}>
                                AI-POWERED RESUME ANALYZER
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: "900", lineHeight: 1.08,
                            letterSpacing: "-0.02em", marginBottom: "24px"
                        }}>
                            Know your score<br />
                            <GoldText>before they do.</GoldText>
                        </h1>

                        <p style={{ color: C.muted, fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "460px", marginBottom: "36px" }}>
                            Upload your resume & job description. ResIQ gives you an ATS score, keyword gaps, section-by-section feedback, and an AI writing assistant.
                        </p>

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                            <button onClick={goSignup}
                                style={{
                                    padding: "14px 32px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700",
                                    cursor: "pointer", border: "none", background: goldGrad2, color: "#1a1a1a",
                                    boxShadow: "0 8px 32px rgba(201,168,76,0.35)", transition: "transform 0.2s, box-shadow 0.2s"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(201,168,76,0.45)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,76,0.35)"; }}>
                                Analyze my resume →
                            </button>
                            <button onClick={goLogin}
                                style={{
                                    padding: "14px 24px", borderRadius: "12px", fontSize: "0.88rem",
                                    cursor: "pointer", background: "transparent", border: `1px solid ${C.border}`, color: C.muted,
                                    transition: "color 0.2s, border-color 0.2s"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = C.cream; e.currentTarget.style.borderColor = C.gold; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                                I have an account
                            </button>
                        </div>

                        <p style={{ color: "#8a7a5a", fontSize: "0.78rem", marginTop: "16px" }}>
                            Free to use · No credit card · Results in 30 seconds
                        </p>
                    </div>

                    {/* Right visual */}
                    <div style={{ flex: "1 1 320px", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
                        <HeroVisual />
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="scroll-hint" style={{
                    position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
                    flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.4
                }}>
                    <span style={{ color: "C.muted", fontSize: "0.7rem", letterSpacing: "0.1em" }}>SCROLL</span>
                    <div style={{
                        width: "1px", height: "32px", background: `linear-gradient(to bottom, ${C.gold}, transparent)`,
                        animation: "scrollPulse 2s infinite"
                    }} />
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: "100px 40px" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <Reveal>
                        <p style={{
                            color: C.gold, fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.12em",
                            textAlign: "center", marginBottom: "12px"
                        }}>HOW IT WORKS</p>
                        <h2 style={{
                            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "800", textAlign: "center",
                            letterSpacing: "-0.02em", marginBottom: "64px"
                        }}>
                            From upload to offer-ready<br /><GoldText>in three steps.</GoldText>
                        </h2>
                    </Reveal>

                    <div style={{ display: "flex", gap: "0", position: "relative" }}>
                        {/* Connecting line */}
                        <div style={{
                            position: "absolute", top: "32px", left: "calc(16.6% + 16px)",
                            right: "calc(16.6% + 16px)", height: "1px",
                            background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`
                        }} />

                        {STEPS.map((s, i) => (
                            <Reveal key={i} delay={i * 0.15} style={{ flex: 1, textAlign: "center", padding: "0 20px" }}>
                                <div style={{
                                    width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 20px",
                                    background: "linear-gradient(135deg, #1c1c1c, #141414)",
                                    border: `1px solid rgba(201,168,76,0.3)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.6rem", position: "relative",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                                }}>
                                    {s.icon}
                                    <span style={{
                                        position: "absolute", top: "-8px", right: "-8px", width: "20px", height: "20px",
                                        borderRadius: "50%", background: goldGrad2, display: "flex", alignItems: "center",
                                        justifyContent: "center", fontSize: "0.6rem", fontWeight: "800", color: "#1a1a1a"
                                    }}>
                                        {i + 1}
                                    </span>
                                </div>
                                <p style={{ fontWeight: "700", fontSize: "1rem", color: C.cream, marginBottom: "10px" }}>{s.label}</p>
                                <p style={{ color: C.muted, fontSize: "0.82rem", lineHeight: 1.65 }}>{s.desc}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section style={{
                padding: "100px 40px",
                background: "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.025) 50%, transparent 100%)"
            }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <Reveal>
                        <p style={{
                            color: C.gold, fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.12em",
                            textAlign: "center", marginBottom: "12px"
                        }}>EVERYTHING YOU NEED</p>
                        <h2 style={{
                            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "800", textAlign: "center",
                            letterSpacing: "-0.02em", marginBottom: "64px"
                        }}>
                            Built for people who<br /><GoldText>take their career seriously.</GoldText>
                        </h2>
                    </Reveal>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                        {FEATURES.map((f, i) => (
                            <Reveal key={i} delay={i * 0.08} style={{ height: "100%" }}>
                                <div style={{
                                    height: "100%",
                                    padding: "28px", borderRadius: "16px",
                                    background: "linear-gradient(145deg, #161616, #111111)",
                                    border: `1px solid rgba(138,122,90,0.25)`,
                                    transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
                                    cursor: "default",
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(138,122,90,0.25)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}>
                                    <div style={{ fontSize: "1.8rem", marginBottom: "14px" }}>{f.icon}</div>
                                    <h3 style={{ fontWeight: "700", fontSize: "1rem", color: C.cream, marginBottom: "8px" }}>{f.title}</h3>
                                    <p style={{ color: C.muted, fontSize: "0.83rem", lineHeight: 1.65 }}>{f.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── RESAI CALLOUT ── */}
            <section style={{ padding: "80px 40px" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <Reveal>
                        <div style={{
                            borderRadius: "24px", overflow: "hidden", position: "relative",
                            background: "linear-gradient(135deg, #1c1c1c 0%, #141414 100%)",
                            border: `1px solid rgba(201,168,76,0.3)`,
                            padding: "60px 48px",
                        }}>
                            {/* BG glow */}
                            <div style={{
                                position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px",
                                borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
                                filter: "blur(20px)", pointerEvents: "none"
                            }} />

                            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 1 }}>
                                <div style={{ flex: "1 1 300px" }}>
                                    <div style={{
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        padding: "5px 12px", borderRadius: "20px", marginBottom: "20px",
                                        background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)"
                                    }}>
                                        <span style={{ fontSize: "0.8rem" }}>✍️</span>
                                        <span style={{ color: C.gold, fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.08em" }}>RESAI — WRITING ASSISTANT</span>
                                    </div>
                                    <h2 style={{
                                        fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: "800",
                                        letterSpacing: "-0.02em", marginBottom: "16px", lineHeight: 1.2
                                    }}>
                                        Not just a score.<br /><GoldText>A rewrite partner.</GoldText>
                                    </h2>
                                    <p style={{ color: C.muted, fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "28px" }}>
                                        ResAI knows your full resume and the job you're targeting. Ask it to rewrite your bullets, add missing keywords naturally, or draft a cover letter intro and copy the results straight to your resume.
                                    </p>
                                    <button onClick={goSignup}
                                        style={{
                                            padding: "12px 28px", borderRadius: "10px", fontSize: "0.88rem", fontWeight: "700",
                                            cursor: "pointer", border: "none", background: goldGrad2, color: "#1a1a1a",
                                            boxShadow: "0 6px 20px rgba(201,168,76,0.3)", transition: "opacity 0.2s, transform 0.2s"
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                                        Try ResAI for free →
                                    </button>
                                </div>

                                {/* Mini chat mockup */}
                                <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {[
                                        { role: "user", text: "Rewrite my summary for this SWE role" },
                                        { role: "ai", text: "Results-driven software engineer with 3+ years building scalable REST APIs in Node.js and React. Delivered a 40% reduction in load time across 3 production services." },
                                        { role: "user", text: "Add the missing Docker keyword" },
                                    ].map((m, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                                            <div style={{
                                                maxWidth: "88%", padding: "9px 13px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                                                background: m.role === "user" ? "linear-gradient(135deg, #2a2210, #1a1508)" : "#1e1e1e",
                                                border: `1px solid ${m.role === "user" ? "rgba(138,122,90,0.4)" : "rgba(138,122,90,0.2)"}`,
                                                fontSize: "0.75rem", color: C.cream, lineHeight: 1.5,
                                            }}>{m.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: "120px 40px", textAlign: "center" }}>
                <Reveal>
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <h2 style={{
                            fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: "900",
                            letterSpacing: "-0.02em", marginBottom: "20px", lineHeight: 1.1
                        }}>
                            Your next interview<br />starts with <GoldText>your score.</GoldText>
                        </h2>
                        <p style={{ color: C.muted, fontSize: "1rem", lineHeight: 1.7, marginBottom: "40px" }}>
                            Stop guessing why you're not getting callbacks. Get your ATS score, fix the gaps, and walk into interviews with confidence.
                        </p>
                        <button onClick={goSignup}
                            style={{
                                padding: "16px 40px", borderRadius: "14px", fontSize: "1rem", fontWeight: "700",
                                cursor: "pointer", border: "none", background: goldGrad2, color: "#1a1a1a",
                                boxShadow: "0 12px 40px rgba(201,168,76,0.4)", transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 18px 50px rgba(201,168,76,0.5)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(201,168,76,0.4)"; }}>
                            Get started for free
                        </button>
                        <p style={{ color: "#8a7a5a", fontSize: "0.78rem", marginTop: "16px" }}>
                            No credit card · No setup · 30 seconds to your first score
                        </p>
                    </div>
                </Reveal>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{
                padding: "32px 40px", borderTop: "1px solid rgba(138,122,90,0.12)",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img src={logo} alt="ResIQ" style={{ width: "32px", height: "32px", borderRadius: "7px" }} />
                    <span className="text-xl font-bold tracking-wide"
                        style={{ background: goldGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ResIQ</span>
                </div>
                <p style={{ color: "#8a7a5a", fontSize: "0.75rem" }}>
                    © {new Date().getFullYear()} · ResIQ · ARY
                </p>
                <div style={{ display: "flex", gap: "20px" }}>
                    <button onClick={goLogin} style={{
                        background: "none", border: "none", color: "#8a7a5a",
                        fontSize: "0.78rem", cursor: "pointer"
                    }}>Log in</button>
                    <button onClick={goSignup} style={{
                        background: "none", border: "none", color: "#8a7a5a",
                        fontSize: "0.78rem", cursor: "pointer"
                    }}>Sign up</button>
                </div>
            </footer>

            {/* ── Global animations ── */}
            <style>{`
            .scroll-hint { display: flex; }
  @media (max-width: 768px) { .scroll-hint { display: none; } }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 0.8; transform: scaleY(1.1); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(201,168,76,0.25); }
      `}</style>
        </div>
    );
};

export default LandingPage;