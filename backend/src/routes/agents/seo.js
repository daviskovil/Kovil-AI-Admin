import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/analyze', requireAuth, agentLimiter, async (req, res) => {
  const { url, page_content, page_title, meta_description, h1, internal_links, images } = req.body

  const prompt = `You are an expert SEO auditor. Analyze the following page data for kovil.ai and provide a comprehensive SEO audit.

Page URL: ${url}
Page Title: ${page_title || 'Not provided'}
Meta Description: ${meta_description || 'Not provided'}
H1: ${h1 || 'Not provided'}
Internal Links Count: ${internal_links || 'Unknown'}
Images without alt: ${images?.without_alt || 0}
Page Content Preview: ${page_content ? page_content.slice(0, 2000) : 'Not provided'}

Provide a detailed audit covering:
1. **On-Page SEO** - Title tag, meta description, headings structure, keyword usage, content quality
2. **Technical SEO** - Page speed indicators, mobile-friendliness signals, structured data recommendations, canonical tags
3. **Content SEO** - Readability, keyword density, LSI keywords, content gaps
4. **Action Items** - Prioritized list of fixes (Critical / High / Medium / Low)
5. **SEO Score** - Overall score out of 100 with breakdown

Format your response as structured JSON with these exact keys: { score, on_page, technical, content, action_items, summary }`

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
