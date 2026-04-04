import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const TEAM = ['davis@kovil.ai', 'sahdev@kovil.ai']
const FROM = 'Kovil AI <admin@kovil.ai>'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

const ENGAGEMENT_LABELS: Record<string, string> = {
  managed_ai_builder: 'Managed AI Engineer',
  outcome_project: 'Outcome-Based AI Project',
  app_rescue: 'AI Reliability & App Rescue',
  'hire-engineer': 'Hire AI Engineer',
  'outcome-project': 'Outcome-Based Project',
  'app-rescue': 'App Rescue',
  apply: 'Looking to Apply',
  other: 'General Inquiry',
}

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website Onboarding Modal',
  contact_form: 'Contact Page Form',
}

function buildTeamEmail(data: {
  email: string
  name?: string
  company?: string
  engagement_type?: string
  message?: string
  project_description?: string
  source?: string
}): { subject: string; html: string } {
  const engLabel = ENGAGEMENT_LABELS[data.engagement_type ?? ''] ?? data.engagement_type ?? 'Not specified'
  const srcLabel = SOURCE_LABELS[data.source ?? ''] ?? data.source ?? 'Website'
  const msgText = (data.message || data.project_description || '').trim() || 'No message provided'
  const subject = `🔥 New Lead — ${engLabel} from ${data.email}`

  const row = (label: string, value: string, highlight = false) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:130px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:${highlight ? '600' : '400'};color:${highlight ? '#FF4F00' : '#111827'};">${value}</td>
    </tr>`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <div style="background:#FF4F00;padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.7);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Kovil AI · New Lead</p>
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0;line-height:1.3;">🔥 Business Lead Received</h1>
    </div>

    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;">
        ${data.name ? row('Name', data.name) : ''}
        ${data.company ? row('Company', data.company) : ''}
        ${row('Email', `<a href="mailto:${data.email}" style="color:#FF4F00;text-decoration:none;">${data.email}</a>`, true)}
        ${row('Engagement', `<span style="background:#fff7f5;color:#FF4F00;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${engLabel}</span>`)}
        ${row('Source', srcLabel)}
      </table>

      <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #FF4F00;">
        <p style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Message</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">${msgText}</p>
      </div>

      <div style="margin-top:28px;text-align:center;">
        <a href="https://admin.kovil.ai/ops/leads" style="display:inline-block;background:#FF4F00;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:13px;font-weight:600;">
          View in Admin Panel →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:12px;">
          Reply directly to <a href="mailto:${data.email}" style="color:#FF4F00;">${data.email}</a>
        </p>
      </div>
    </div>

    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        Submitted ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })} EST · kovil.ai
      </p>
    </div>
  </div>
</body>
</html>`

  return { subject, html }
}

function buildConfirmationEmail(data: {
  email: string
  name?: string
  engagement_type?: string
}): { subject: string; html: string } {
  const engLabel = ENGAGEMENT_LABELS[data.engagement_type ?? ''] ?? 'AI Engineering'
  const firstName = data.name ? data.name.split(' ')[0] : 'there'
  const subject = `We've received your inquiry — Kovil AI`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <div style="background:#FF4F00;padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.7);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Kovil AI</p>
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0;line-height:1.3;">We got your message ✓</h1>
    </div>

    <div style="padding:32px;">
      <p style="font-size:16px;color:#111827;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 16px;">
        Thanks for reaching out about <strong>${engLabel}</strong>. We've received your inquiry and one of our team members will be in touch within <strong>1 business day</strong>.
      </p>
      <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 28px;">
        In the meantime, feel free to browse our <a href="https://kovil.ai/case-studies" style="color:#FF4F00;text-decoration:none;font-weight:600;">case studies</a> or learn more about <a href="https://kovil.ai/how-it-works" style="color:#FF4F00;text-decoration:none;font-weight:600;">how we work</a>.
      </p>

      <div style="background:#fff7f5;border:1px solid #ffe4d6;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
        <p style="color:#FF4F00;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Prefer to talk now?</p>
        <p style="font-size:13px;color:#374151;margin:0 0 14px;">Skip the wait — book a free 30-minute discovery call directly on our calendar.</p>
        <a href="https://calendly.com/kovil-ai" style="display:inline-block;background:#FF4F00;color:white;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:600;">
          Book a Call →
        </a>
      </div>

      <p style="font-size:14px;color:#6b7280;margin:0;">
        Best,<br>
        <strong style="color:#111827;">The Kovil AI Team</strong><br>
        <a href="https://kovil.ai" style="color:#FF4F00;text-decoration:none;">kovil.ai</a>
      </p>
    </div>

    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        This is a confirmation of your inquiry to Kovil AI. Questions? Reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`

  return { subject, html }
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  return res.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  try {
    const data = await req.json()
    if (!data.email) return new Response(JSON.stringify({ ok: false, error: 'email required' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })

    // 1. Team notification email
    const { subject: teamSubject, html: teamHtml } = buildTeamEmail(data)
    const teamResult = await sendEmail(TEAM, teamSubject, teamHtml)
    console.log('notify-lead team email sent:', teamResult)

    // 2. Confirmation email to submitter
    const { subject: confirmSubject, html: confirmHtml } = buildConfirmationEmail(data)
    const confirmResult = await sendEmail(data.email, confirmSubject, confirmHtml)
    console.log('notify-lead confirmation sent:', confirmResult)

    return new Response(JSON.stringify({ ok: true, team: teamResult.id, confirm: confirmResult.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('notify-lead error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
