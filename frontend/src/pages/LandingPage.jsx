import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileUp,
    Cpu,
    PenLine,
    Target,
    KeyRound,
    BarChart3,
    TrendingUp,
    MessageSquareText,
    History,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import logo from "../assets/logo.png";
import "./LandingPage.css";

// ── Colors referenced in JS for dynamic values ────────────────────────────────
const C = {
    gold: "#c9a84c",
    muted: "#8a7a5a",
    cream: "#e8d5a3",
    green: "#4ade80",
    red: "#f87171",
    orange: "#fb923c",
};

const goldGrad = "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)";

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
const useReveal = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.12 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = "", style = {} }) => {
    const [ref, visible] = useReveal();
    return (
        <div
            ref={ref}
            className={`lp-reveal ${visible ? "visible" : ""} ${className}`}
            style={{ transitionDelay: `${delay}s`, ...style }}
        >
            {children}
        </div>
    );
};

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ to, suffix = "", duration = 1600 }) => {
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
    return <span ref={ref}>{val}{suffix}</span>;
};

// ── Background glow orbs ─────────────────────────────────────────────────────
const GlowBackground = () => (
    <div className="lp-bg">
        <div className="lp-glow lp-glow--hero" />
        <div className="lp-glow lp-glow--right" />
        <div className="lp-glow lp-glow--left" />
        <div className="lp-glow lp-glow--mid" />
        <div className="lp-glow lp-glow--bottom" />
        <div className="lp-noise" />
    </div>
);

// ── Hero score card ──────────────────────────────────────────────────────────
const HeroScoreCard = () => {
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setTimeout(() => setAnimate(true), 600); }, []);

    const sections = [
        { label: "Skills", score: 9, color: C.green },
        { label: "Experience", score: 7, color: C.gold },
        { label: "Keywords", score: 4, color: C.orange },
        { label: "Education", score: 8, color: C.green },
    ];

    return (
        <div className="lp-scorecard">
            <div className="lp-scorecard__glow" />

            <div className={`lp-scorecard__main ${animate ? "animate" : ""}`}>
                {/* Header */}
                <div className="lp-scorecard__header">
                    <div>
                        <p className="lp-scorecard__label">ATS SCORE</p>
                        <div className="lp-scorecard__number">
                            <span className="lp-scorecard__big">
                                {animate ? "87" : "0"}
                            </span>
                            <span className="lp-scorecard__of">/100</span>
                        </div>
                    </div>

                    {/* Mini gauge */}
                    <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="#252525" strokeWidth="6" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke="url(#scoreGrad)" strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${animate ? 87 * 1.634 : 0} 163.4`}
                            strokeDashoffset="40.85"
                            style={{ transition: "stroke-dasharray 1.4s ease 0.8s" }}
                            transform="rotate(-90 32 32)" />
                        <defs>
                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#c9a84c" />
                                <stop offset="100%" stopColor="#e8d5a3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Section bars */}
                <div style={{ marginBottom: "20px" }}>
                    {sections.map((s, i) => (
                        <div className="lp-bar" key={s.label}>
                            <div className="lp-bar__head">
                                <span className="lp-bar__label">{s.label}</span>
                                <span className="lp-bar__score">{s.score}/10</span>
                            </div>
                            <div className="lp-bar__track">
                                <div
                                    className="lp-bar__fill"
                                    style={{
                                        background: s.color,
                                        width: animate ? `${s.score * 10}%` : "0%",
                                        transitionDelay: `${0.8 + i * 0.12}s`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Keywords */}
                <div className="lp-tags">
                    {["React", "Node.js", "REST APIs", "TypeScript"].map((k) => (
                        <span key={k} className="lp-tag lp-tag--green">{k}</span>
                    ))}
                    {["Docker", "GraphQL"].map((k) => (
                        <span key={k} className="lp-tag lp-tag--red">{k}</span>
                    ))}
                </div>
            </div>

            {/* Floating badge */}
            <div className={`lp-scorecard__badge ${animate ? "animate" : ""}`}>
                <p className="lp-scorecard__badge-title">
                    <Sparkles size={13} />
                    STRONG MATCH
                </p>
                <p className="lp-scorecard__badge-sub">Top 15% for this role</p>
            </div>
        </div>
    );
};

// ── Navigation ────────────────────────────────────────────────────────────────
const LandingNav = ({ onLogin, onSignup }) => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);

    return (
        <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
            <div className="lp-nav__brand">
                <img src={logo} alt="ResIQ" className="lp-nav__logo" />
                <span className="lp-nav__name">ResIQ</span>
            </div>

            <div className="lp-nav__actions">
                <button onClick={onLogin} className="lp-btn lp-btn--ghost">
                    Log in
                </button>
                <button onClick={onSignup} className="lp-btn lp-btn--primary">
                    Get started
                </button>
            </div>
        </nav>
    );
};

// ── Data ──────────────────────────────────────────────────────────────────────
const STEPS = [
    { icon: FileUp, label: "Upload", desc: "Drop your resume PDF & job description (TXT/PDF) and hit analyze." },
    { icon: Cpu, label: "Analyze", desc: "AI reads your resume against the JD and scores every section instantly." },
    { icon: PenLine, label: "Improve", desc: "Use ResAI to rewrite bullets, fix keywords, and craft copy-pasteable text." },
];

const FEATURES = [
    { icon: Target, title: "ATS Score", desc: "Know exactly where you stand before you hit apply. Scored 0\u2013100 against the real job description." },
    { icon: KeyRound, title: "Keyword Analysis", desc: "See which keywords you're hitting and which ones are costing you interviews." },
    { icon: BarChart3, title: "Section Breakdown", desc: "Skills, experience, education, and more \u2014 graded individually so you fix the right thing first." },
    { icon: TrendingUp, title: "Quick Wins", desc: "Prioritized list of changes that move your score the most with the least effort." },
    { icon: MessageSquareText, title: "ResAI Chat", desc: "AI writing assistant with full resume context. Rewrite bullets, summaries, or cover letters on demand." },
    { icon: History, title: "History", desc: "Every analysis saved. Compare how your resume performs across different roles over time." },
];

// ── Main Landing Page ─────────────────────────────────────────────────────────
const LandingPage = () => {
    const navigate = useNavigate();
    const goLogin = () => navigate("/login");
    const goSignup = () => navigate("/register");

    return (
        <div className="landing-page">
            <GlowBackground />
            <LandingNav onLogin={goLogin} onSignup={goSignup} />

            {/* ═══ HERO ═══ */}
            <section className="lp-hero">
                <div className="lp-hero__inner">
                    {/* Left content */}
                    <div className="lp-hero__content">
                        <div className="lp-eyebrow">
                            <div className="lp-eyebrow__dot" />
                            <span className="lp-eyebrow__text">AI-POWERED RESUME ANALYZER</span>
                        </div>

                        <h1 className="lp-hero__h1">
                            Know your score<br />
                            <span className="lp-gold">before they do.</span>
                        </h1>

                        <p className="lp-hero__sub">
                            Upload your resume & job description. ResIQ gives you an ATS score,
                            keyword gaps, section-by-section feedback, and an AI writing assistant.
                        </p>

                        <div className="lp-hero__ctas">
                            <button onClick={goSignup} className="lp-btn lp-btn--hero">
                                <span>Analyze my resume</span>
                                <ArrowRight size={16} />
                            </button>
                            <button onClick={goLogin} className="lp-btn lp-btn--hero-ghost">
                                <span>I have an account</span>
                            </button>
                        </div>

                        <p className="lp-hero__caption">
                            Free to use · Results in 30 seconds
                        </p>
                    </div>

                    {/* Right visual */}
                    <div className="lp-hero__visual">
                        <HeroScoreCard />
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="lp-scroll-hint">
                    <span className="lp-scroll-hint__text">SCROLL</span>
                    <div className="lp-scroll-hint__line" />
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="lp-stats">
                <Reveal>
                    <div className="lp-stats__inner">
                        <div className="lp-stats__item">
                            <div className="lp-stats__num">
                                <Counter to={10} suffix="K+" />
                            </div>
                            <p className="lp-stats__label">Resumes analyzed</p>
                        </div>
                        <div className="lp-stats__item">
                            <div className="lp-stats__num">
                                <Counter to={87} />
                            </div>
                            <p className="lp-stats__label">Avg score after fixes</p>
                        </div>
                        <div className="lp-stats__item">
                            <div className="lp-stats__num">
                                <Counter to={30} suffix="s" />
                            </div>
                            <p className="lp-stats__label">To your first score</p>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="lp-steps">
                <div className="lp-steps__inner">
                    <Reveal>
                        <p className="lp-section-label">HOW IT WORKS</p>
                        <h2 className="lp-section-title">
                            From upload to offer-ready<br />
                            <span className="lp-gold">in three steps.</span>
                        </h2>
                    </Reveal>

                    <div className="lp-steps__row">
                        <div className="lp-steps__line" />

                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Reveal key={i} delay={i * 0.15} className="lp-step">
                                    <div className="lp-step__icon-wrap">
                                        <Icon />
                                        <span className="lp-step__num">{i + 1}</span>
                                    </div>
                                    <p className="lp-step__label">{s.label}</p>
                                    <p className="lp-step__desc">{s.desc}</p>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section className="lp-features">
                <div className="lp-features__inner">
                    <Reveal>
                        <p className="lp-section-label">EVERYTHING YOU NEED</p>
                        <h2 className="lp-section-title">
                            Built for people who<br />
                            <span className="lp-gold">take their career seriously.</span>
                        </h2>
                    </Reveal>

                    <div className="lp-features__grid">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <Reveal key={i} delay={i * 0.08} style={{ height: "100%" }}>
                                    <div className="lp-feature">
                                        <div className="lp-feature__icon">
                                            <Icon />
                                        </div>
                                        <h3 className="lp-feature__title">{f.title}</h3>
                                        <p className="lp-feature__desc">{f.desc}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ RESAI CALLOUT ═══ */}
            <section className="lp-resai">
                <div className="lp-resai__inner">
                    <Reveal>
                        <div className="lp-resai__card">
                            <div className="lp-resai__glow" />

                            <div className="lp-resai__content">
                                <div className="lp-resai__text">
                                    <div className="lp-resai__badge">
                                        <PenLine className="lp-resai__badge-icon" />
                                        <span className="lp-resai__badge-text">RESAI — WRITING ASSISTANT</span>
                                    </div>

                                    <h2 className="lp-resai__h2">
                                        Not just a score.<br />
                                        <span className="lp-gold">A rewrite partner.</span>
                                    </h2>

                                    <p className="lp-resai__desc">
                                        ResAI knows your full resume and the job you're targeting.
                                        Ask it to rewrite your bullets, add missing keywords naturally,
                                        or draft a cover letter intro and copy the results straight to your resume.
                                    </p>

                                    <button onClick={goSignup} className="lp-btn lp-btn--resai">
                                        <span>Try ResAI for free</span>
                                        <ArrowRight size={15} />
                                    </button>
                                </div>

                                {/* Chat mockup */}
                                <div className="lp-chat">
                                    {[
                                        { role: "user", text: "Rewrite my summary for this SWE role" },
                                        { role: "ai", text: "Results-driven software engineer with 3+ years building scalable REST APIs in Node.js and React. Delivered a 40% reduction in load time across 3 production services." },
                                        { role: "user", text: "Add the missing Docker keyword" },
                                    ].map((m, i) => (
                                        <div key={i} className={`lp-chat__row lp-chat__row--${m.role}`}>
                                            <div className={`lp-chat__bubble lp-chat__bubble--${m.role}`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="lp-cta">
                <Reveal>
                    <div className="lp-cta__inner">
                        <div className="lp-cta__glow" />

                        <h2 className="lp-cta__h2">
                            Your next interview<br />starts with <span className="lp-gold">your score.</span>
                        </h2>

                        <p className="lp-cta__sub">
                            Stop guessing why you're not getting callbacks. Get your ATS score,
                            fix the gaps, and walk into interviews with confidence.
                        </p>

                        <button onClick={goSignup} className="lp-btn lp-btn--cta">
                            <span>Get started for free</span>
                            <ArrowRight size={17} />
                        </button>

                        <p className="lp-cta__caption">
                            30 seconds to your first score
                        </p>
                    </div>
                </Reveal>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="lp-footer">
                <div className="lp-footer__brand">
                    <img src={logo} alt="ResIQ" className="lp-footer__logo" />
                    <span className="lp-footer__name">ResIQ</span>
                </div>

                <p className="lp-footer__copy">
                    &copy; {new Date().getFullYear()} &middot; ResIQ &middot; ARY
                </p>

                <div className="lp-footer__links">
                    <button onClick={goLogin} className="lp-footer__link">Log in</button>
                    <button onClick={goSignup} className="lp-footer__link">Sign up</button>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;