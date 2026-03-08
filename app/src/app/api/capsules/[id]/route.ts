import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, supabaseAdmin, signedUrl, BUCKET_MEDIA, BUCKET_SEAL } from '@/lib/supabase-server'

type Ctx = { params: { id: string } }

// GET /api/capsules/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  const sb = createServerSupabase()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: capsule, error } = await sb.from('capsules').select('*')
    .eq('id', params.id).eq('user_id', session.user.id).single()
  if (error || !capsule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Hydrate signed URLs only for delivered capsules
  let media_url      = null
  let seal_image_url = null
  if (capsule.status === 'delivered') {
    if (capsule.media_path) media_url      = await signedUrl(BUCKET_MEDIA, capsule.media_path)
    if (capsule.seal_image) seal_image_url = await signedUrl(BUCKET_SEAL,  capsule.seal_image)
  }

  return NextResponse.json({ data: { ...capsule, media_url, seal_image_url } })
}

// PATCH /api/capsules/[id] — update media_path, seal_image, or transcript on a sealed capsule
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const sb = createServerSupabase()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['media_path', 'seal_image', 'transcript', 'content']
  const updates: Record<string, string> = {}
  for (const k of allowed) { if (body[k] !== undefined) updates[k] = body[k] }
  if (!Object.keys(updates).length)
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })

  const { data, error } = await sb.from('capsules').update(updates)
    .eq('id', params.id).eq('user_id', session.user.id).eq('status', 'sealed').select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/capsules/[id] — only sealed capsules can be deleted
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const sb = createServerSupabase()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: capsule } = await sb.from('capsules').select('media_path,seal_image,status')
    .eq('id', params.id).eq('user_id', session.user.id).single()
  if (!capsule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (capsule.status === 'delivered')
    return NextResponse.json({ error: 'Delivered capsules cannot be deleted' }, { status: 403 })

  if (capsule.media_path) await supabaseAdmin.storage.from(BUCKET_MEDIA).remove([capsule.media_path])
  if (capsule.seal_image) await supabaseAdmin.storage.from(BUCKET_SEAL).remove([capsule.seal_image])

  const { error } = await sb.from('capsules').delete().eq('id', params.id).eq('user_id', session.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: { deleted: true } })
}
