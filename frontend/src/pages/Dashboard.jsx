import { useState } from "react";
import Navbar from "../components/Navbar";
import ScoreGauge from "../components/ScoreGauge";
import API from "../api/axios";

const AccordionItem = ({ index, suggestion }) => {
  const [open, setOpen] = useState(false);

  // Split title (first sentence) from body
  const dotIndex = suggestion.indexOf(".");
  const title = dotIndex !== -1 ? suggestion.substring(0, dotIndex + 1) : suggestion;
  const body = dotIndex !== -1 ? suggestion.substring(dotIndex + 1).trim() : "";

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{ border: "1px solid #3a3020", background: open ? "rgba(201,168,76,0.05)" : "transparent" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left transition"
      >
        <span
          className="text-xs font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
          {index + 1}
        </span>
        <p className="text-sm flex-1" style={{ color: "#e8d5a3" }}>{title}</p>
        <span style={{ color: "#8a7a5a", flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && body && (
        <div className="px-4 pb-4 pl-14">
          <p className="text-xs leading-relaxed" style={{ color: "#a89070" }}>{body}</p>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const goldGradient = "linear-gradient(90deg, #c9a84c, #e8d5a3, #a8956e)";

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
    if (jobDescription.trim().length < 50)
      return setError("Job description must be at least 50 characters");

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

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
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Analyze Your Resume
          </h1>
          <p className="text-sm" style={{ color: "#a89070" }}>
            Upload your resume and paste the job description to get your ATS score and personalized feedback.
          </p>
        </div>

        {/* Input Section */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* PDF Upload */}
            <div
              className="rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition"
              style={{
                background: dragOver ? "rgba(201,168,76,0.1)" : "#1c1c1c",
                border: dragOver ? "2px dashed #c9a84c" : "2px dashed #8a7a5a",
                minHeight: "220px",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(201,168,76,0.15)" }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "#c9a84c" }}>{file.name}</p>
                  <p className="text-xs mt-1" style={{ color: "#a89070" }}>
                    {(file.size / 1024).toFixed(1)} KB — Click to change
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(201,168,76,0.1)" }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="#c9a84c" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">Drop your resume here</p>
                  <p className="text-xs mt-1" style={{ color: "#a89070" }}>or click to browse — PDF only, max 5MB</p>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2" style={{ color: "#c9a84c" }}>
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="flex-1 rounded-xl p-4 text-sm resize-none outline-none transition"
                style={{
                  background: "#1c1c1c",
                  border: "1px solid #8a7a5a",
                  color: "#e8d5a3",
                  caretColor: "#c9a84c",
                  minHeight: "220px",
                }}
              />
              <p className="text-xs mt-2 text-right" style={{ color: jobDescription.length < 50 ? "#f87171" : "#4ade80" }}>
                {jobDescription.length} characters {jobDescription.length < 50 ? `(need ${50 - jobDescription.length} more)` : "✓"}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-lg mb-5 text-sm border"
            style={{ background: "#2d1a1a", borderColor: "#c0392b", color: "#e74c3c" }}
          >
            {error}
          </div>
        )}

        {/* Analyze Button */}
        {!result && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full font-semibold py-4 rounded-xl text-sm transition"
            style={{
              background: loading ? "#5a4a2a" : goldGradient,
              color: "#1a1a1a",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing your resume...
              </span>
            ) : (
              "Analyze Resume"
            )}
          </button>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">

            {/* TOP ROW — Score + Job Title + Section Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Score Card */}
              <div className="rounded-xl p-8 flex items-center gap-6"
                style={{ background: "#1c1c1c", border: "1px solid #8a7a5a" }}>
                <ScoreGauge score={result.atsScore} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#8a7a5a" }}>
                    Analyzed Position
                  </p>
                  <h2 className="text-2xl font-bold text-white mb-3">{result.jobTitle}</h2>
                  <p className="text-xs leading-relaxed" style={{ color: "#a89070" }}>
                    Your resume scored{" "}
                    <span style={{ color: "#c9a84c", fontWeight: "bold" }}>{result.atsScore}/100</span>{" "}
                    against this job description.
                  </p>
                </div>
              </div>

              {/* Section Scores */}
              {result.sectionScores && (
                <div className="rounded-xl p-6"
                  style={{ background: "#1c1c1c", border: "1px solid #8a7a5a" }}>
                  <h3 className="text-sm font-semibold mb-5" style={{ color: "#c9a84c" }}>
                    Section Breakdown
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(result.sectionScores).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs capitalize" style={{ color: "#a89070" }}>{key}</span>
                          <span className="text-xs font-bold" style={{ color: "#e8d5a3" }}>{value}/10</span>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: "#2a2a2a" }}>
                          <div
                            className="h-1.5 rounded-full transition-all duration-1000"
                            style={{
                              width: `${value * 10}%`,
                              background: value >= 8 ? "#4ade80" : value >= 6 ? "#c9a84c" : "#f87171"
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STRENGTHS + QUICK WINS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Strengths */}
              {result.strengths && (
                <div className="rounded-xl p-6"
                  style={{ background: "#1c1c1c", border: "1px solid #8a7a5a" }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "#4ade80" }}>
                    💪 Your Strengths
                  </h3>
                  <div className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span style={{ color: "#4ade80", fontSize: "0.75rem", marginTop: "2px" }}>✓</span>
                        <p className="text-xs leading-relaxed" style={{ color: "#d4b896" }}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Wins */}
              {result.quickWins && (
                <div className="rounded-xl p-6"
                  style={{ background: "#1c1c1c", border: "1px solid #8a7a5a" }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "#fb923c" }}>
                    ⚡ Quick Wins
                  </h3>
                  <div className="space-y-3">
                    {result.quickWins.map((w, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span
                          className="text-xs font-bold flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>
                          {i + 1}
                        </span>
                        <p className="text-xs leading-relaxed" style={{ color: "#d4b896" }}>{w}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* KEYWORDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Matched */}
              <div className="rounded-xl p-6"
                style={{ background: "#1c1c1c", border: "1px solid #8a7a5a" }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#4ade80" }}>
                  ✓ Matched Keywords
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
                    {result.matchedKeywords.length}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="rounded-xl p-6"
                style={{ background: "#1c1c1c", border: "1px solid #8a7a5a" }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#f87171" }}>
                  ✗ Missing Keywords
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                    {result.missingKeywords.length}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SUGGESTIONS — Accordion */}
            <div className="rounded-xl p-6"
              style={{ background: "#1c1c1c", border: "1px solid #8a7a5a" }}>
              <h3 className="text-sm font-semibold mb-5" style={{ color: "#c9a84c" }}>
                💡 Suggestions to Improve
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, i) => (
                  <AccordionItem key={i} index={i} suggestion={suggestion} />
                ))}
              </div>
            </div>

            {/* Analyze Again */}
            <button onClick={handleReset}
              className="w-full font-semibold py-4 rounded-xl text-sm transition"
              style={{ border: "1px solid #8a7a5a", color: "#c9a84c", background: "transparent" }}>
              Analyze Another Resume
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;