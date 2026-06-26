const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { chatWithResume } = require("../utils/gemini");
const Analysis = require("../models/Analysis");

// POST /api/chat/message
router.post("/message", protect, async (req, res) => {
  const { message, analysisId, conversationHistory = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  if (!analysisId) {
    return res.status(400).json({ message: "Please select an analysis to chat about" });
  }

  try {
    // Fetch the full analysis (including resumeText + jobDescription) for context
    const analysis = await Analysis.findOne({ _id: analysisId, user: req.user._id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const analysisContext = {
      jobTitle: analysis.jobTitle,
      atsScore: analysis.atsScore,
      resumeText: analysis.resumeText,
      jobDescription: analysis.jobDescription,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions,
    };

    const reply = await chatWithResume(message, conversationHistory, analysisContext);

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ message: "Chat failed", error: error.message });
  }
});

module.exports = router;