import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/analyze', requireAuth, agentLimiter, async (req, res) => {
  const { page_content, target_questions } = req.body

  const prompt = `You are an AEO (Answer Engine Optimization) expert. Analyze the following content for kovil.ai and optimize it to rank in AI-powered answer engines like Perplexity, ChatGPT, Google SGE, and Bing Copilot.

Content: ${page_content ? page_content.slice(0, 3000) : 'Not provided'}
Target Questions: ${target_questions || 'Not specified'}

Provide:
1. **Question Coverage** - What questions does this content answer? What's missing?
2. **Snippet Optimization** - How to restructure content for featured snippets and AI summaries
3. **Schema Markup** - Recommended FAQ, HowTo, or Article schema
4. **Direct Answer Format** - Rewrite key sections for direct answer format
5. **Entity Clarity** - Is Kovil AI clearly defined as a brand/service?
6. **Recommended Questions to Target** - 10 high-value questions Kovil AI should answer
7. **AEO Score** - Score out of 100

Return as JSON: { score, question_coverage, snippet_recommendations, schema_markup, entity_analysis, target_questions, summary }`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    let result = message.content[0].text
    try { result = JSON.parse(result) } catch { /* return as text */ }
    res.json({ result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
