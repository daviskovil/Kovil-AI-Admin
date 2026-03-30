import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'

const router = Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

router.post('/draft', requireAuth, agentLimiter, async (req, res) => {
  const { type, lead, tone } = req.body

  const prompts = {
    lead_followup: `Draft a follow-up email to a potential client lead for Kovil AI.
Lead details: ${JSON.stringify(lead)}
Tone: ${tone || 'professional and warm'}
Kovil AI helps companies ship AI agents with managed, elite AI builders. Reference their specific engagement type and project description.`,

    builder_welcome: `Draft a welcome email to a newly approved AI builder joining Kovil AI's network.
Builder details: ${JSON.stringify(lead)}
Tone: ${tone || 'warm, professional, exciting'}
Explain next steps: profile review, project matching process, how Kovil AI works.`,

    builder_rejection: `Draft a respectful rejection email to an AI builder applicant for Kovil AI.
Applicant details: ${JSON.stringify(lead)}
Tone: ${tone || 'empathetic, professional, encouraging'}
Be honest but kind. Leave the door open for reapplication in 6 months.`,

    lead_intro: `Draft an introduction email to a new client lead for Kovil AI.
Lead details: ${JSON.stringify(lead)}
Tone: ${tone || 'confident, concise, value-focused'}
Include a Calendly booking link: https://calendly.com/kovil-ai/talent`
  }

  const prompt = `${prompts[type] || prompts.lead_intro}\n\nReturn JSON only: { subject, body, ps_note }`

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
