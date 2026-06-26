const express = require("express");
const router = express.Router();
const pdfParse = require("pdf-parse");
const upload = require("../middleware/upload");
const { analyzeResume } = require("../utils/gemini");
const Analysis = require("../models/Analysis");
const { protect } = require("../middleware/authMiddleware");

// POST /api/resume/analyze
router.post("/analyze", protect, upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "jdFile", maxCount: 1 }
]), async (req, res) => {
  try {
    // 1. Check file exists
    const resumeFile = req.files?.resume?.[0];
    if (!resumeFile) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    // 2. Check job description exists
    let jobDescription = req.body.jobDescription || "";

    // If JD uploaded as PDF, extract text from it
    if (req.files?.jdFile?.[0]) {
      const jdPdf = await pdfParse(req.files.jdFile[0].buffer);
      jobDescription = jdPdf.text;
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ message: "Please provide a job description (text or PDF, min 50 characters)" });
    }

    // 3. Extract text from PDF buffer
    const pdfData = await pdfParse(resumeFile.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: "Could not extract text from PDF. Make sure it is not a scanned image." });
    }

    // 4. Send to Gemini for analysis
    const analysisResult = await analyzeResume(resumeText, jobDescription);

    // 5. Save to MongoDB
    const analysis = await Analysis.create({
      user: req.user._id,
      jobTitle: analysisResult.jobTitle,
      atsScore: analysisResult.atsScore,
      matchedKeywords: analysisResult.matchedKeywords,
      missingKeywords: analysisResult.missingKeywords,
      suggestions: analysisResult.suggestions,
      sectionScores: analysisResult.sectionScores,
      quickWins: analysisResult.quickWins,
      strengths: analysisResult.strengths,
      resumeText: resumeText,
      jobDescription: jobDescription,
    });

    // 6. Return result
    res.status(201).json({
      _id: analysis._id,
      jobTitle: analysis.jobTitle,
      atsScore: analysis.atsScore,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions,
      sectionScores: analysis.sectionScores,
      quickWins: analysis.quickWins,
      strengths: analysis.strengths,
      createdAt: analysis.createdAt,
    });

  } catch (error) {
    console.error("Analysis error:", error.message);
    res.status(500).json({ message: "Analysis failed", error: error.message });
  }
});

// GET /api/resume/history
router.get("/history", protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-resumeText -jobDescription");

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
});

// GET /api/resume/history/:id
router.get("/history/:id", protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analysis", error: error.message });
  }
});

// DELETE /api/resume/history/:id
router.delete("/history/:id", protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.json({ message: "Analysis deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete analysis", error: error.message });
  }
});

module.exports = router;