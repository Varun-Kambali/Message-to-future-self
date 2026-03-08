import { NextRequest, NextResponse }    from 'next/server'
import { createServerSupabase }         from '@/lib/supabase-server'
import type { UpdateProfilePayload }    from '@/types'

export async function GET() {
  const sb = createServerSupabase()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb.from('profiles').select('*').eq('id', session.user.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const sb = createServerSupabase()
  const { data: { session } } = await sb.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: UpdateProfilePayload = await req.json()
  const allowed = ['name','bio','cover_color','cover_title']
  const updates: Record<string, string> = {}
  for (const k of allowed) { if ((body as Record<string,string>)[k] !== undefined) updates[k] = (body as Record<string,string>)[k] }

  const { data, error } = await sb.from('profiles').update(updates).eq('id', session.user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
