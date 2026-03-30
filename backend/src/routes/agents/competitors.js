import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/analyze', requireAuth, agentLimiter, async (req, res) => {
  const { competitors, focus_area } = req.body

  const prompt = `You are a competitive intelligence analyst specializing in AI staffing and development platforms. Analyze competitors for Kovil AI.

Kovil AI's positioning: Managed AI builders, outcome-based AI projects, AI reliability & app rescue. Elite vetted AI specialists with milestone-gated sprints.

Competitors to analyze: ${competitors || 'Toptal, Upwork, Gun.io, Lemon.io, AE Studio, Andela, Scale AI'}
Focus Area: ${focus_area || 'General competitive analysis'}

Provide:
1. **Competitor Profiles** - Brief summary of each competitor's positioning and strengths
2. **Keyword Gaps** - Keywords competitors rank for that Kovil AI doesn't
3. **Content Gaps** - Content topics they cover that Kovil AI should address
4. **Kovil AI Advantages** - Where Kovil AI has a clear differentiator
5. **Threat Assessment** - Which competitors are most dangerous and why
6. **Opportunities** - Underserved niches competitors are missing
7. **Recommended Positioning** - How Kovil AI should differentiate in messaging

Return as JSON: { competitor_profiles, keyword_gaps, content_gaps, advantages, threats, opportunities, positioning_recommendations, summary }`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
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
