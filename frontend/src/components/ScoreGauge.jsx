const ScoreGauge = ({ score }) => {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#c9a84c";
    if (score >= 40) return "#fb923c";
    return "#f87171";
  };

  const getLabel = () => {
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Average Match";
    return "Poor Match";
  };

  const color = getColor();

  return (
    <div style={{ position: "relative", width: "180px", height: "180px", flexShrink: 0 }}>
      <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx="90" cy="90" r={normalizedRadius}
          fill="none" stroke="#2a2a2a" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx="90" cy="90" r={normalizedRadius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      {/* Centered text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center"
      }}>
        <span style={{ fontSize: "2.8rem", fontWeight: "800", color: "#ffffff", lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: "0.7rem", color: "#a89070", marginTop: "4px", letterSpacing: "0.05em" }}>
          ATS SCORE
        </span>
        <span style={{ fontSize: "0.7rem", fontWeight: "600", color, marginTop: "4px" }}>
          {getLabel()}
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;