'use client'
import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { createBrowserSupabase } from '@/lib/supabase-browser'
import type { Profile }        from '@/types'

const LEATHERS = [
  { id:'oxblood',  label:'Oxblood',  bg:'#5c1a1a', gold:'#d4a853' },
  { id:'midnight', label:'Midnight', bg:'#1a2240', gold:'#c9b870' },
  { id:'sage',     label:'Sage',     bg:'#2a3d28', gold:'#d4c070' },
  { id:'cognac',   label:'Cognac',   bg:'#7a3c1a', gold:'#e8c878' },
  { id:'pewter',   label:'Pewter',   bg:'#2e3038', gold:'#b8c0c8' },
]

function adj(hex: string, a: number) {
  const n = parseInt(hex.replace('#',''), 16)
  const r = Math.min(255,Math.max(0,(n>>16)+a))
  const g = Math.min(255,Math.max(0,((n>>8)&255)+a))
  const b = Math.min(255,Math.max(0,(n&255)+a))
  return `rgb(${r},${g},${b})`
}

export default function SettingsPage() {
  const router = useRouter()
  const sb     = createBrowserSupabase()

  const [profile,  setProfile]  = useState<Profile|null>(null)
  const [color,    setColor]    = useState('oxblood')
  const [title,    setTitle]    = useState('Letters to the Future')
  const [name,     setName]     = useState('')
  const [bio,      setBio]      = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.push('/login'); return }
      const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) {
        const p = data as Profile
        setProfile(p); setColor(p.cover_color||'oxblood'); setTitle(p.cover_title||'Letters to the Future')
        setName(p.name||''); setBio(p.bio||'')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true); setSaved(false)
    const { data: { session } } = await sb.auth.getSession()
    if (!session) return
    await sb.from('profiles').update({ cover_color:color, cover_title:title, name, bio }).eq('id', session.user.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0e0a06', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'rgba(212,168,83,0.44)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.16em' }}>LOADING…</div>
    </div>
  )

  const leather = LEATHERS.find(l=>l.id===color) || LEATHERS[0]
  const inputStyle: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.55)', border:'1px solid rgba(0,0,0,0.13)', borderRadius:5, padding:'10px 13px', fontFamily:'var(--body)', fontSize:15, color:'#1c1410', outline:'none' }
  const labelStyle: React.CSSProperties = { display:'block', fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#8a7060', marginBottom:8 }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1c1008,#0e0a06)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'var(--body)' }}>
      <div style={{ width:'100%', maxWidth:680, marginBottom:14 }}>
        <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.3)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', textDecoration:'none' }}>← dashboard</Link>
      </div>

      <div style={{ width:'100%', maxWidth:680, background:'#faf6ee', borderRadius:12, padding:'44px 48px', boxShadow:'0 24px 80px rgba(0,0,0,0.22)', position:'relative', overflow:'hidden', animation:'slideUp 0.4s ease' }}>
        {Array.from({length:20},(_,i)=><div key={i} style={{ position:'absolute', left:60, right:22, top:68+i*30, height:1, background:'rgba(120,90,50,0.08)', pointerEvents:'none' }} />)}
        <div style={{ position:'absolute', left:52, top:0, bottom:0, width:1, background:'rgba(180,60,60,0.1)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:44 }}>
          {/* Controls */}
          <div>
            <h1 style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:400, fontSize:26, color:'#1c1410', marginBottom:5 }}>Journal settings</h1>
            <p style={{ fontFamily:'var(--body)', fontStyle:'italic', fontSize:14, color:'#8a7060', marginBottom:30, lineHeight:1.6 }}>Customise your journal's look and profile.</p>

            <div style={{ marginBottom:22 }}>
              <label style={labelStyle}>Your name</label>
              <input value={name} onChange={e=>setName(e.target.value)} style={inputStyle} placeholder="Your name" />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}>Bio (optional)</label>
              <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="A few words about you…" style={{ ...inputStyle, height:72, resize:'none', lineHeight:1.65, fontStyle:'italic' }} />
            </div>

            <div style={{ marginBottom:22 }}>
              <label style={labelStyle}>Journal title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={40} style={{ ...inputStyle, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:16 }} />
            </div>

            <div style={{ marginBottom:28 }}>
              <label style={labelStyle}>Leather colour</label>
              <div style={{ display:'flex', gap:9, flexWrap:'wrap' }}>
                {LEATHERS.map(l=>(
                  <button key={l.id} title={l.label} onClick={()=>setColor(l.id)} style={{ width:34, height:34, borderRadius:5, background:`linear-gradient(135deg, ${adj(l.bg,14)}, ${l.bg})`, border:color===l.id?'3px solid #d4a853':'2px solid transparent', boxShadow:color===l.id?'0 0 0 1px #d4a853':'0 2px 8px rgba(0,0,0,0.2)', transform:color===l.id?'scale(1.1)':'scale(1)', cursor:'pointer', transition:'all 0.15s', outline:'none' }} />
                ))}
              </div>
              <p style={{ fontFamily:'var(--mono)', fontSize:9, color:'#9a8878', marginTop:7, letterSpacing:'0.06em' }}>{leather.label}</p>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={handleSave} disabled={saving} style={{ background:saving?'rgba(0,0,0,0.1)':'#c4622d', color:saving?'#a09080':'white', border:'none', padding:'11px 26px', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:2, cursor:saving?'not-allowed':'pointer', boxShadow:saving?'none':'0 4px 16px rgba(196,98,45,0.3)', transition:'all 0.2s' }}>
                {saving?'Saving…':'Save changes'}
              </button>
              {saved && <span style={{ fontFamily:'var(--body)', fontStyle:'italic', fontSize:14, color:'#4a7a4a', animation:'slideUp 0.3s ease' }}>✓ Saved</span>}
            </div>
          </div>

          {/* Mini book preview */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <p style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', color:'#9a8878', textTransform:'uppercase', marginBottom:16 }}>Preview</p>
            <div style={{ perspective:'900px' }}>
              <div style={{ width:155, height:210, position:'relative', transform:'rotateY(-10deg) rotateX(2deg)', filter:'drop-shadow(8px 12px 30px rgba(0,0,0,0.38))', transformStyle:'preserve-3d' }}>
                <div style={{ position:'absolute', left:-22, top:2, width:22, height:'99%', background:`linear-gradient(180deg,${adj(leather.bg,12)},${leather.bg})`, transformOrigin:'right', transform:'rotateY(90deg)', borderRadius:'3px 0 0 3px' }} />
                <div style={{ width:'100%', height:'100%', borderRadius:'2px 8px 8px 2px', background:`linear-gradient(155deg,${adj(leather.bg,18)},${leather.bg},${adj(leather.bg,-10)})`, border:'1px solid rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                  {Array.from({length:8},(_,i)=><div key={i} style={{ position:'absolute', left:0, right:0, top:`${(i/8)*100}%`, height:1, background:'rgba(0,0,0,0.055)' }} />)}
                  <div style={{ position:'absolute', inset:9, border:`1px solid ${leather.gold}44`, borderRadius:4, pointerEvents:'none' }} />
                  <div style={{ width:38, height:38, borderRadius:'50%', border:`1px solid ${leather.gold}44`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10, background:'rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize:16 }}>✉</span>
                  </div>
                  <div style={{ color:leather.gold, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:12, textAlign:'center', padding:'0 12px', lineHeight:1.4 }}>{title||'My Journal'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
