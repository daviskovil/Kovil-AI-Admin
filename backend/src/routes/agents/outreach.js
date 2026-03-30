import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../../middleware/auth.js'
import { agentLimiter } from '../../middleware/rateLimit.js'

const router = Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/draft', requireAuth, agentLimiter, async (req, res) => {
  const { type, lead, tone } = req.body
  // type: 'lead_followup' | 'builder_welcome' | 'builder_rejection' | 'lead_intro'

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

  const prompt = prompts[type] || prompts.lead_followup

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: `${prompt}\n\nReturn JSON: { subject, body, ps_note }` }]
    })

    let result = message.content[0].text
    try { result = JSON.parse(result) } catch { /* return as text */ }
    res.json({ result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
