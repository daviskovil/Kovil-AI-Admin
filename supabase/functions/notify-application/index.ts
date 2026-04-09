import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const TEAM = ['davis@kovil.ai', 'sahdev@kovil.ai']
const FROM = 'Kovil AI <admin@kovil.ai>'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
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

    const {
      fullName, email, phone, linkedin, github, location, timezone,
      primaryRole, yearsExperience, specializations = [], languages = [], aiTools = [],
      impactProject, availability, engagementType = [], rateRange,
    } = data

    if (!email || !fullName) {
      return new Response(JSON.stringify({ ok: false, error: 'email and fullName required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const firstName = fullName.split(' ')[0]

    // ── TEAM NOTIFICATION EMAIL ─────────────────────────────────────────────
    const teamSubject = `👤 New Application — ${fullName} for ${primaryRole ?? 'AI Engineer'}`
    const allSkills = [...specializations, ...languages, ...aiTools]

    const tag = (text: string, color = '#f3f4f6', textColor = '#374151') =>
      `<span style="display:inline-block;background:${color};color:${textColor};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;margin:2px;">${text}</span>`

    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:150px;vertical-align:top;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${value}</td>
      </tr>`

    const teamHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <div style="background:#111827;padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Kovil AI · New Application</p>
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0;line-height:1.3;">👤 ${primaryRole ?? 'AI Engineer'} Application</h1>
    </div>

    <div style="padding:32px;">
      <div style="background:#fff7f5;border:1px solid #ffe4d6;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${fullName}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#FF4F00;font-weight:600;">${primaryRole ?? 'AI Engineer'}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        ${row('Email', `<a href="mailto:${email}" style="color:#FF4F00;text-decoration:none;">${email}</a>`)}
        ${phone ? row('Phone', phone) : ''}
        ${row('LinkedIn', linkedin ? `<a href="${linkedin.startsWith('http') ? linkedin : 'https://' + linkedin}" style="color:#0077b5;text-decoration:none;">View Profile →</a>` : '—')}
        ${github ? row('GitHub', `<a href="${github.startsWith('http') ? github : 'https://' + github}" style="color:#111827;text-decoration:none;">View Profile →</a>`) : ''}
        ${row('Location', `${location ?? '—'}${timezone ? ` (${timezone})` : ''}`)}
        ${row('Experience', yearsExperience ?? '—')}
        ${row('Availability', availability ?? '—')}
        ${engagementType.length ? row('Open to', engagementType.join(', ')) : ''}
        ${rateRange ? row('Rate Range', rateRange) : ''}
      </table>

      ${allSkills.length ? `
      <div style="margin-top:20px;">
        <p style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 10px;">Skills & Tools</p>
        <div>${specializations.map((s: string) => tag(s, '#fff7f5', '#FF4F00')).join('')}${languages.map((l: string) => tag(l, '#eff6ff', '#2563eb')).join('')}${aiTools.map((t: string) => tag(t, '#f0fdf4', '#16a34a')).join('')}</div>
      </div>` : ''}

      ${impactProject ? `
      <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #111827;">
        <p style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Most Impactful Project</p>
        <p style="color:#374151;font-size:13px;line-height:1.7;margin:0;">${impactProject}</p>
      </div>` : ''}

      <div style="margin-top:28px;text-align:center;">
        <a href="https://admin.kovil.ai/ops/applications" style="display:inline-block;background:#111827;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:13px;font-weight:600;">
          View in Admin Panel →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:12px;">
          Reply to <a href="mailto:${email}" style="color:#FF4F00;">${email}</a>
        </p>
      </div>
    </div>

    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        Applied ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })} EST · kovil.ai/apply
      </p>
    </div>
  </div>
</body>
</html>`

    // ── APPLICANT CONFIRMATION EMAIL ────────────────────────────────────────
    const confirmSubject = `Your application to Kovil AI — we'll be in touch`

    const confirmHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <div style="background:#111827;padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Kovil AI · Engineer Network</p>
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0;line-height:1.3;">Application received ✓</h1>
    </div>

    <div style="padding:32px;">
      <p style="font-size:16px;color:#111827;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 16px;">
        Thanks for applying to join the Kovil AI engineer network as a <strong>${primaryRole ?? 'AI Engineer'}</strong>. We've received your application and our team will review it carefully.
      </p>
      <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 28px;">
        We're selective about who we bring on — we only work with engineers who are in the top tier of their craft. If your profile is a strong match, we'll reach out within <strong>3–5 business days</strong> to schedule a technical interview.
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
        <p style="color:#111827;font-size:13px;font-weight:700;margin:0 0 12px;">What happens next</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="background:#FF4F00;color:white;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px;">1</span>
            <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">Our team reviews your profile and skills</p>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="background:#FF4F00;color:white;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px;">2</span>
            <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">If there's a match, we schedule a 30-min technical interview</p>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <span style="background:#FF4F00;color:white;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px;">3</span>
            <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">Approved engineers get matched to relevant client projects</p>
          </div>
        </div>
      </div>

      <p style="font-size:14px;color:#6b7280;margin:0;">
        Best,<br>
        <strong style="color:#111827;">The Kovil AI Team</strong><br>
        <a href="https://kovil.ai" style="color:#FF4F00;text-decoration:none;">kovil.ai</a>
      </p>
    </div>

    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        This confirms receipt of your application. Questions? Reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`

    // Send both emails
    const [teamResult, confirmResult] = await Promise.all([
      sendEmail(TEAM, teamSubject, teamHtml),
      sendEmail(email, confirmSubject, confirmHtml),
    ])

    console.log('notify-application team sent:', teamResult)
    console.log('notify-application confirmation sent:', confirmResult)

    return new Response(JSON.stringify({ ok: true, team: teamResult.id, confirm: confirmResult.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('notify-application error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
