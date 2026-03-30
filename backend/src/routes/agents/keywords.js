import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'

const router = Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

router.post('/analyze', requireAuth, agentLimiter, async (req, res) => {
  const { seed_keywords, target_audience, current_content } = req.body

  const prompt = `You are a keyword research specialist for AI staffing and development companies. Perform keyword analysis for Kovil AI, a managed AI builder platform.

Seed Keywords: ${seed_keywords || 'AI engineers, hire AI developers, AI staffing'}
Target Audience: ${target_audience || 'CTOs, product managers, startups, enterprises'}
Current Content Sample: ${current_content ? current_content.slice(0, 2000) : 'Not provided'}

Kovil AI offers: Managed AI Builders, Outcome-Based AI Projects, AI Reliability & App Rescue. Elite vetted AI specialists with milestone-gated sprints.

Provide:
1. **Primary Keywords** - 10 high-intent keywords with estimated difficulty (Easy/Medium/Hard)
2. **Long-tail Keywords** - 20 specific, low-competition phrases
3. **Question Keywords** - 15 "how to", "what is", "best" style queries
4. **Negative Keywords** - Terms to avoid targeting
5. **Content Gaps** - Topics competitors cover that Kovil AI doesn't yet
6. **Quick Wins** - Keywords Kovil AI can rank for within 3 months
7. **Keyword Clusters** - Group keywords into content clusters

Return as JSON: { primary_keywords, long_tail, question_keywords, negative_keywords, content_gaps, quick_wins, clusters, summary }`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const result = await model.generateContent(prompt)
    let text = result.response.text()
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let parsed
    try { parsed = JSON.parse(text) } catch { parsed = text }
    res.json({ result: parsed })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
