import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import ScoreGauge from "../components/ScoreGauge";
import API from "../api/axios";
import ResAI from "../components/ResAI";

// ── Design tokens (mirrors LandingPage.jsx — keep these two files in sync) ───
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
  orange: "#fb923c",
};

const goldGrad = "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)";
const goldGrad2 = "linear-gradient(135deg, #c9a84c 0%, #a8956e 100%)";
const cardBg = "linear-gradient(145deg, #1c1c1c, #141414)";
const cardBorder = "1px solid rgba(138,122,90,0.25)";

const GoldText = ({ children }) => (
  <span style={{ background: goldGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    {children}
  </span>
);

// ── Ambient background — same treatment as the landing page hero ────────────
const GlowOrbs = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{
      position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
      top: "-220px", left: "50%", transform: "translateX(-50%)",
      background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
      filter: "blur(40px)",
    }} />
    <div style={{
      position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
      bottom: "-80px", right: "-100px",
      background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
      filter: "blur(30px)",
    }} />
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `
        linear-gradient(rgba(138,122,90,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(138,122,90,0.035) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
    }} />
  </div>
);

// ── Scroll/entrance reveal, same hook as landing page ────────────────────────
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);
  return [ref, visible];
};

const Reveal = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ── Reusable "lift on hover" card wrapper ────────────────────────────────────
const HoverCard = ({ children, style = {}, ...rest }) => (
  <div
    style={{
      background: cardBg,
      border: cardBorder,
      borderRadius: "16px",
      transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
      ...style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "rgba(138,122,90,0.25)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
    {...rest}
  >
    {children}
  </div>
);

// ── Eyebrow badge, same shape as the landing page hero ───────────────────────
const Eyebrow = ({ label }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "6px 14px", borderRadius: "20px", marginBottom: "20px",
    background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)",
  }}>
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.gold, animation: "pulse 2s infinite" }} />
    <span style={{ color: C.gold, fontSize: "0.72rem", fontWeight: "600", letterSpacing: "0.08em" }}>{label}</span>
  </div>
);

// ── Step indicator — Upload → Analyze → Review ───────────────────────────────
const StepTrack = ({ current }) => {
  const steps = ["Upload", "Analyze", "Review"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px" }}>
      {steps.map((s, i) => {
        const idx = i + 1;
        const active = idx <= current;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem", fontWeight: "800",
                background: active ? goldGrad2 : "transparent",
                border: active ? "none" : `1px solid ${C.border}`,
                color: active ? "#1a1a1a" : C.muted,
                transition: "all 0.3s ease",
              }}>{idx}</span>
              <span style={{
                fontSize: "0.78rem", fontWeight: active ? "700" : "500",
                color: active ? C.cream : C.muted, whiteSpace: "nowrap",
                transition: "color 0.3s ease",
              }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: "1px", minWidth: "24px",
                background: idx < current ? "rgba(201,168,76,0.4)" : "rgba(138,122,90,0.2)",
                transition: "background 0.4s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Suggestions accordion ─────────────────────────────────────────────────────
const AccordionItem = ({ index, suggestion }) => {
  const [open, setOpen] = useState(false);

  const dotIndex = suggestion.indexOf(".");
  const title = dotIndex !== -1 ? suggestion.substring(0, dotIndex + 1) : suggestion;
  const body = dotIndex !== -1 ? suggestion.substring(dotIndex + 1).trim() : "";

  return (
    <div style={{
      borderRadius: "12px", overflow: "hidden", transition: "all 0.25s ease",
      border: `1px solid ${open ? "rgba(201,168,76,0.35)" : "rgba(138,122,90,0.2)"}`,
      background: open ? "rgba(201,168,76,0.05)" : "transparent",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "16px", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
      >
        <span style={{
          fontSize: "0.7rem", fontWeight: "800", flexShrink: 0, width: "24px", height: "24px",
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(201,168,76,0.15)", color: C.gold,
        }}>
          {index + 1}
        </span>
        <p style={{ fontSize: "0.85rem", flex: 1, color: C.cream, margin: 0 }}>{title}</p>
        <span style={{ color: C.muted, flexShrink: 0, fontSize: "0.7rem", transition: "transform 0.25s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>
      {open && body && (
        <div style={{ padding: "0 16px 16px 56px" }}>
          <p style={{ fontSize: "0.78rem", lineHeight: 1.7, color: C.muted, margin: 0 }}>{body}</p>
        </div>
      )}
    </div>
  );
};

// ── Score card — echoes the hero visual's floating card language ────────────
const ScoreCard = ({ score, jobTitle }) => (
  <HoverCard style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px",
      borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)",
      filter: "blur(20px)", pointerEvents: "none",
    }} />
    <div style={{ display: "flex", alignItems: "center", gap: "24px", position: "relative", zIndex: 1 }}>
      <ScoreGauge score={score} />
      <div>
        <p style={{ fontSize: "0.68rem", fontWeight: "700", letterSpacing: "0.1em", color: C.muted, marginBottom: "6px", textTransform: "uppercase" }}>
          Analyzed Position
        </p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fff", marginBottom: "10px", lineHeight: 1.2 }}>{jobTitle}</h2>
        <p style={{ fontSize: "0.78rem", lineHeight: 1.6, color: C.muted, margin: 0 }}>
          Your resume scored <span style={{ color: C.gold, fontWeight: "700" }}>{score}/100</span> against this job description.
        </p>
      </div>
    </div>
  </HoverCard>
);

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [jdMode, setJdMode] = useState("text");
  const [jdFile, setJdFile] = useState(null);

  const currentStep = result ? 3 : loading ? 2 : 1;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setError("Please upload a PDF file only");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setError("");
    } else {
      setError("Please upload a PDF file only");
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please upload your resume");
    if (jdMode === "text" && jobDescription.trim().length < 50)
      return setError("Job description must be at least 50 characters");
    if (jdMode === "pdf" && !jdFile)
      return setError("Please upload the job description PDF");

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jdMode === "pdf" && jdFile) {
        formData.append("jdFile", jdFile);
      } else {
        formData.append("jobDescription", jobDescription);
      }

      const { data } = await API.post("/api/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setJdFile(null);
    setJdMode("text");
    setResult(null);
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh", position: "relative",
      background: C.black, color: C.cream,
      fontFamily: "Nunito, system-ui, -apple-system, sans-serif",
    }}>
      <GlowOrbs />
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "56px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <Reveal>
          <Eyebrow label={result ? "ANALYSIS COMPLETE" : "AI-POWERED ANALYSIS"} />
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: "900", lineHeight: 1.1,
            letterSpacing: "-0.02em", marginBottom: "10px",
          }}>
            {result ? <>Here's how you <GoldText>stack up.</GoldText></> : <>Analyze your <GoldText>resume.</GoldText></>}
          </h1>
          <p style={{ fontSize: "0.92rem", color: C.muted, lineHeight: 1.6, maxWidth: "520px", marginBottom: "32px" }}>
            {result
              ? "Section scores, keyword gaps, and prioritized fixes — all scored against the real job description."
              : "Upload your resume and the job description to get your ATS score and personalized feedback."}
          </p>
          <StepTrack current={currentStep} />
        </Reveal>

        {/* Input Section */}
        {!result && (
          <Reveal delay={0.05}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "20px" }}>
              <style>{`
                @media (min-width: 768px) {
                  .dash-input-grid { grid-template-columns: 1fr 1fr !important; }
                }
              `}</style>
              <div className="dash-input-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>

                {/* Resume Upload */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                  style={{
                    borderRadius: "18px", padding: "28px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    minHeight: "240px", textAlign: "center",
                    background: dragOver ? "linear-gradient(145deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))" : cardBg,
                    border: dragOver ? "2px dashed #c9a84c" : "2px dashed rgba(138,122,90,0.4)",
                    boxShadow: dragOver ? "0 16px 40px rgba(201,168,76,0.12)" : "0 8px 24px rgba(0,0,0,0.35)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <input id="fileInput" type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "50%", marginBottom: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: file ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.25)",
                  }}>
                    {file ? (
                      <svg width="22" height="22" fill="none" stroke={C.gold} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" fill="none" stroke={C.gold} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    )}
                  </div>
                  {file ? (
                    <>
                      <p style={{ fontSize: "0.85rem", fontWeight: "700", color: C.gold, marginBottom: "4px" }}>{file.name}</p>
                      <p style={{ fontSize: "0.72rem", color: C.muted }}>{(file.size / 1024).toFixed(1)} KB — click to change</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>Drop your resume here</p>
                      <p style={{ fontSize: "0.72rem", color: C.muted }}>or click to browse — PDF only, max 5MB</p>
                    </>
                  )}
                </div>

                {/* Job Description */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700", color: C.gold }}>Job Description</label>
                    <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.border}` }}>
                      {["text", "pdf"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setJdMode(mode)}
                          style={{
                            padding: "6px 14px", fontSize: "0.72rem", fontWeight: "700", border: "none", cursor: "pointer",
                            background: jdMode === mode ? goldGrad2 : "transparent",
                            color: jdMode === mode ? "#1a1a1a" : C.muted,
                            transition: "all 0.2s ease",
                          }}
                        >
                          {mode === "text" ? "Text" : "PDF"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {jdMode === "text" ? (
                    <>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        style={{
                          flex: 1, borderRadius: "18px", padding: "16px", fontSize: "0.85rem", resize: "none", outline: "none",
                          background: cardBg, border: cardBorder, color: C.cream, caretColor: C.gold, minHeight: "240px",
                          fontFamily: "inherit", boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                        }}
                      />
                      <p style={{ fontSize: "0.72rem", marginTop: "8px", textAlign: "right", color: jobDescription.length < 50 ? C.red : C.green }}>
                        {jobDescription.length} characters {jobDescription.length < 50 ? `(need ${50 - jobDescription.length} more)` : "✓"}
                      </p>
                    </>
                  ) : (
                    <div
                      onClick={() => document.getElementById("jdFileInput").click()}
                      style={{
                        flex: 1, borderRadius: "18px", cursor: "pointer", minHeight: "240px",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center",
                        background: cardBg, border: "2px dashed rgba(138,122,90,0.4)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <input
                        id="jdFileInput" type="file" accept=".pdf" style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f && f.type === "application/pdf") setJdFile(f);
                          else setError("JD must be a PDF file");
                        }}
                      />
                      {jdFile ? (
                        <>
                          <p style={{ fontSize: "0.85rem", fontWeight: "700", color: C.gold, marginBottom: "4px" }}>{jdFile.name}</p>
                          <p style={{ fontSize: "0.72rem", color: C.muted }}>Click to change</p>
                        </>
                      ) : (
                        <>
                          <svg width="30" height="30" fill="none" stroke={C.gold} viewBox="0 0 24 24" style={{ marginBottom: "10px" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p style={{ fontSize: "0.85rem", color: "#fff" }}>Upload JD as PDF</p>
                          <p style={{ fontSize: "0.72rem", marginTop: "4px", color: C.muted }}>PDF only, max 5MB</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.85rem",
            background: "#2d1a1a", border: "1px solid #c0392b", color: "#e74c3c",
          }}>
            {error}
          </div>
        )}

        {/* Analyze Button */}
        {!result && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", fontWeight: "700", padding: "16px", borderRadius: "14px", fontSize: "0.9rem",
              border: "none", color: "#1a1a1a",
              background: loading ? "#5a4a2a" : goldGrad2,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 8px 32px rgba(201,168,76,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(201,168,76,0.4)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 8px 32px rgba(201,168,76,0.3)"; }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity="0.75" />
                </svg>
                Analyzing your resume...
              </span>
            ) : (
              "Analyze Resume →"
            )}
          </button>
        )}

        {/* Results Section */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* TOP ROW — Score + Section Scores */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              <style>{`
                @media (min-width: 768px) {
                  .dash-results-grid { grid-template-columns: 1fr 1fr !important; }
                }
              `}</style>
              <div className="dash-results-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                <Reveal>
                  <ScoreCard score={result.atsScore} jobTitle={result.jobTitle} />
                </Reveal>

                {result.sectionScores && (
                  <Reveal delay={0.06}>
                    <HoverCard style={{ padding: "28px" }}>
                      <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "18px", color: C.gold }}>Section Breakdown</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {Object.entries(result.sectionScores).map(([key, value]) => (
                          <div key={key}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "0.72rem", textTransform: "capitalize", color: C.muted }}>{key}</span>
                              <span style={{ fontSize: "0.72rem", fontWeight: "700", color: C.cream }}>{value}/10</span>
                            </div>
                            <div style={{ width: "100%", borderRadius: "999px", height: "5px", background: "#2a2a2a" }}>
                              <div style={{
                                height: "100%", borderRadius: "999px", transition: "width 1s ease",
                                width: `${value * 10}%`,
                                background: value >= 8 ? C.green : value >= 6 ? C.gold : C.red,
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </HoverCard>
                  </Reveal>
                )}
              </div>
            </div>

            {/* STRENGTHS + QUICK WINS */}
            <div className="dash-results-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {result.strengths && (
                <Reveal delay={0.1}>
                  <HoverCard style={{ padding: "28px" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "16px", color: C.green }}>Your Strengths</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {result.strengths.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ color: C.green, fontSize: "0.72rem", marginTop: "2px" }}>✓</span>
                          <p style={{ fontSize: "0.78rem", lineHeight: 1.6, color: "#d4b896", margin: 0 }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </HoverCard>
                </Reveal>
              )}

              {result.quickWins && (
                <Reveal delay={0.14}>
                  <HoverCard style={{ padding: "28px" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "16px", color: C.orange }}>Quick Wins</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {result.quickWins.map((w, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{
                            fontSize: "0.68rem", fontWeight: "800", flexShrink: 0, width: "20px", height: "20px",
                            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(251,146,60,0.15)", color: C.orange,
                          }}>{i + 1}</span>
                          <p style={{ fontSize: "0.78rem", lineHeight: 1.6, color: "#d4b896", margin: 0 }}>{w}</p>
                        </div>
                      ))}
                    </div>
                  </HoverCard>
                </Reveal>
              )}
            </div>

            {/* KEYWORDS */}
            <div className="dash-results-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              <Reveal delay={0.18}>
                <HoverCard style={{ padding: "28px" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: C.green }}>
                    ✓ Matched Keywords
                    <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "999px", background: "rgba(74,222,128,0.1)", color: C.green }}>
                      {result.matchedKeywords.length}
                    </span>
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {result.matchedKeywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: "5px 12px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600",
                        background: "rgba(74,222,128,0.08)", color: C.green, border: "1px solid rgba(74,222,128,0.2)",
                      }}>{kw}</span>
                    ))}
                  </div>
                </HoverCard>
              </Reveal>

              <Reveal delay={0.22}>
                <HoverCard style={{ padding: "28px" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", color: C.red }}>
                    ✗ Missing Keywords
                    <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "999px", background: "rgba(248,113,113,0.1)", color: C.red }}>
                      {result.missingKeywords.length}
                    </span>
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {result.missingKeywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: "5px 12px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: "600",
                        background: "rgba(248,113,113,0.08)", color: C.red, border: "1px solid rgba(248,113,113,0.2)",
                      }}>{kw}</span>
                    ))}
                  </div>
                </HoverCard>
              </Reveal>
            </div>

            {/* SUGGESTIONS */}
            <Reveal delay={0.26}>
              <HoverCard style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "18px", color: C.gold }}>💡 Suggestions to Improve</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.suggestions.map((suggestion, i) => (
                    <AccordionItem key={i} index={i} suggestion={suggestion} />
                  ))}
                </div>
              </HoverCard>
            </Reveal>

            {/* Analyze Again */}
            <Reveal delay={0.3}>
              <button
                onClick={handleReset}
                style={{
                  width: "100%", fontWeight: "700", padding: "16px", borderRadius: "14px", fontSize: "0.88rem",
                  border: `1px solid ${C.border}`, color: C.muted, background: "transparent", cursor: "pointer",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.cream; e.currentTarget.style.borderColor = C.gold; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
              >
                Analyze Another Resume
              </button>
            </Reveal>

          </div>
        )}
      </div>

      <ResAI />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default Dashboard;