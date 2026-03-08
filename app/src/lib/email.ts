// src/lib/email.ts
import { Resend } from 'resend'
import type { Profile, Capsule } from '@/types'

const resend  = new Resend(process.env.RESEND_API_KEY)
const FROM    = process.env.FROM_EMAIL         || 'noreply@futureself.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://futureself.app'

export async function sendDeliveryEmail(profile: Profile, capsule: Capsule) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] No RESEND_API_KEY — skipping')
    return { ok: false }
  }

  const name     = profile.name?.split(' ')[0] ?? 'Friend'
  const sentOn   = new Date(capsule.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>A letter from your past self</title>
</head>
<body style="margin:0;padding:0;background:#f7f2e8;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:48px auto;background:#faf6ee;border-radius:12px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.14);">

    <div style="background:#5c1a1a;padding:44px 48px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">✉</div>
      <h1 style="color:#d4a853;font-style:italic;font-weight:400;font-size:24px;margin:0;">A letter from your past self</h1>
      <p style="color:rgba(212,168,83,0.5);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.14em;margin:12px 0 0;text-transform:uppercase;">Future Self Messenger</p>
    </div>

    <div style="padding:44px 48px;">
      <p style="font-style:italic;font-size:17px;color:#4a3f35;margin:0 0 20px;">Dear ${name},</p>
      <p style="font-size:15px;line-height:1.85;color:#2a1e14;margin:0 0 24px;">
        On <strong>${sentOn}</strong>, you sealed a time capsule for this very moment. Today is the day it was meant to arrive.
      </p>

      ${capsule.prompt ? `
      <div style="border-left:3px solid rgba(196,98,45,0.45);padding:14px 20px;margin:0 0 28px;background:rgba(196,98,45,0.06);border-radius:0 8px 8px 0;">
        <p style="font-style:italic;font-size:13px;color:#6a5040;margin:0;line-height:1.7;">"${capsule.prompt}"</p>
      </div>` : ''}

      ${capsule.type === 'text' && capsule.content ? `
      <div style="background:#f5efe0;border:1px solid #e0d4be;border-radius:10px;padding:30px 34px;margin:0 0 32px;">
        <p style="font-style:italic;font-size:16px;line-height:2;color:#1c1410;margin:0;white-space:pre-line;">${capsule.content}</p>
      </div>` : `
      <div style="text-align:center;margin:0 0 32px;">
        <a href="${APP_URL}/journal" style="display:inline-block;background:#c4622d;color:#fff;padding:15px 36px;font-family:'Courier New',monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
          ${capsule.type === 'audio' ? '🎙 Play your voice note' : '📹 Watch your video'} →
        </a>
      </div>`}

      <div style="text-align:center;padding-top:28px;border-top:1px solid #e8e0d0;">
        <a href="${APP_URL}/journal" style="color:#c4622d;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border:1px solid rgba(196,98,45,0.4);padding:11px 26px;border-radius:2px;display:inline-block;">
          Open your journal →
        </a>
      </div>
    </div>

    <div style="background:#ede5d0;padding:20px 48px;text-align:center;">
      <p style="color:#9a8878;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.1em;margin:0;text-transform:uppercase;">
        Future Self Messenger · Inspired by a quiet café in Tokyo
      </p>
    </div>
  </div>
</body></html>`

  try {
    const { error } = await resend.emails.send({
      from:    FROM,
      to:      profile.email,
      subject: `📬 A message from your past self is waiting`,
      html,
    })
    if (error) { console.error('[email] error:', error); return { ok: false } }
    return { ok: true }
  } catch (err) {
    console.error('[email] unexpected error:', err)
    return { ok: false }
  }
}
