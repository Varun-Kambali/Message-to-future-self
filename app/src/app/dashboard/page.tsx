'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter }                   from 'next/navigation'
import Link                            from 'next/link'
import { createBrowserSupabase }       from '@/lib/supabase-browser'
import WaxSeal                         from '@/components/WaxSeal'
import type { Capsule, Profile }       from '@/types'

const LEATHERS: Record<string, { bg: string; spine: string; gold: string }> = {
  oxblood:  { bg:'#5c1a1a', spine:'#3d1010', gold:'#d4a853' },
  midnight: { bg:'#1a2240', spine:'#101628', gold:'#c9b870' },
  sage:     { bg:'#2a3d28', spine:'#1a2818', gold:'#d4c070' },
  cognac:   { bg:'#7a3c1a', spine:'#5a2a10', gold:'#e8c878' },
  pewter:   { bg:'#2e3038', spine:'#1e2028', gold:'#b8c0c8' },
}

function adj(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + a))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + a))
  const b = Math.min(255, Math.max(0, (n & 255) + a))
  return `rgb(${r},${g},${b})`
}

function BookCover({ coverColor, coverTitle, onClick }: { coverColor: string; coverTitle: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const l = LEATHERS[coverColor] || LEATHERS.oxblood

  return (
    <div style={{ perspective:'1400px', cursor:'pointer', display:'inline-block' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width:210, height:285,
        transformStyle:'preserve-3d',
        transform: hovered
          ? 'rotateY(-22deg) rotateX(5deg) translateY(-8px)'
          : 'rotateY(-10deg) rotateX(3deg)',
        transition:'transform 0.5s cubic-bezier(.34,1.1,.64,1)',
        filter:`drop-shadow(${hovered?18:9}px ${hovered?26:15}px ${hovered?55:32}px rgba(0,0,0,0.6))`,
      }}>
        {/* Spine */}
        <div style={{ position:'absolute', left:-26, top:2, width:26, height:'99%', background:`linear-gradient(180deg, ${adj(l.spine,14)}, ${l.spine}, ${adj(l.spine,-10)})`, transformOrigin:'right center', transform:'rotateY(90deg)', borderRadius:'4px 0 0 4px', boxShadow:'inset -4px 0 10px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:l.gold+'88', fontSize:7, fontFamily:'var(--mono)', letterSpacing:'0.18em', transform:'rotate(-90deg)', whiteSpace:'nowrap' }}>FUTURE SELF</span>
        </div>

        {/* Cover */}
        <div style={{ width:'100%', height:'100%', borderRadius:'2px 10px 10px 2px', background:`linear-gradient(155deg, ${adj(l.bg,20)} 0%, ${l.bg} 35%, ${adj(l.bg,-8)} 70%, ${adj(l.bg,-18)} 100%)`, border:`1px solid ${adj(l.bg,-30)}`, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          {Array.from({length:13},(_,i)=><div key={i} style={{ position:'absolute', left:0, right:0, top:`${(i/13)*100}%`, height:1, background:'rgba(0,0,0,0.055)' }} />)}
          <div style={{ position:'absolute', inset:11, border:`1px solid ${l.gold}44`, borderRadius:5, pointerEvents:'none' }} />
          <div style={{ position:'absolute', inset:16, border:`0.5px solid ${l.gold}22`, borderRadius:3, pointerEvents:'none' }} />

          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:11, position:'relative', zIndex:1 }}>
            <div style={{ width:54, height:54, borderRadius:'50%', border:`1px solid ${l.gold}55`, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.18)' }}>
              <span style={{ fontSize:22 }}>✉</span>
            </div>
            <div style={{ textAlign:'center', padding:'0 16px' }}>
              <div style={{ color:l.gold, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, lineHeight:1.35, textShadow:'0 1px 4px rgba(0,0,0,0.5)' }}>
                {coverTitle}
              </div>
              <div style={{ color:l.gold+'55', fontFamily:'var(--mono)', fontSize:7, letterSpacing:'0.18em', marginTop:8, textTransform:'uppercase' }}>Future Self</div>
            </div>
          </div>

          <div style={{ position:'absolute', right:-1, top:'5%', width:6, height:'90%', background:`linear-gradient(90deg, ${adj(l.bg,5)}, #f5efe0)`, borderRadius:'0 2px 2px 0' }} />

          {hovered && (
            <div style={{ position:'absolute', bottom:20, color:l.gold+'bb', fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.14em', animation:'slideUp 0.25s ease' }}>OPEN →</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const sb     = createBrowserSupabase()

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading,  setLoading]  = useState(true)
  const [newBadge, setNewBadge] = useState(0) // newly-delivered count

  useEffect(() => {
    async function load() {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.push('/login'); return }

      const [{ data: prof }, { data: caps }] = await Promise.all([
        sb.from('profiles').select('*').eq('id', session.user.id).single(),
        sb.from('capsules').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      ])
      if (prof)  setProfile(prof as Profile)
      if (caps) {
        const arr = caps as Capsule[]
        setCapsules(arr)
        // Badge: delivered but not yet viewed (email_sent=true means cron ran, user might not know)
        const fresh = arr.filter(c => c.status === 'delivered' && c.delivered_at && new Date(c.delivered_at) > new Date(Date.now() - 7 * 86400000))
        setNewBadge(fresh.length)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function signOut() {
    await sb.auth.signOut(); router.push('/'); router.refresh()
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0e0a06', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'rgba(212,168,83,0.45)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em', animation:'shimmer 1.5s ease infinite' }}>OPENING JOURNAL…</div>
    </div>
  )

  const coverColor = profile?.cover_color || 'oxblood'
  const coverTitle = profile?.cover_title || 'Letters to the Future'
  const sealed     = capsules.filter(c => c.status === 'sealed').length
  const delivered  = capsules.filter(c => c.status === 'delivered').length

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1c1008,#0e0a06 60%,#18100a)', fontFamily:'var(--body)' }}>
      {/* Nav */}
      <nav style={{ padding:'18px 40px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(212,168,83,0.08)', background:'rgba(10,6,3,0.8)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:100 }}>
        <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', color:'rgba(212,168,83,0.75)', fontSize:17 }}>✉ Future Self</span>
        <div style={{ display:'flex', gap:24, alignItems:'center' }}>
          <Link href="/journal" style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', textDecoration:'none', position:'relative' }}>
            Journal
            {newBadge > 0 && <span style={{ position:'absolute', top:-6, right:-10, width:16, height:16, borderRadius:'50%', background:'#c4622d', color:'white', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)' }}>{newBadge}</span>}
          </Link>
          <Link href="/new-entry" style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(212,168,83,0.75)', textDecoration:'none' }}>+ New Entry</Link>
          <Link href="/settings" style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', textDecoration:'none' }}>Cover</Link>
          <button onClick={signOut} style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', background:'none', border:'none', cursor:'pointer' }}>Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'64px 32px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        {/* Title */}
        <p style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.2em', color:'rgba(212,168,83,0.42)', textTransform:'uppercase', marginBottom:14 }}>Your time capsule journal</p>
        <h1 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:400, fontSize:'clamp(26px,4vw,42px)', color:'rgba(247,242,232,0.92)', marginBottom:8, textAlign:'center' }}>{coverTitle}</h1>
        <p style={{ fontFamily:'var(--body)', fontSize:14, color:'rgba(255,255,255,0.28)', fontStyle:'italic', marginBottom:52 }}>
          {capsules.length} {capsules.length === 1 ? 'entry' : 'entries'} sealed within
        </p>

        {/* Floating book */}
        <div style={{ marginBottom:44, animation:'floatBook 6s ease-in-out infinite' }}>
          <BookCover coverColor={coverColor} coverTitle={coverTitle} onClick={() => router.push('/journal')} />
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:44, marginBottom:52 }}>
          {[
            { n:sealed,    label:'Sealed',    icon:'🔒' },
            { n:delivered, label:'Delivered', icon:'📬' },
            { n:capsules.length, label:'Total', icon:'✉' },
          ].map(({ n, label, icon }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
              <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:30, color:'rgba(212,168,83,0.85)', lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:8, letterSpacing:'0.12em', color:'rgba(255,255,255,0.24)', textTransform:'uppercase', marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:60 }}>
          <Link href="/journal" style={{ background:'rgba(212,168,83,0.1)', border:'1px solid rgba(212,168,83,0.28)', color:'rgba(212,168,83,0.85)', padding:'12px 32px', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none', borderRadius:2 }}>Open journal</Link>
          <Link href="/new-entry" style={{ background:'#8b4a2a', color:'rgba(255,220,150,0.95)', padding:'12px 32px', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none', borderRadius:2, boxShadow:'0 4px 18px rgba(139,74,42,0.35)' }}>+ Write entry</Link>
        </div>

        {/* Capsule list */}
        {capsules.length > 0 && (
          <div style={{ width:'100%', maxWidth:580 }}>
            <p style={{ fontFamily:'var(--mono)', fontSize:8, letterSpacing:'0.16em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase', marginBottom:14 }}>Recent entries</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {capsules.slice(0, 8).map((c, i) => (
                <Link key={c.id} href="/journal" style={{
                  background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,168,83,0.09)',
                  borderRadius:8, padding:'13px 17px',
                  display:'flex', alignItems:'center', gap:13, textDecoration:'none',
                  animation:`slideUp 0.4s ease ${i * 0.06}s both`,
                  transition:'background 0.2s',
                }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.055)')}
                  onMouseOut={e  => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <WaxSeal color={c.seal_color} symbol={c.seal_emoji} size={36} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:'var(--body)', fontStyle:'italic', fontSize:14, color:'rgba(247,242,232,0.72)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:3 }}>
                      {c.prompt || 'Personal reflection'}
                    </p>
                    <p style={{ fontFamily:'var(--mono)', fontSize:9, color:'rgba(255,255,255,0.26)', letterSpacing:'0.04em' }}>
                      {c.type.toUpperCase()} · {c.status === 'delivered'
                        ? `✓ Delivered ${new Date(c.delivered_at!).toLocaleDateString('en-US',{month:'short',year:'numeric'})}`
                        : `📮 Opens ${new Date(c.delivery_at).toLocaleDateString('en-US',{month:'short',year:'numeric'})}`}
                    </p>
                  </div>
                  <span style={{ color:'rgba(212,168,83,0.35)', fontSize:16 }}>›</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
