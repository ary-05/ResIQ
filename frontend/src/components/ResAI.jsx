import { useState, useEffect, useRef } from "react";
import API from "../api/axios";

// ── colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#1a1a1a",
  card:     "#1c1c1c",
  goldCard: "linear-gradient(135deg, #2a2210 0%, #1a1508 50%, #0f0e09 100%)",
  gold:     "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)",
  border:   "#8a7a5a",
  muted:    "#a89070",
  body:     "#e8d5a3",
  accent:   "#c9a84c",
  panel:    "#141414",
};

const GoldText = ({ children }) => (
  <span style={{ background: C.gold, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    {children}
  </span>
);

// ── Copy button ───────────────────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={handle} title="Copy to clipboard"
      style={{ marginTop: "6px", padding: "3px 10px", borderRadius: "6px", fontSize: "0.7rem",
        cursor: "pointer", border: `1px solid ${copied ? "#4ade80" : "rgba(138,122,90,0.4)"}`,
        color: copied ? "#4ade80" : C.muted, background: "transparent", transition: "all 0.2s" }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
};

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: "6px", height: "6px", borderRadius: "50%", background: C.accent,
        animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s`,
      }} />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-5px); opacity: 1; }
      }
    `}</style>
  </div>
);

// ── Main ResAI component ──────────────────────────────────────────────────────
const ResAI = () => {
  const [open, setOpen] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [messages, setMessages] = useState([]); // { role: "user"|"ai", content: string }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch history list when panel opens
  useEffect(() => {
    if (!open || analyses.length > 0) return;
    const fetch_ = async () => {
      setHistoryLoading(true);
      try {
        const res = await API.get("/api/resume/history");
        setAnalyses(res.data);
      } catch {
        setError("Could not load your analyses.");
      } finally {
        setHistoryLoading(false);
      }
    };
    fetch_();
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input after analysis selected
  useEffect(() => {
    if (selectedId) inputRef.current?.focus();
  }, [selectedId]);

  const handleSelectAnalysis = (e) => {
    const id = e.target.value;
    const found = analyses.find((a) => a._id === id);
    setSelectedId(id);
    setSelectedTitle(found?.jobTitle || "Untitled Position");
    setMessages([]);
    setError("");
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !selectedId) return;
    const userMsg = input.trim();
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await API.post("/api/chat/message", {
        message: userMsg,
        analysisId: selectedId,
        conversationHistory: messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "ai", content: res.data.reply }]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setSelectedId("");
    setSelectedTitle("");
    setError("");
  };

  return (
    <>
      {/* ── Floating bubble ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="ResAI — Resume Assistant"
        style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 100,
          width: "58px", height: "58px", borderRadius: "50%",
          background: "linear-gradient(135deg, #c9a84c, #a8956e)",
          border: "none", cursor: "pointer", boxShadow: "0 4px 24px rgba(201,168,76,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(201,168,76,0.6)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(201,168,76,0.45)"; }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          // Robot / chat icon
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="12" rx="3"/>
            <path d="M9 12h.01M15 12h.01"/>
            <path d="M12 3v3"/>
            <circle cx="12" cy="3" r="1"/>
            <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
            <path d="M8 20v2M16 20v2"/>
          </svg>
        )}
      </button>

      {/* ── Slide-in panel ── */}
      <div style={{
        position: "fixed", bottom: "100px", right: "28px", zIndex: 99,
        width: "380px", maxHeight: "600px",
        borderRadius: "20px",
        background: C.panel,
        border: `1px solid ${C.border}`,
        boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
        display: "flex", flexDirection: "column",
        transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "all" : "none",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid rgba(138,122,90,0.3)`,
          background: "linear-gradient(135deg, #2a2210, #1a1508)",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #c9a84c, #a8956e)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="12" rx="3"/>
                <path d="M9 12h.01M15 12h.01"/>
                <path d="M12 3v3"/><circle cx="12" cy="3" r="1"/>
                <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: "700", fontSize: "0.92rem" }}><GoldText>ResAI</GoldText></p>
              <p style={{ color: C.muted, fontSize: "0.7rem" }}>
                {selectedTitle ? `Context: ${selectedTitle.length > 28 ? selectedTitle.slice(0, 28) + "…" : selectedTitle}` : "Resume writing assistant"}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={handleClearChat}
              style={{ fontSize: "0.7rem", color: C.muted, background: "transparent",
                border: `1px solid rgba(138,122,90,0.3)`, borderRadius: "6px",
                padding: "3px 8px", cursor: "pointer" }}>
              New chat
            </button>
          )}
        </div>

        {/* Analysis selector */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(138,122,90,0.2)`,
          background: "rgba(201,168,76,0.04)" }}>
          {historyLoading ? (
            <p style={{ color: C.muted, fontSize: "0.8rem", textAlign: "center" }}>Loading your analyses...</p>
          ) : analyses.length === 0 ? (
            <p style={{ color: C.muted, fontSize: "0.8rem", textAlign: "center" }}>
              No analyses yet — run one from the Dashboard first.
            </p>
          ) : (
            <select value={selectedId} onChange={handleSelectAnalysis}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "0.82rem",
                background: "#1c1c1c", border: `1px solid ${selectedId ? C.border : "rgba(138,122,90,0.4)"}`,
                color: selectedId ? C.body : C.muted, cursor: "pointer", outline: "none",
              }}>
              <option value="">— Select an analysis to chat about —</option>
              {analyses.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.jobTitle || "Untitled"} · {a.atsScore}/100 · {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex",
          flexDirection: "column", gap: "14px", minHeight: 0 }}>

          {/* Welcome / prompt */}
          {!selectedId && !historyLoading && analyses.length > 0 && (
            <div style={{ textAlign: "center", padding: "24px 16px" }}>
              <p style={{ fontSize: "1.6rem", marginBottom: "8px" }}>✍️</p>
              <p style={{ color: C.body, fontSize: "0.88rem", fontWeight: "600", marginBottom: "6px" }}>
                Select an analysis above
              </p>
              <p style={{ color: C.muted, fontSize: "0.78rem", lineHeight: 1.6 }}>
                I'll have full context of your resume and job description to help you rewrite bullets, improve wording, and craft copy-pasteable text.
              </p>
            </div>
          )}

          {/* Starter suggestions */}
          {selectedId && messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <p style={{ color: C.muted, fontSize: "0.75rem", letterSpacing: "0.05em" }}>TRY ASKING</p>
              {[
                "Rewrite my work experience bullets for this role",
                "Write a professional summary targeting this job",
                "Help me add the missing keywords naturally",
                "Write a cover letter intro for this position",
              ].map((suggestion) => (
                <button key={suggestion} onClick={() => setInput(suggestion)}
                  style={{ textAlign: "left", padding: "9px 12px", borderRadius: "8px",
                    fontSize: "0.8rem", cursor: "pointer", color: C.body,
                    background: "rgba(201,168,76,0.06)", border: "1px solid rgba(138,122,90,0.3)",
                    transition: "border-color 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = C.border}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(138,122,90,0.3)"}>
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "88%", padding: "10px 14px", borderRadius:
                  msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #2a2210, #1a1508)"
                  : "#222222",
                border: `1px solid ${msg.role === "user" ? C.border : "rgba(138,122,90,0.25)"}`,
                fontSize: "0.84rem", color: C.body, lineHeight: 1.65,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.content}
              </div>
              {msg.role === "ai" && <CopyBtn text={msg.content} />}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                background: "#222222", border: "1px solid rgba(138,122,90,0.25)" }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={{ color: "#f87171", fontSize: "0.78rem", textAlign: "center" }}>{error}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid rgba(138,122,90,0.2)`,
          background: "#161616", display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedId ? "Ask ResAI to rewrite, improve, or craft…" : "Select an analysis first"}
            disabled={!selectedId || loading}
            rows={1}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: "10px", fontSize: "0.82rem",
              background: "#1c1c1c", border: `1px solid rgba(138,122,90,0.35)`,
              color: C.body, outline: "none", resize: "none", lineHeight: 1.5,
              maxHeight: "100px", overflowY: "auto",
              opacity: (!selectedId || loading) ? 0.5 : 1,
              fontFamily: "inherit",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !selectedId || loading}
            style={{
              width: "38px", height: "38px", borderRadius: "10px", border: "none",
              background: (!input.trim() || !selectedId || loading)
                ? "rgba(201,168,76,0.2)"
                : "linear-gradient(135deg, #c9a84c, #a8956e)",
              cursor: (!input.trim() || !selectedId || loading) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s", flexShrink: 0,
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={(!input.trim() || !selectedId || loading) ? C.muted : "#1a1a1a"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ResAI;