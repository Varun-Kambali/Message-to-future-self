import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, supabaseAdmin, BUCKET_MEDIA, BUCKET_SEAL, BUCKET_COVER } from '@/lib/supabase-server'

const LIMITS: Record<string, number> = {
  audio: 15 * 1024 * 1024,  // 15 MB
  video: 50 * 1024 * 1024,  // 50 MB
  image:  5 * 1024 * 1024,  //  5 MB
}

const ALLOWED_TYPES: Record<string, string[]> = {
  audio: ['audio/webm','audio/mp4','audio/mpeg','audio/ogg','audio/wav'],
  video: ['video/webm','video/mp4','video/quicktime'],
  image: ['image/jpeg','image/png','image/webp','image/gif'],
}

// POST /api/upload?kind=media|seal|cover
export async function POST(req: NextRequest) {
  const sb = createServerSupabase()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const kind = new URL(req.url).searchParams.get('kind') || 'media'

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const mediaCategory = file.type.startsWith('audio') ? 'audio'
                      : file.type.startsWith('video') ? 'video'
                      : 'image'
  const allowed = ALLOWED_TYPES[mediaCategory]
  if (!allowed?.includes(file.type))
    return NextResponse.json({ error: `File type ${file.type} not allowed` }, { status: 400 })

  const limit = LIMITS[mediaCategory]
  if (file.size > limit)
    return NextResponse.json({ error: `File exceeds ${Math.round(limit/1024/1024)} MB limit` }, { status: 400 })

  const ext    = file.name.split('.').pop() || 'bin'
  const bucket = kind === 'seal' ? BUCKET_SEAL : kind === 'cover' ? BUCKET_COVER : BUCKET_MEDIA
  const path   = `${session.user.id}/${Date.now()}.${ext}`

  const bytes   = await file.arrayBuffer()
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert:      true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: { path, bucket } }, { status: 201 })
}
