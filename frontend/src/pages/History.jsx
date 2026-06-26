import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScoreGauge from "../components/ScoreGauge";
import API from "../api/axios";

// ── colour tokens (match design system exactly) ──────────────────────────────
const C = {
  bg:         "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
  card:       "linear-gradient(135deg, #1c1c1c 0%, #252525 100%)",
  goldCard:   "linear-gradient(135deg, #2a2210 0%, #1a1508 50%, #0f0e09 100%)",
  gold:       "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)",
  border:     "#8a7a5a",
  muted:      "#a89070",
  body:       "#e8d5a3",
  accent:     "#c9a84c",
  green:      "#4ade80",
  red:        "#f87171",
  orange:     "#fb923c",
};

const GoldText = ({ children, style = {} }) => (
  <span style={{ background: C.gold, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", ...style }}>
    {children}
  </span>
);

const scoreColor = (score) => {
  if (score >= 80) return C.green;
  if (score >= 60) return C.accent;
  if (score >= 40) return C.orange;
  return C.red;
};

const scoreLabel = (score) => {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Poor";
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── Expanded detail panel (shown inline below the card) ──────────────────────
const DetailPanel = ({ analysis, onClose }) => {
  if (!analysis) return null;
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await API.get(`/api/resume/history/${analysis._id}`);
        setFull(res.data);
      } catch {
        setError("Failed to load full analysis.");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [analysis._id]);

  const data = full || analysis;

  return (
    <div style={{
      marginTop: "0",
      padding: "28px 32px",
      background: C.goldCard,
      border: `1px solid ${C.border}`,
      borderTop: "none",
      borderRadius: "0 0 16px 16px",
    }}>
      {loading && (
        <div style={{ textAlign: "center", color: C.muted, padding: "24px 0" }}>
          Loading full analysis...
        </div>
      )}
      {error && <div style={{ color: C.red, textAlign: "center" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Score + Section Scores */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
            <ScoreGauge score={data.atsScore} />

            {data.sectionScores && (
              <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(data.sectionScores).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: C.muted, fontSize: "0.8rem", textTransform: "capitalize" }}>{key}</span>
                      <span style={{ color: C.body, fontSize: "0.8rem", fontWeight: "600" }}>{val}/10</span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "4px", background: "#2a2a2a" }}>
                      <div style={{
                        height: "100%", borderRadius: "4px",
                        width: `${val * 10}%`,
                        background: C.gold,
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strengths + Quick Wins */}
          {(data.strengths?.length || data.quickWins?.length) && (
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {data.strengths?.length > 0 && (
                <div style={{ flex: 1, minWidth: "200px", padding: "16px", borderRadius: "10px",
                  background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
                  <p style={{ color: C.green, fontSize: "0.75rem", fontWeight: "700",
                    letterSpacing: "0.08em", marginBottom: "10px" }}>✦ STRENGTHS</p>
                  {data.strengths.map((s, i) => (
                    <p key={i} style={{ color: C.body, fontSize: "0.82rem", marginBottom: "6px" }}>• {s}</p>
                  ))}
                </div>
              )}
              {data.quickWins?.length > 0 && (
                <div style={{ flex: 1, minWidth: "200px", padding: "16px", borderRadius: "10px",
                  background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.2)" }}>
                  <p style={{ color: C.orange, fontSize: "0.75rem", fontWeight: "700",
                    letterSpacing: "0.08em", marginBottom: "10px" }}>⚡ QUICK WINS</p>
                  {data.quickWins.map((w, i) => (
                    <p key={i} style={{ color: C.body, fontSize: "0.82rem", marginBottom: "6px" }}>• {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Keywords */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {data.matchedKeywords?.length > 0 && (
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ color: C.green, fontSize: "0.75rem", fontWeight: "700",
                  letterSpacing: "0.08em", marginBottom: "10px" }}>✓ MATCHED KEYWORDS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.matchedKeywords.map((k, i) => (
                    <span key={i} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem",
                      background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: C.green }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.missingKeywords?.length > 0 && (
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ color: C.red, fontSize: "0.75rem", fontWeight: "700",
                  letterSpacing: "0.08em", marginBottom: "10px" }}>✗ MISSING KEYWORDS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.missingKeywords.map((k, i) => (
                    <span key={i} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem",
                      background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: C.red }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions accordion */}
          {data.suggestions?.length > 0 && (
            <div>
              <p style={{ color: C.muted, fontSize: "0.75rem", fontWeight: "700",
                letterSpacing: "0.08em", marginBottom: "10px" }}>💡 SUGGESTIONS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.suggestions.map((s, i) => {
                  const dotIdx = s.indexOf(".");
                  const title = dotIdx > -1 ? s.slice(0, dotIdx + 1) : s;
                  const body = dotIdx > -1 ? s.slice(dotIdx + 1).trim() : "";
                  const open = openIdx === i;
                  return (
                    <div key={i} onClick={() => setOpenIdx(open ? null : i)}
                      style={{ padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                        background: "rgba(201,168,76,0.06)", border: `1px solid ${open ? C.border : "rgba(138,122,90,0.3)"}`,
                        transition: "border-color 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <span style={{ color: C.body, fontSize: "0.85rem", fontWeight: "600" }}>
                          <span style={{ color: C.accent, marginRight: "8px" }}>{i + 1}.</span>{title}
                        </span>
                        <span style={{ color: C.muted, fontSize: "0.8rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
                      </div>
                      {open && body && (
                        <p style={{ color: C.muted, fontSize: "0.82rem", marginTop: "8px", lineHeight: 1.6 }}>{body}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Close button */}
          <div style={{ textAlign: "right" }}>
            <button onClick={onClose}
              style={{ padding: "8px 20px", borderRadius: "8px", fontSize: "0.82rem", cursor: "pointer",
                border: `1px solid ${C.border}`, color: C.muted, background: "transparent" }}>
              Collapse ▲
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Delete confirmation modal ─────────────────────────────────────────────────
const DeleteModal = ({ jobTitle, onConfirm, onCancel, loading }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
    <div style={{ padding: "32px", borderRadius: "16px", maxWidth: "400px", width: "90%",
      background: C.goldCard, border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: "1.1rem", fontWeight: "700", color: C.body, marginBottom: "8px" }}>
        Delete this analysis?
      </p>
      <p style={{ color: C.muted, fontSize: "0.88rem", marginBottom: "24px" }}>
        "<span style={{ color: C.body }}>{jobTitle}</span>" will be permanently removed.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onCancel} disabled={loading}
          style={{ padding: "9px 20px", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer",
            border: `1px solid ${C.border}`, color: C.muted, background: "transparent" }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          style={{ padding: "9px 20px", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer",
            border: "1px solid rgba(248,113,113,0.5)", color: C.red,
            background: "rgba(248,113,113,0.1)", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Main History page ─────────────────────────────────────────────────────────
const History = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, jobTitle }
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/api/resume/history");
        setAnalyses(res.data);
      } catch {
        setError("Failed to load history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/api/resume/history/${deleteTarget._id}`);
      setAnalyses((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      if (expandedId === deleteTarget._id) setExpandedId(null);
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Navbar />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "6px" }}>
            <GoldText>Analysis History</GoldText>
          </h1>
          <p style={{ color: C.muted, fontSize: "0.9rem" }}>
            {analyses.length > 0
              ? `${analyses.length} past ${analyses.length === 1 ? "analysis" : "analyses"} — click any card to expand`
              : "Your past resume analyses will appear here"}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ height: "88px", borderRadius: "16px",
                background: "linear-gradient(90deg, #1c1c1c, #252525, #1c1c1c)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
                border: `1px solid ${C.border}` }} />
            ))}
            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding: "20px", borderRadius: "12px", textAlign: "center",
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: C.red }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && analyses.length === 0 && (
          <div style={{ textAlign: "center", padding: "72px 24px" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>📄</div>
            <p style={{ color: C.body, fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}>
              No analyses yet
            </p>
            <p style={{ color: C.muted, fontSize: "0.88rem", marginBottom: "28px" }}>
              Upload your first resume to get started
            </p>
            <button onClick={() => navigate("/dashboard")}
              style={{ padding: "12px 28px", borderRadius: "10px", fontWeight: "700",
                fontSize: "0.9rem", cursor: "pointer", border: "none",
                background: C.gold, color: "#1a1a1a" }}>
              Analyze a Resume
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && analyses.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {analyses.map((analysis, idx) => {
              const isExpanded = expandedId === analysis._id;
              const color = scoreColor(analysis.atsScore);

              return (
                <div key={analysis._id} style={{ marginBottom: "16px" }}>
                  {/* Card row */}
                  <div
                    onClick={() => toggleExpand(analysis._id)}
                    style={{
                      padding: "20px 24px",
                      borderRadius: isExpanded ? "16px 16px 0 0" : "16px",
                      background: C.card,
                      border: `1px solid ${isExpanded ? C.border : "rgba(138,122,90,0.4)"}`,
                      borderBottom: isExpanded ? "none" : `1px solid ${C.border}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* Score pill */}
                    <div style={{
                      minWidth: "56px", textAlign: "center", padding: "6px 10px",
                      borderRadius: "10px", background: `${color}18`, border: `1px solid ${color}55`,
                    }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: "800", color, lineHeight: 1 }}>
                        {analysis.atsScore}
                      </div>
                      <div style={{ fontSize: "0.6rem", color, marginTop: "2px", letterSpacing: "0.05em" }}>
                        {scoreLabel(analysis.atsScore)}
                      </div>
                    </div>

                    {/* Title + date */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: C.body, fontWeight: "700", fontSize: "0.98rem",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {analysis.jobTitle || "Untitled Position"}
                      </p>
                      <p style={{ color: C.muted, fontSize: "0.78rem", marginTop: "3px" }}>
                        {formatDate(analysis.createdAt)}
                        {analysis.matchedKeywords?.length > 0 && (
                          <span style={{ marginLeft: "12px", color: C.green }}>
                            {analysis.matchedKeywords.length} keywords matched
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Expand + Delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      <span style={{ color: C.muted, fontSize: "0.85rem" }}>{isExpanded ? "▲" : "▼"}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ _id: analysis._id, jobTitle: analysis.jobTitle }); }}
                        style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", cursor: "pointer",
                          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)",
                          color: C.red, transition: "opacity 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <DetailPanel
                      analysis={analysis}
                      onClose={() => setExpandedId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Analyze another CTA (when list is non-empty) */}
        {!loading && !error && analyses.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button onClick={() => navigate("/dashboard")}
              style={{ padding: "12px 28px", borderRadius: "10px", fontWeight: "700",
                fontSize: "0.88rem", cursor: "pointer", border: `1px solid ${C.border}`,
                color: C.accent, background: "transparent" }}>
              + Analyze Another Resume
            </button>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          jobTitle={deleteTarget.jobTitle || "Untitled Position"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default History;