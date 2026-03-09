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

  const isForSomeoneElse = !!capsule.recipient_email
  const toEmail          = capsule.recipient_email || profile.email
  const senderName       = profile.name?.split(' ')[0] ?? 'Someone'
  const recipientName    = isForSomeoneElse ? 'Friend' : senderName

  const subject     = isForSomeoneElse ? `📬 A message from ${senderName} is waiting` : `📬 A message from your past self is waiting`
  const headerTitle = isForSomeoneElse ? `A letter from ${senderName}` : `A letter from your past self`
  const sentOn      = new Date(capsule.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const introText   = isForSomeoneElse 
    ? `On <strong>${sentOn}</strong>, ${senderName} sealed a time capsule for this very moment. Today is the day it was meant to arrive.` 
    : `On <strong>${sentOn}</strong>, you sealed a time capsule for this very moment. Today is the day it was meant to arrive.`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background:'var(--bg-base)';font-family:Georgia,serif;">
  <div style="max-width:560px;margin:48px auto;background:'var(--bg-panel)';border-radius:12px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.14);">

    <div style="background:'var(--bg-base)';padding:44px 48px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">✉</div>
      <h1 style="color:'var(--accent)';font-style:italic;font-weight:400;font-size:24px;margin:0;">${headerTitle}</h1>
      <p style="color:rgba(212,168,83,0.5);font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.14em;margin:12px 0 0;text-transform:uppercase;">Future Self Messenger</p>
    </div>

    <div style="padding:44px 48px;background:'var(--bg-panel)';">
      <p style="font-style:italic;font-size:17px;color:'var(--text-main)';margin:0 0 20px;">Dear ${recipientName},</p>
      <p style="font-size:15px;line-height:1.85;color:'var(--text-muted)';margin:0 0 24px;">
        ${introText}
      </p>

      ${capsule.prompt ? `
      <div style="border-left:3px solid var(--accent);padding:14px 20px;margin:0 0 28px;background:rgba(212,168,83,0.06);border-radius:0 8px 8px 0;">
        <p style="font-style:italic;font-size:13px;color:'var(--text-main)';margin:0;line-height:1.7;">"${capsule.prompt}"</p>
      </div>` : ''}

      ${capsule.content ? `
      <div style="background:'var(--bg-base)';border:1px solid var(--border);border-radius:10px;padding:30px 34px;margin:0 0 32px;">
        <p style="font-style:italic;font-size:16px;line-height:2;color:'var(--text-main)';margin:0;white-space:pre-line;">${capsule.content}</p>
      </div>` : ''}

      ${capsule.type !== 'text' ? `
      <div style="text-align:center;margin:0 0 32px;">
        <a href="${APP_URL}/journal" style="display:inline-block;background:'var(--accent)';color:#fff;padding:15px 36px;font-family:'Courier New',monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
          ${capsule.type === 'audio' ? '🎙 Play the voice note' : '📹 Watch the video'} →
        </a>
      </div>` : ''}

      <div style="text-align:center;padding-top:28px;border-top:1px solid var(--border);">
        <a href="${APP_URL}/journal" style="color:'var(--text-main)';font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border:1px solid var(--border);padding:11px 26px;border-radius:2px;display:inline-block;">
          Open the journal →
        </a>
      </div>
    </div>

    <div style="background:'var(--bg-base)';padding:20px 48px;text-align:center;">
      <p style="color:'var(--text-faint)';font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.1em;margin:0;text-transform:uppercase;">
        Future Self Messenger
      </p>
    </div>
  </div>
</body></html>`

  try {
    const { error } = await resend.emails.send({
      from:    FROM,
      to:      toEmail,
      subject,
      html,
    })
    if (error) { console.error('[email] error:', error); return { ok: false } }
    return { ok: true }
  } catch (err) {
    console.error('[email] unexpected error:', err)
    return { ok: false }
  }
}
