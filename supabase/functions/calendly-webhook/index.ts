import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const TEAM = ['davis@kovil.ai', 'sahdev@kovil.ai']
const FROM = 'Kovil AI <admin@kovil.ai>'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Calendly-Webhook-Signature',
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return isoString
  }
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
    const body = await req.json()
    console.log('calendly-webhook received:', JSON.stringify(body).slice(0, 500))

    const event = body.event ?? body.payload?.event_type_name ?? 'invitee.created'

    // Only process scheduled (created) events, not cancellations
    if (!event.includes('created')) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Calendly v2 webhook payload structure
    const payload = body.payload ?? body

    // Extract invitee info — handles both v1 and v2 formats
    const inviteeName   = payload.invitee_name  ?? payload.name  ?? payload.invitee?.name  ?? 'Unknown'
    const inviteeEmail  = payload.invitee_email ?? payload.email ?? payload.invitee?.email ?? 'Unknown'
    const eventName     = payload.event_type_name ?? payload.event_type?.name ?? 'Discovery Call'
    const startTime     = payload.event_start_time ?? payload.scheduled_event?.start_time ?? payload.start_time ?? ''
    const endTime       = payload.event_end_time   ?? payload.scheduled_event?.end_time   ?? payload.end_time   ?? ''
    const cancelUrl     = payload.cancel_url    ?? payload.invitee?.cancel_url    ?? ''
    const rescheduleUrl = payload.reschedule_url ?? payload.invitee?.reschedule_url ?? ''
    const timezone      = payload.invitee_timezone ?? payload.invitee?.timezone ?? 'Unknown'
    const location      = payload.location ?? payload.scheduled_event?.location?.join_url
      ?? payload.scheduled_event?.location?.location ?? 'To be provided'
    const firstName     = inviteeName.split(' ')[0]

    const qas: Array<{ question: string; answer: string }> = payload.questions_and_answers ?? []

    const formattedStart = startTime ? formatTime(startTime) : 'Time to be confirmed'
    const shortDate = startTime ? formatTime(startTime).split(',').slice(0, 2).join(',') : 'TBD'

    // ── TEAM NOTIFICATION EMAIL ─────────────────────────────────────────────
    const teamSubject = `📅 Call Booked — ${inviteeName} on ${shortDate}`

    const qaRows = qas.map(qa => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;width:180px;vertical-align:top;">${qa.question}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:12px;color:#374151;">${qa.answer || '—'}</td>
      </tr>`).join('')

    const teamHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <div style="background:#0f172a;padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Kovil AI · Calendly</p>
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0;line-height:1.3;">📅 Discovery Call Booked</h1>
    </div>

    <div style="padding:32px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
        <p style="color:#15803d;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">SCHEDULED FOR</p>
        <p style="color:#111827;font-size:18px;font-weight:700;margin:0;">${formattedStart}</p>
        ${endTime && startTime ? `<p style="color:#6b7280;font-size:12px;margin:6px 0 0;">Until ${formatTime(endTime)}</p>` : ''}
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:130px;">Name</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#111827;">${inviteeName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;"><a href="mailto:${inviteeEmail}" style="color:#FF4F00;text-decoration:none;font-weight:600;">${inviteeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Event</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${eventName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Timezone</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">${timezone}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;${qas.length ? 'border-bottom:1px solid #f3f4f6;' : ''}color:#6b7280;font-size:13px;">Location</td>
          <td style="padding:10px 0;${qas.length ? 'border-bottom:1px solid #f3f4f6;' : ''}font-size:13px;color:#111827;">${location}</td>
        </tr>
        ${qaRows}
      </table>

      <div style="margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        ${cancelUrl ? `<a href="${cancelUrl}" style="display:inline-block;background:#f3f4f6;color:#374151;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:600;">Cancel Event</a>` : ''}
        ${rescheduleUrl ? `<a href="${rescheduleUrl}" style="display:inline-block;background:#f3f4f6;color:#374151;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:600;">Reschedule</a>` : ''}
        <a href="https://calendly.com/kovil-ai" style="display:inline-block;background:#FF4F00;color:white;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:600;">View on Calendly →</a>
      </div>

      <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px;">
        Reply directly to <a href="mailto:${inviteeEmail}" style="color:#FF4F00;">${inviteeEmail}</a>
      </p>
    </div>

    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        Booking confirmed ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })} EST
      </p>
    </div>
  </div>
</body>
</html>`

    // ── INVITEE CONFIRMATION EMAIL ──────────────────────────────────────────
    const confirmSubject = `Your call with Kovil AI is confirmed — ${shortDate}`

    const confirmHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

    <div style="background:#FF4F00;padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.7);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Kovil AI</p>
      <h1 style="color:white;font-size:22px;font-weight:700;margin:0;line-height:1.3;">Your call is confirmed ✓</h1>
    </div>

    <div style="padding:32px;">
      <p style="font-size:16px;color:#111827;margin:0 0 20px;">Hi ${firstName},</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
        <p style="color:#15803d;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">SCHEDULED FOR</p>
        <p style="color:#111827;font-size:20px;font-weight:700;margin:0;">${formattedStart}</p>
        ${endTime && startTime ? `<p style="color:#6b7280;font-size:13px;margin:6px 0 0;">Until ${formatTime(endTime)}</p>` : ''}
      </div>

      <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 16px;">
        We're looking forward to speaking with you about how Kovil AI can help. On the call we'll learn about your project, answer your questions, and walk you through how our process works.
      </p>

      <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 24px;">
        <strong>Meeting location:</strong> ${location}
      </p>

      ${(cancelUrl || rescheduleUrl) ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
        <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Need to change plans?</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${rescheduleUrl ? `<a href="${rescheduleUrl}" style="display:inline-block;background:#f3f4f6;color:#374151;text-decoration:none;padding:10px 18px;border-radius:7px;font-size:13px;font-weight:600;">Reschedule</a>` : ''}
          ${cancelUrl ? `<a href="${cancelUrl}" style="display:inline-block;background:#f3f4f6;color:#374151;text-decoration:none;padding:10px 18px;border-radius:7px;font-size:13px;font-weight:600;">Cancel</a>` : ''}
        </div>
      </div>` : ''}

      <p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 4px;">Talk soon,</p>
      <p style="font-size:14px;color:#6b7280;margin:0;">
        <strong style="color:#111827;">The Kovil AI Team</strong><br>
        <a href="https://kovil.ai" style="color:#FF4F00;text-decoration:none;">kovil.ai</a>
      </p>
    </div>

    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        Booking confirmed via Calendly. Reply to this email with any questions.
      </p>
    </div>
  </div>
</body>
</html>`

    // Send both emails in parallel
    const [teamResult, confirmResult] = await Promise.all([
      sendEmail(TEAM, teamSubject, teamHtml),
      inviteeEmail !== 'Unknown' ? sendEmail(inviteeEmail, confirmSubject, confirmHtml) : Promise.resolve({ id: null }),
    ])

    console.log('calendly-webhook team email sent:', teamResult)
    console.log('calendly-webhook confirmation sent:', confirmResult)

    return new Response(JSON.stringify({ ok: true, team: teamResult.id, confirm: confirmResult.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('calendly-webhook error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
