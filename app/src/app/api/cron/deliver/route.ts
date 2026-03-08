import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }            from '@/lib/supabase-server'
import { sendDeliveryEmail }        from '@/lib/email'
import type { Capsule, Profile }    from '@/types'

// GET /api/cron/deliver
// Called hourly by Vercel Cron. Protected by CRON_SECRET Bearer token.
export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────
  const auth   = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const startedAt = Date.now()
  let delivered = 0, failed = 0, emailed = 0

  try {
    // ── Fetch due capsules (up to 100 per run) ────────────────
    const { data: capsules, error: fetchErr } = await supabaseAdmin
      .from('capsules')
      .select('*')
      .eq('status', 'sealed')
      .lte('delivery_at', new Date().toISOString())
      .limit(100)

    if (fetchErr) {
      console.error('[cron] fetch error:', fetchErr)
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    if (!capsules?.length) {
      return NextResponse.json({ ok: true, delivered: 0, message: 'No capsules due.' })
    }

    // ── Process each capsule ──────────────────────────────────
    for (const capsule of capsules as Capsule[]) {
      try {
        // Mark delivered
        const { error: updateErr } = await supabaseAdmin
          .from('capsules')
          .update({ status: 'delivered', delivered_at: new Date().toISOString() })
          .eq('id', capsule.id)
          .eq('status', 'sealed') // double-check, avoid race

        if (updateErr) { console.error('[cron] update error:', capsule.id, updateErr); failed++; continue }
        delivered++

        // Fetch profile for email
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', capsule.user_id)
          .single()

        if (profile && !capsule.email_sent) {
          const { ok } = await sendDeliveryEmail(profile as Profile, capsule)
          if (ok) {
            await supabaseAdmin.from('capsules').update({ email_sent: true }).eq('id', capsule.id)
            emailed++
          }
        }
      } catch (err) {
        console.error('[cron] capsule error:', capsule.id, err)
        // Mark as failed so we know to retry manually
        await supabaseAdmin.from('capsules').update({ status: 'failed' }).eq('id', capsule.id)
        failed++
      }
    }
  } catch (err) {
    console.error('[cron] unexpected error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }

  const ms = Date.now() - startedAt
  console.log(`[cron] done — delivered:${delivered} failed:${failed} emailed:${emailed} time:${ms}ms`)
  return NextResponse.json({ ok: true, delivered, failed, emailed, ms })
}
