const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobTitle: { type: String, default: "Untitled Position" },
  atsScore: { type: Number, required: true },
  matchedKeywords: [String],
  missingKeywords: [String],
  suggestions: [String],
  sectionScores: {
    impact: Number,
    relevance: Number,
    keywords: Number,
    structure: Number,
  },
  quickWins: [String],
  strengths: [String],
  resumeText: { type: String },
  jobDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analysis", analysisSchema);