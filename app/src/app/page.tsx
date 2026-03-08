import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1c1008 0%, #0e0a06 55%, #18100a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--body)',
    }}>
      {/* Atmospheric glows */}
      <div style={{ position:'absolute', top:'25%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(196,98,45,0.1) 0%, transparent 65%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'18%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 65%)', pointerEvents:'none' }} />

      {/* Envelope */}
      <div style={{ fontSize:60, marginBottom:32, animation:'float 6s ease-in-out infinite', display:'block' }}>✉</div>

      {/* Headline */}
      <h1 style={{
        fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:400,
        fontSize:'clamp(36px, 6vw, 62px)', lineHeight:1.15,
        color:'rgba(247,242,232,0.93)', marginBottom:20,
        animation:'slideUp 0.8s ease 0.1s both',
      }}>
        A letter to your<br/>
        <span style={{ color:'#d4a853' }}>future self</span>
      </h1>

      <p style={{
        fontFamily:'var(--body)', fontSize:17, lineHeight:1.85,
        color:'rgba(247,242,232,0.46)', maxWidth:460, marginBottom:48,
        animation:'slideUp 0.8s ease 0.25s both',
      }}>
        Inspired by a quiet café in Tokyo where visitors write letters, seal them with wax,
        and receive them a year later. Now a living journal for your phone.
      </p>

      {/* CTAs */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginBottom:80, animation:'slideUp 0.8s ease 0.4s both' }}>
        <Link href="/signup" style={{
          background:'linear-gradient(135deg, #d4a853, #b07830)',
          color:'#1c140c', padding:'16px 48px',
          fontFamily:'var(--mono)', fontSize:13, letterSpacing:'0.12em',
          textDecoration:'none', borderRadius:2,
          boxShadow:'0 8px 32px rgba(212,168,83,0.35)',
          display:'inline-block',
        }}>Begin writing</Link>

        <Link href="/login" style={{
          background:'transparent', color:'rgba(247,242,232,0.5)',
          padding:'16px 32px', border:'1px solid rgba(255,255,255,0.15)',
          fontFamily:'var(--mono)', fontSize:13, letterSpacing:'0.1em',
          textDecoration:'none', borderRadius:2,
          display:'inline-block',
        }}>Sign in</Link>
      </div>

      {/* How it works */}
      <div style={{ display:'flex', gap:36, flexWrap:'wrap', justifyContent:'center', animation:'slideUp 0.8s ease 0.55s both' }}>
        {[
          { icon:'✍', step:'Write',   desc:'Text, voice, or video — whatever feels honest right now.' },
          { icon:'🕯', step:'Seal',    desc:'Choose your wax colour. It locks until delivery day.' },
          { icon:'📬', step:'Receive', desc:'On the day, your past self\'s words arrive as a gift.' },
        ].map(({ icon, step, desc }) => (
          <div key={step} style={{ textAlign:'center', maxWidth:180 }}>
            <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.14em', color:'#d4a853', textTransform:'uppercase', marginBottom:7 }}>{step}</div>
            <div style={{ fontFamily:'var(--body)', fontSize:13, color:'rgba(247,242,232,0.36)', lineHeight:1.7, fontStyle:'italic' }}>{desc}</div>
          </div>
        ))}
      </div>

      <p style={{ position:'absolute', bottom:24, fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.18em', color:'rgba(255,255,255,0.14)', textTransform:'uppercase' }}>
        Future Self Messenger · Inspired by Tokyo
      </p>
    </main>
  )
}
