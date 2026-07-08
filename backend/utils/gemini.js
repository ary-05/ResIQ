const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResume = async (resumeText, jobDescription, retries = 3) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 20,
      responseMimeType: "application/json",
    },
  });

  const prompt = `
You are a world-class resume strategist, ATS optimization expert, and hiring manager with 15+ years of experience at top tech companies including Google, Microsoft, and Amazon. You have reviewed over 50,000 resumes and know exactly what makes a candidate stand out or get filtered out.

Your task is to perform a deep, honest, and highly specific analysis of the resume below against the provided job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

ANALYSIS INSTRUCTIONS:

1. ATS SCORE: Calculate a realistic ATS compatibility score (0-100) based on:
   - Keyword match rate between resume and JD (40% weight)
   - Relevance of experience to the role (30% weight)
   - Resume structure and formatting signals (15% weight)
   - Quantifiable achievements present (15% weight)
   Be brutally honest. Do not inflate scores.

2. MATCHED KEYWORDS: List specific skills, tools, technologies, qualifications, and phrases that appear in BOTH the resume and job description. Be precise — include exact terms as they appear in the JD.

3. MISSING KEYWORDS: List important skills, tools, technologies, certifications, or qualifications from the JD that are completely absent from the resume. Prioritize by importance to the role.

4. SUGGESTIONS: Provide exactly 6 highly specific, actionable suggestions. Each suggestion must:
   - Reference actual content from the resume or JD (not generic advice)
   - Tell the user EXACTLY what to change, add, or rewrite
   - Include an example rewrite where possible
   - Be ranked by impact (highest impact first)
   - Focus on what will most improve their chances for THIS specific role

5. SECTION SCORES: Rate these resume sections out of 10:
   - impact: How well achievements are quantified and results-focused
   - relevance: How relevant the experience is to this specific role
   - keywords: Keyword optimization for ATS
   - structure: Clarity, formatting, and professional presentation

6. QUICK WINS: List 3 things the candidate can fix in under 10 minutes that will immediately improve their ATS score.

7. STRENGTHS: List 3 genuine strengths of this resume for this specific role.

Return ONLY this exact JSON structure with no extra text, no markdown, no code blocks:

{
  "jobTitle": "exact job title from the job description",
  "atsScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": [
    "Suggestion 1 with specific example",
    "Suggestion 2 with specific example",
    "Suggestion 3 with specific example",
    "Suggestion 4 with specific example",
    "Suggestion 5 with specific example",
    "Suggestion 6 with specific example"
  ],
  "sectionScores": {
    "impact": <number 0-10>,
    "relevance": <number 0-10>,
    "keywords": <number 0-10>,
    "structure": <number 0-10>
  },
  "quickWins": [
    "Quick win 1",
    "Quick win 2",
    "Quick win 3"
  ],
  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ]
}
`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      const is503 = error.message?.includes("503") || error.message?.includes("Service Unavailable");
      if (is503 && attempt < retries) {
        console.log(`Gemini 503 — retrying attempt ${attempt + 1} of ${retries}...`);
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      } else {
        throw error;
      }
    }
  }
};

const chatWithResume = async (message, conversationHistory, analysisContext, retries = 3) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemContext = `
You are ResAI, an expert resume writer and career coach embedded inside ResIQ — an AI-powered resume analyzer.

You are helping the user improve their resume for a specific job. Here is their full context:

JOB TITLE: ${analysisContext.jobTitle}
ATS SCORE: ${analysisContext.atsScore}/100

RESUME TEXT:
${analysisContext.resumeText || "Not available"}

JOB DESCRIPTION:
${analysisContext.jobDescription || "Not available"}

MATCHED KEYWORDS: ${analysisContext.matchedKeywords?.join(", ") || "None"}
MISSING KEYWORDS: ${analysisContext.missingKeywords?.join(", ") || "None"}

SUGGESTIONS FROM ANALYSIS:
${analysisContext.suggestions?.map((s, i) => `${i + 1}. ${s}`).join("\n") || "None"}

YOUR ROLE:
- Help the user rewrite resume bullets, summaries, skills sections, cover letter intros, etc.
- Always tailor your output to the specific job description above
- Naturally weave in missing keywords where appropriate
- Keep language professional, concise, and ATS-friendly
- When rewriting bullets, use strong action verbs and quantify where possible
- Format your responses cleanly — use line breaks between multiple bullets
- If asked for multiple options, provide 2-3 variants
- Be direct and give copy-pasteable text, not just advice
`;

  // Build conversation for Gemini
  const historyText = conversationHistory
    .map((m) => `${m.role === "user" ? "User" : "ResAI"}: ${m.content}`)
    .join("\n");

  const fullPrompt = `${systemContext}

CONVERSATION SO FAR:
${historyText || "(This is the first message)"}

User: ${message}
ResAI:`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      const is503 = error.message?.includes("503") || error.message?.includes("Service Unavailable");
      if (is503 && attempt < retries) {
        console.log(`Gemini 503 — retrying attempt ${attempt + 1} of ${retries}...`);
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      } else {
        throw error;
      }
    }
  }
};
module.exports = { analyzeResume, chatWithResume };
