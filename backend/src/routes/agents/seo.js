import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'

const router = Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    const result = await model.generateContent(prompt)
    let text = result.response.text()
    // Strip markdown code fences if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    let parsed
    try { parsed = JSON.parse(text) } catch { parsed = text }
    res.json({ result: parsed })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
