import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Atmospheric glows */}
      <div style={{ position:'absolute', top:'25%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,168,83,0.02) 0%, transparent 60%)', pointerEvents:'none' }} />

      {/* Envelope */}
      <div style={{ fontSize:48, marginBottom:40, animation:'float 6s ease-in-out infinite', display:'block', opacity: 0.9 }}>✉</div>

      {/* Headline */}
      <h1 style={{
        fontFamily:'var(--display)', fontWeight:500,
        fontSize:'clamp(40px, 8vw, 76px)', lineHeight:1.1,
        color:'var(--text-main)', marginBottom:24,
        letterSpacing: '-0.02em',
        animation:'slideUp 0.8s ease 0.1s both',
      }}>
        A letter to your<br/>
        <span style={{ color:'var(--accent)', fontWeight: 400 }}>future self</span>
      </h1>

      <p style={{
        fontFamily:'var(--body)', fontSize:18, lineHeight:1.6,
        color:'var(--text-muted)', maxWidth:500, marginBottom:56,
        animation:'slideUp 0.8s ease 0.25s both',
        fontWeight: 300,
      }}>
        Inspired by a quiet café in Tokyo where visitors write letters, seal them with wax,
        and receive them a year later. Now a living journal for your phone.
      </p>

      {/* CTAs */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center', marginBottom:96, animation:'slideUp 0.8s ease 0.4s both' }}>
        <Link href="/signup" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '15px' }}>
          Begin writing
        </Link>

        <Link href="/login" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '15px' }}>
          Sign in
        </Link>
      </div>

      {/* How it works */}
      <div style={{ display:'flex', gap:32, flexWrap:'wrap', justifyContent:'center', animation:'slideUp 0.8s ease 0.55s both' }}>
        {[
          { icon:'✍', step:'Write',   desc:'Text, voice, or video — whatever feels honest right now.' },
          { icon:'🕯', step:'Seal',    desc:'Choose your wax colour. It locks until delivery day.' },
          { icon:'📬', step:'Receive', desc:'On the day, your past self\'s words arrive as a gift.' },
        ].map(({ icon, step, desc }) => (
          <div key={step} className="glass-panel" style={{ textAlign:'center', width: 260, padding: '32px 24px' }}>
            <div style={{ fontSize:32, marginBottom:16 }}>{icon}</div>
            <div style={{ fontFamily:'var(--display)', fontSize:18, color:'var(--text-main)', fontWeight: 500, marginBottom:8 }}>{step}</div>
            <div style={{ fontFamily:'var(--body)', fontSize:14, color:'var(--text-muted)', lineHeight:1.6, fontWeight: 300 }}>{desc}</div>
          </div>
        ))}
      </div>

      <p style={{ position:'absolute', bottom:24, fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em', color:'var(--text-faint)', textTransform:'uppercase' }}>
        Future Self Messenger · Inspired by Tokyo
      </p>
    </main>
  )
}
