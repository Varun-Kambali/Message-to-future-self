import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// FONTS & GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --paper:       #f7f2e8;
      --paper-dark:  #ede5d0;
      --paper-mid:   #e8dfc8;
      --ink:         #1c1410;
      --ink-soft:    #4a3f35;
      --ink-faint:   #9a8878;
      --rust:        #c4622d;
      --rust-light:  #e8845a;
      --rust-dim:    rgba(196,98,45,0.15);
      --gold:        #d4a853;
      --gold-dim:    rgba(212,168,83,0.3);
      --cream:       #faf6ee;
      --serif:       'Instrument Serif', Georgia, serif;
      --body:        'Crimson Pro', Georgia, serif;
      --mono:        'DM Mono', 'Courier New', monospace;
    }

    html { font-size: 16px; }
    body { background: var(--paper); color: var(--ink); font-family: var(--body); -webkit-font-smoothing: antialiased; }

    ::selection { background: rgba(196,98,45,0.18); }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: var(--paper-dark); border-radius: 2px; }

    @keyframes fadeIn      { from { opacity:0; } to { opacity:1; } }
    @keyframes slideUp     { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideDown   { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes float       { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(0.5deg)} }
    @keyframes floatBook   { 0%,100%{transform:translateY(0) rotateX(4deg) rotateY(-8deg)} 50%{transform:translateY(-8px) rotateX(3deg) rotateY(-6deg)} }
    @keyframes envelopeFlap { 0%{transform:scaleY(1) rotateX(0deg)} 50%{transform:scaleY(-1) rotateX(180deg)} 100%{transform:scaleY(1) rotateX(0deg)} }
    @keyframes waxPour     { 0%{height:0;opacity:0;} 40%{height:50px;opacity:1;} 100%{height:0;opacity:0;transform:translateY(48px) scale(1.4);} }
    @keyframes sealLand    { 0%{transform:scale(0) rotate(-30deg);opacity:0;} 65%{transform:scale(1.1) rotate(3deg);opacity:1;} 100%{transform:scale(1) rotate(0deg);opacity:1;} }
    @keyframes confettiFall{ 0%{transform:translateY(0) rotateZ(0) rotateX(0);opacity:1;} 100%{transform:translateY(100vh) rotateZ(720deg) rotateX(360deg);opacity:0;} }
    @keyframes pageFlipR   { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(-180deg)} }
    @keyframes pageFlipL   { 0%{transform:rotateY(-180deg)} 100%{transform:rotateY(0deg)} }
    @keyframes barBounce   { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
    @keyframes inkBlot     { 0%{opacity:0;transform:scale(0.3);} 100%{opacity:1;transform:scale(1);} }
    @keyframes stampDown   { 0%{transform:translateY(-30px) scale(1.1);opacity:0;} 60%{transform:translateY(4px) scale(0.97);opacity:1;} 100%{transform:translateY(0) scale(1);opacity:1;} }
    @keyframes shimmer     { 0%,100%{opacity:0.6} 50%{opacity:1} }
    @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes candleFlicker { 0%,100%{opacity:1} 50%{opacity:0.85} 75%{opacity:0.95} }

    button { cursor:pointer; font-family:var(--body); border:none; background:none; }
    input, textarea { font-family:var(--body); }
    a { text-decoration:none; }
  `}</style>
);

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const PROMPTS = [
  { icon:"🌱", text:"What small thing are you quietly proud of right now?" },
  { icon:"🌙", text:"What has kept you up at night lately — and is it worth losing sleep over?" },
  { icon:"📮", text:"If you could send a single sentence back to yourself five years ago, what would it be?" },
  { icon:"☕", text:"Describe your morning routine. Is it nourishing you, or just moving you forward?" },
  { icon:"🗺", text:"Where did you think you'd be by now? Where are you actually?" },
  { icon:"💛", text:"Name three people who made this season warmer. Have you told them?" },
  { icon:"🌊", text:"What are you afraid to want, because you're afraid you won't get it?" },
  { icon:"🪴", text:"What habit have you been meaning to break — or start — for too long?" },
];

const SEAL_COLORS = [
  { name:"Scarlet",   hex:"#a02020" },
  { name:"Midnight",  hex:"#1e2a4a" },
  { name:"Emerald",   hex:"#1a4a30" },
  { name:"Plum",      hex:"#4a1a4a" },
  { name:"Tawny",     hex:"#8b4a1a" },
  { name:"Slate",     hex:"#2a3040" },
  { name:"Sienna",    hex:"#7a3010" },
  { name:"Forest",    hex:"#243824" },
];

const SEAL_SYMBOLS = ["✦","◆","✿","♡","☽","✧","⊕","⌘","∞","◉","✜","⚘"];

const COVER_LEATHERS = [
  { name:"Oxblood",   bg:"#5c1a1a", spine:"#3d1010", gold:"#d4a853" },
  { name:"Midnight",  bg:"#1a2240", spine:"#101628", gold:"#c9b870" },
  { name:"Sage",      bg:"#2a3d28", spine:"#1a2818", gold:"#d4c070" },
  { name:"Cognac",    bg:"#7a3c1a", spine:"#5a2a10", gold:"#e8c878" },
  { name:"Pewter",    bg:"#2e3038", spine:"#1e2028", gold:"#b8c0c8" },
];

const SAMPLE_CAPSULES = [
  {
    id:"1", type:"text", status:"delivered",
    prompt:"What small thing are you quietly proud of right now?",
    content:"Dear future me,\n\nI finished the half-marathon. I know that sounds small to you now, but I want you to remember how much I cried at mile 10 — not from pain, but because I realised I was going to finish. I'd been telling myself for years I wasn't 'that kind of person.'\n\nI hope you've stopped measuring yourself against some imaginary better version. You were already enough at 6:42am on a cold November morning.\n\nWith love,\nPast You",
    sealColor:"#a02020", sealSymbol:"✦",
    createdAt:"Nov 12, 2024", deliverAt:"Nov 12, 2025",
  },
  {
    id:"2", type:"audio", status:"sealed",
    prompt:"What has kept you up at night lately?",
    content:"A voice note recorded late on a Sunday. I talked about the move, the new city, whether I made the right call leaving everything familiar behind.",
    transcript:"Hey, it's me. It's like 2am and I can't sleep again. I keep running the numbers in my head — did I actually make the right call? The apartment is smaller than I remembered. The city is louder. But tonight I walked home from dinner and there was this street musician playing something I didn't recognise, and for one minute I felt exactly like myself. Maybe that's the whole point. I don't know. I hope you remember this feeling — the uncomfortable, alive feeling of having leapt.",
    sealColor:"#1e2a4a", sealSymbol:"☽",
    createdAt:"Jan 8, 2025", deliverAt:"Jan 8, 2026",
  },
  {
    id:"3", type:"text", status:"sealed",
    prompt:"Where did you think you'd be by now?",
    content:"",
    sealColor:"#1a4a30", sealSymbol:"✿",
    createdAt:"Mar 1, 2025", deliverAt:"Mar 1, 2026",
  },
];

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function hexAdjust(hex, amt) {
  const n = parseInt(hex.replace("#",""), 16);
  const r = Math.min(255, Math.max(0, (n>>16)+amt));
  const g = Math.min(255, Math.max(0, ((n>>8)&255)+amt));
  const b = Math.min(255, Math.max(0, (n&255)+amt));
  return `rgb(${r},${g},${b})`;
}

function formatDate(str) {
  try { return new Date(str).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}); }
  catch { return str; }
}

// ─────────────────────────────────────────────
// WAX SEAL CANVAS
// ─────────────────────────────────────────────
function WaxSeal({ color="#a02020", symbol="✦", size=64, imageData=null, animate=false, style={} }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = size/2, cy = size/2, r = size/2 - 3;
    ctx.clearRect(0,0,size,size);

    // Wax body — layered radial gradients for depth
    const base = ctx.createRadialGradient(cx - r*.28, cy - r*.3, r*.06, cx, cy, r);
    base.addColorStop(0, hexAdjust(color, 55));
    base.addColorStop(0.3, hexAdjust(color, 20));
    base.addColorStop(0.7, color);
    base.addColorStop(1, hexAdjust(color, -35));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = base; ctx.fill();

    // Organic edge drips
    for (let i = 0; i < 7; i++) {
      const angle = (i/7)*Math.PI*2 + Math.sin(i*1.3)*0.4;
      const dr = r * (0.88 + Math.sin(i*2.1)*0.08);
      const bx = cx + Math.cos(angle)*dr, by = cy + Math.sin(angle)*dr;
      const dg = ctx.createRadialGradient(bx,by,0,bx,by,r*.22);
      dg.addColorStop(0, hexAdjust(color, 30)+"99");
      dg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(bx, by, r*.22, 0, Math.PI*2);
      ctx.fillStyle = dg; ctx.fill();
    }

    // Specular highlight
    const hl = ctx.createRadialGradient(cx-r*.32, cy-r*.38, 0, cx-r*.18, cy-r*.22, r*.5);
    hl.addColorStop(0, "rgba(255,255,255,0.42)");
    hl.addColorStop(0.5, "rgba(255,255,255,0.08)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = hl; ctx.fill();

    // Custom image or symbol
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r*.62, 0, Math.PI*2); ctx.clip();
    if (imageData) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r*.62, 0, Math.PI*2); ctx.clip();
        ctx.drawImage(img, cx-r*.62, cy-r*.62, r*1.24, r*1.24);
        // Multiply blend for engraved look
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = hexAdjust(color, -20) + "88";
        ctx.fillRect(cx-r*.62, cy-r*.62, r*1.24, r*1.24);
        ctx.restore();
        // Gold deboss ring
        ctx.beginPath(); ctx.arc(cx, cy, r*.63, 0, Math.PI*2);
        ctx.strokeStyle = "rgba(212,168,83,0.7)"; ctx.lineWidth = 1.5; ctx.stroke();
      };
      img.src = imageData;
    } else {
      ctx.restore();
      // Shadow of symbol
      ctx.font = `${r*.58}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillText(symbol, cx+1.5, cy+1.5);
      // Gold symbol
      const sg = ctx.createLinearGradient(cx, cy-r*.3, cx, cy+r*.3);
      sg.addColorStop(0, "#f0d880"); sg.addColorStop(0.5, "#d4a853"); sg.addColorStop(1, "#b8883a");
      ctx.fillStyle = sg; ctx.fillText(symbol, cx, cy);
    }
    if (!imageData) {
      ctx.save(); ctx.restore();
    }

    // Outer ring
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = "rgba(212,168,83,0.35)"; ctx.lineWidth = 1.5; ctx.stroke();
    // Inner deboss ring
    ctx.beginPath(); ctx.arc(cx, cy, r*.7, 0, Math.PI*2);
    ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 0.8; ctx.stroke();

  }, [color, symbol, size, imageData]);

  return (
    <canvas ref={ref} width={size} height={size}
      style={{ borderRadius:"50%", filter:`drop-shadow(0 ${size*.05}px ${size*.15}px rgba(0,0,0,0.45))`, animation: animate ? "sealLand 0.65s cubic-bezier(.34,1.4,.64,1) forwards" : "none", ...style }} />
  );
}

// ─────────────────────────────────────────────
// AUDIO PLAYER — warm cassette feel
// ─────────────────────────────────────────────
function AudioPlayer({ transcript }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [activeWord, setActiveWord] = useState(0);
  const timerRef = useRef(null);
  const words = transcript ? transcript.split(" ") : [];
  const totalSec = words.length * 0.36;

  function togglePlay() {
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
      return;
    }
    setPlaying(true);
    let w = Math.floor((progress / 100) * words.length);
    timerRef.current = setInterval(() => {
      w++;
      setActiveWord(w);
      setProgress((w / words.length) * 100);
      if (w >= words.length) {
        clearInterval(timerRef.current);
        setPlaying(false);
      }
    }, 360);
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
    setActiveWord(Math.floor((pct / 100) * words.length));
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  const secElapsed = Math.floor((progress/100) * totalSec);
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{
      background: "linear-gradient(145deg, #2a1e14, #1c140c)",
      borderRadius: 14, padding: "20px 22px",
      border: "1px solid rgba(212,168,83,0.2)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.35)",
      marginBottom: 20,
    }}>
      {/* Waveform */}
      <div style={{ display:"flex", gap:2, height:38, alignItems:"center", marginBottom:14, justifyContent:"center", padding:"0 4px" }}>
        {Array.from({length:52}, (_,i) => {
          const h = 4 + Math.abs(Math.sin(i*.65)*13 + Math.sin(i*1.4)*8 + Math.sin(i*2.9)*4);
          const done = (i/52)*100 < progress;
          return (
            <div key={i} style={{
              width: 3, minWidth: 3, borderRadius: 2,
              height: Math.max(4, h),
              background: done ? `linear-gradient(180deg, #f0c860, #c4622d)` : "rgba(255,255,255,0.1)",
              animation: playing && done ? `barBounce ${280 + (i%7)*40}ms ease-in-out ${i*12}ms infinite` : "none",
              transformOrigin: "bottom",
              transition: "background 0.1s",
            }} />
          );
        })}
      </div>

      {/* Seek bar */}
      <div onClick={seek} style={{ height:3, background:"rgba(255,255,255,0.1)", borderRadius:2, marginBottom:12, cursor:"pointer", position:"relative" }}>
        <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#d4a853,#c4622d)", borderRadius:2, transition:"width 0.1s" }} />
        <div style={{ position:"absolute", top:"50%", left:`${progress}%`, transform:"translate(-50%,-50%)", width:10, height:10, borderRadius:"50%", background:"#d4a853", boxShadow:"0 0 8px rgba(212,168,83,0.6)", transition:"left 0.1s" }} />
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={togglePlay} style={{
          width:40, height:40, borderRadius:"50%", flexShrink:0,
          background: "linear-gradient(135deg, #d4a853, #b07830)",
          color:"#1c140c", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 16px rgba(212,168,83,0.4)",
          transition:"transform 0.15s", transform: playing ? "scale(0.95)" : "scale(1)",
        }}>
          {playing ? "⏸" : "▶"}
        </button>
        <div style={{ flex:1 }}>
          <div style={{ color:"rgba(255,255,255,0.45)", fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.04em" }}>
            {fmt(secElapsed)} / {fmt(Math.floor(totalSec))}
          </div>
          <div style={{ color:"rgba(212,168,83,0.6)", fontFamily:"var(--mono)", fontSize:10, marginTop:2 }}>
            Voice message
          </div>
        </div>
        <button onClick={() => setShowTranscript(s=>!s)} style={{
          color: showTranscript ? "#d4a853" : "rgba(255,255,255,0.35)",
          fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.08em",
          padding:"5px 10px", border:"1px solid", borderColor: showTranscript ? "rgba(212,168,83,0.5)" : "rgba(255,255,255,0.15)",
          borderRadius:4, transition:"all 0.2s",
        }}>
          {showTranscript ? "HIDE" : "WORDS"}
        </button>
      </div>

      {/* Live transcript */}
      {showTranscript && (
        <div style={{
          marginTop:16, padding:"14px 16px",
          background:"rgba(0,0,0,0.25)", borderRadius:8,
          borderLeft:"2px solid rgba(212,168,83,0.35)",
          maxHeight:130, overflowY:"auto",
          animation:"slideUp 0.3s ease",
        }}>
          <p style={{ fontFamily:"var(--body)", fontSize:14, lineHeight:1.85, fontStyle:"italic", margin:0, color:"rgba(255,255,255,0.55)" }}>
            {words.map((w,i) => (
              <span key={i} style={{
                color: i < activeWord ? "#f0e0c8" : "rgba(255,255,255,0.3)",
                background: i === activeWord-1 && playing ? "rgba(212,168,83,0.2)" : "none",
                borderRadius:2, padding:"0 1px",
                transition:"color 0.15s, background 0.15s",
                fontWeight: i === activeWord-1 && playing ? "500" : "normal",
              }}>{w} </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// BOOK COVER
// ─────────────────────────────────────────────
function BookCover({ leather, title, onClick, coverImg }) {
  const [hovered, setHovered] = useState(false);
  const l = leather || COVER_LEATHERS[0];

  return (
    <div style={{ perspective:"1400px", cursor:"pointer", display:"inline-block" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width:220, height:300,
        transformStyle:"preserve-3d",
        transform: hovered
          ? "rotateY(-22deg) rotateX(5deg) translateY(-8px)"
          : "rotateY(-10deg) rotateX(3deg)",
        transition:"transform 0.55s cubic-bezier(.34,1.1,.64,1)",
        filter:`drop-shadow(${hovered?20:10}px ${hovered?28:16}px ${hovered?60:35}px rgba(0,0,0,0.55))`,
      }}>
        {/* Spine */}
        <div style={{
          position:"absolute", left:-28, top:2, width:28, height:"99%",
          background:`linear-gradient(180deg, ${hexAdjust(l.spine,15)}, ${l.spine}, ${hexAdjust(l.spine,-10)})`,
          transformOrigin:"right center",
          transform:"rotateY(90deg)",
          borderRadius:"4px 0 0 4px",
          boxShadow:"inset -4px 0 10px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-50%) rotate(-90deg)",
            color:l.gold+"88", fontSize:8, fontFamily:"var(--mono)", letterSpacing:"0.2em",
            whiteSpace:"nowrap",
          }}>FUTURE SELF</div>
        </div>

        {/* Front cover */}
        <div style={{
          width:"100%", height:"100%",
          borderRadius:"2px 10px 10px 2px",
          background:`linear-gradient(155deg, ${hexAdjust(l.bg,20)} 0%, ${l.bg} 35%, ${hexAdjust(l.bg,-8)} 70%, ${hexAdjust(l.bg,-18)} 100%)`,
          border:`1px solid ${hexAdjust(l.bg,-30)}`,
          position:"relative", overflow:"hidden",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}>
          {/* Leather grain texture */}
          {Array.from({length:14},(_,i)=>(
            <div key={i} style={{ position:"absolute", left:0, right:0, top:`${(i/14)*100}%`, height:1, background:"rgba(0,0,0,0.06)" }} />
          ))}
          {/* Vertical grain */}
          {Array.from({length:6},(_,i)=>(
            <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${15+i*15}%`, width:1, background:"rgba(0,0,0,0.03)" }} />
          ))}

          {/* Gold border frames */}
          <div style={{ position:"absolute", inset:12, border:`1px solid ${l.gold}44`, borderRadius:5, pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:16, border:`0.5px solid ${l.gold}22`, borderRadius:3, pointerEvents:"none" }} />

          {/* Center emblem */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, position:"relative", zIndex:1 }}>
            {coverImg ? (
              <div style={{ width:68, height:68, borderRadius:"50%", overflow:"hidden", border:`2px solid ${l.gold}55` }}>
                <img src={coverImg} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            ) : (
              <div style={{ width:60, height:60, borderRadius:"50%", border:`1px solid ${l.gold}55`, display:"flex", alignItems:"center", justifyContent:"center", background:`rgba(0,0,0,0.2)` }}>
                <span style={{ fontSize:26, filter:`drop-shadow(0 1px 3px rgba(0,0,0,0.5))` }}>✉</span>
              </div>
            )}
            <div style={{ textAlign:"center", padding:"0 16px" }}>
              <div style={{ color:l.gold, fontFamily:"var(--serif)", fontStyle:"italic", fontSize:16, lineHeight:1.35, textShadow:`0 1px 4px rgba(0,0,0,0.5)`, letterSpacing:"0.02em" }}>
                {title || "My Journal"}
              </div>
              <div style={{ color:l.gold+"55", fontFamily:"var(--mono)", fontSize:8, letterSpacing:"0.18em", marginTop:8, textTransform:"uppercase" }}>
                Future Self
              </div>
            </div>
          </div>

          {/* Page edge peek */}
          <div style={{ position:"absolute", right:-1, top:"5%", width:6, height:"90%", background:`linear-gradient(90deg, ${hexAdjust(l.bg,5)}, #f5efe0)`, borderRadius:"0 2px 2px 0", boxShadow:"2px 0 8px rgba(0,0,0,0.15)" }} />

          {hovered && (
            <div style={{ position:"absolute", bottom:22, color:l.gold+"bb", fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.14em", animation:"slideUp 0.3s ease" }}>
              OPEN →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// JOURNAL — two-page spread with page flip
// ─────────────────────────────────────────────
function Journal({ capsules, onClose, onNewEntry }) {
  const [page, setPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("next");

  const entry = capsules[page];
  const prevEntry = capsules[page - 1];

  function flip(dir) {
    if (flipping) return;
    if (dir === "next" && page >= capsules.length-1) return;
    if (dir === "prev" && page <= 0) return;
    setFlipDir(dir); setFlipping(true);
    setTimeout(() => { setPage(p => dir==="next"?p+1:p-1); setFlipping(false); }, 420);
  }

  if (!entry) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(16,10,6,0.92)",
      backdropFilter:"blur(10px)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"16px",
      animation:"fadeIn 0.4s ease",
    }}>
      <style>{`
        @keyframes pageFlipR { 0%{transform:rotateY(0deg);} 100%{transform:rotateY(-180deg);} }
        @keyframes pageFlipL { 0%{transform:rotateY(-180deg);} 100%{transform:rotateY(0deg);} }
        @keyframes barBounce { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
      `}</style>

      {/* Top bar */}
      <div style={{ width:"100%", maxWidth:820, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <button onClick={onClose} style={{ color:"rgba(255,255,255,0.4)", fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.1em", padding:"6px 0" }}>
          ← back
        </button>
        <span style={{ color:"rgba(255,255,255,0.25)", fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.14em" }}>
          {page+1} of {capsules.length}
        </span>
        <button onClick={onNewEntry} style={{ color:"rgba(212,168,83,0.7)", fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.1em" }}>
          + new entry
        </button>
      </div>

      {/* Book spread */}
      <div style={{ display:"flex", width:"100%", maxWidth:820, filter:"drop-shadow(0 24px 60px rgba(0,0,0,0.7))" }}>

        {/* Left page */}
        <div style={{
          flex:1, minHeight:480,
          background:"linear-gradient(to right, #f4edd8, #ede5cc)",
          borderRadius:"10px 0 0 10px",
          padding:"40px 30px 30px 38px",
          position:"relative", overflow:"hidden",
          boxShadow:"inset -12px 0 24px rgba(0,0,0,0.1)",
        }}>
          {/* Ruled lines */}
          {Array.from({length:18},(_,i)=><div key={i} style={{ position:"absolute", left:52, right:14, top:54+i*26, height:1, background:"rgba(120,90,50,0.1)" }} />)}
          {/* Margin line */}
          <div style={{ position:"absolute", left:44, top:0, bottom:0, width:1, background:"rgba(180,60,60,0.15)" }} />

          <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            {prevEntry ? (
              <div style={{ opacity:0.42 }}>
                <p style={{ fontFamily:"var(--mono)", fontSize:9, color:"#7a6050", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>
                  {prevEntry.createdAt}
                </p>
                <p style={{ fontFamily:"var(--body)", fontSize:13.5, color:"#5a4030", lineHeight:1.9, fontStyle:"italic" }}>
                  {(prevEntry.content||prevEntry.prompt||"").slice(0,200)}{prevEntry.content?.length > 200 ? "…" : ""}
                </p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", opacity:0.18 }}>
                <span style={{ fontSize:36, marginBottom:10 }}>✉</span>
                <span style={{ fontFamily:"var(--serif)", fontStyle:"italic", color:"#5a4030", fontSize:15 }}>Begin your story</span>
              </div>
            )}
            <div style={{ textAlign:"right", fontFamily:"var(--mono)", fontSize:9, color:"#b09880" }}>{page > 0 ? page : ""}</div>
          </div>
        </div>

        {/* Spine shadow */}
        <div style={{ width:14, background:"linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0.05))", flexShrink:0, zIndex:2 }} />

        {/* Right page — current, animated */}
        <div style={{
          flex:1,
          background:"linear-gradient(to left, #f0e8d4, #ede5cc)",
          borderRadius:"0 10px 10px 0",
          padding:"40px 38px 30px 30px",
          position:"relative", overflow:"hidden",
          transformOrigin:"left center",
          transformStyle:"preserve-3d",
          animation: flipping ? (flipDir==="next" ? "pageFlipR 0.42s ease-in-out" : "pageFlipL 0.42s ease-in-out") : "none",
        }}>
          {Array.from({length:18},(_,i)=><div key={i} style={{ position:"absolute", left:14, right:52, top:54+i*26, height:1, background:"rgba(120,90,50,0.1)" }} />)}
          <div style={{ position:"absolute", right:44, top:0, bottom:0, width:1, background:"rgba(180,60,60,0.12)" }} />

          <div style={{ position:"relative", zIndex:1, height:"100%", display:"flex", flexDirection:"column" }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <div>
                <p style={{ fontFamily:"var(--mono)", fontSize:9, color:"#7a6050", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
                  {entry.createdAt}
                </p>
                <p style={{ fontFamily:"var(--body)", fontSize:12, color:"#8a7060", fontStyle:"italic" }}>
                  Delivers {entry.deliverAt}
                </p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <WaxSeal color={entry.sealColor} symbol={entry.sealSymbol} size={38} />
                <span style={{
                  fontFamily:"var(--mono)", fontSize:8, letterSpacing:"0.1em", padding:"3px 7px", borderRadius:2,
                  background: entry.status==="delivered" ? "#e8f5e8" : "#f5ede0",
                  color: entry.status==="delivered" ? "#2a6a2a" : "#8a6030",
                }}>
                  {entry.status==="delivered" ? "✓ DELIVERED" : "🔒 SEALED"}
                </span>
              </div>
            </div>

            {/* Prompt */}
            {entry.prompt && (
              <div style={{ borderLeft:"2px solid rgba(196,98,45,0.3)", paddingLeft:12, marginBottom:18 }}>
                <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:13, color:"#7a6050", lineHeight:1.65 }}>
                  "{entry.prompt}"
                </p>
              </div>
            )}

            {/* Audio player */}
            {entry.type==="audio" && entry.status==="delivered" && entry.transcript && (
              <AudioPlayer transcript={entry.transcript} />
            )}

            {/* Content */}
            <div style={{ flex:1 }}>
              {entry.status==="sealed" ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:150, opacity:0.5 }}>
                  <div style={{ fontSize:28, marginBottom:12 }}>🔒</div>
                  <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:14, color:"#6a5040", textAlign:"center", lineHeight:1.7 }}>
                    This capsule is resting quietly.<br/>It'll open on {entry.deliverAt}.
                  </p>
                </div>
              ) : (
                <p style={{ fontFamily:"var(--body)", fontSize:15, lineHeight:2, color:"#2a1e14", whiteSpace:"pre-line", fontStyle:"italic" }}>
                  {entry.content}
                </p>
              )}
            </div>

            <div style={{ textAlign:"right", fontFamily:"var(--mono)", fontSize:9, color:"#b09880" }}>{page+1}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display:"flex", gap:12, marginTop:20 }}>
        {[
          { label:"← prev", onClick:()=>flip("prev"), disabled:page===0 },
          { label:"+ new entry", onClick:onNewEntry, disabled:false, highlight:true },
          { label:"next →", onClick:()=>flip("next"), disabled:page>=capsules.length-1 },
        ].map(({label,onClick,disabled,highlight})=>(
          <button key={label} onClick={onClick} disabled={disabled} style={{
            fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.1em",
            padding:"9px 22px", borderRadius:2,
            background: highlight ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${highlight ? "rgba(212,168,83,0.4)" : "rgba(255,255,255,0.12)"}`,
            color: disabled ? "rgba(255,255,255,0.2)" : highlight ? "rgba(212,168,83,0.85)" : "rgba(255,255,255,0.6)",
            cursor: disabled ? "not-allowed" : "pointer",
            transition:"all 0.2s",
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!active) return;
    setPieces(Array.from({length:36},(_,i)=>({
      id:i,
      x: 30 + Math.random()*40,
      delay: Math.random()*0.7,
      dur: 2.2 + Math.random()*1,
      color: ["#c4622d","#d4a853","#8b1a1a","#1a3a6b","#2a3d28","#f0c860"][Math.floor(Math.random()*6)],
      shape: ["●","◆","▲","✦","▪"][Math.floor(Math.random()*5)],
      size: 7 + Math.random()*8,
    })));
    const t = setTimeout(()=>setPieces([]), 3500);
    return ()=>clearTimeout(t);
  },[active]);
  if (!pieces.length) return null;
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1000, overflow:"hidden" }}>
      {pieces.map(p=>(
        <div key={p.id} style={{ position:"absolute", left:`${p.x}%`, top:-20, color:p.color, fontSize:p.size, animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards` }}>
          {p.shape}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// WAX SEAL STUDIO
// ─────────────────────────────────────────────
function WaxSealStudio({ onConfirm, onBack }) {
  const [color, setColor] = useState(SEAL_COLORS[0].hex);
  const [symbol, setSymbol] = useState("✦");
  const [artFile, setArtFile] = useState(null);
  const [artData, setArtData] = useState(null);
  const [pouring, setPouring] = useState(false);
  const [poured, setPoured] = useState(false);

  function handleArt(e) {
    const f = e.target.files[0];
    if (!f) return;
    setArtFile(f);
    const r = new FileReader();
    r.onload = ev => { setArtData(ev.target.result); setPoured(false); };
    r.readAsDataURL(f);
  }

  function pourWax() {
    if (pouring) return;
    setPouring(true);
    setTimeout(()=>{ setPouring(false); setPoured(true); }, 950);
  }

  function handleColorChange(hex) { setColor(hex); setPoured(false); }
  function handleSymbolChange(s) { setSymbol(s); setArtData(null); setArtFile(null); setPoured(false); }

  return (
    <div>
      <h2 style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:28, color:"#1c1410", marginBottom:6 }}>
        Craft your wax seal
      </h2>
      <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:15, color:"#8a7060", marginBottom:32, lineHeight:1.6 }}>
        Choose your wax, pick a symbol — or upload something personal to be etched in.
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:36 }}>
        {/* Controls */}
        <div>
          {/* Color */}
          <div style={{ marginBottom:26 }}>
            <p style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>
              Wax colour
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {SEAL_COLORS.map(c=>(
                <button key={c.hex} title={c.name} onClick={()=>handleColorChange(c.hex)} style={{
                  width:32, height:32, borderRadius:"50%", outline:"none",
                  background:`radial-gradient(circle at 35% 35%, ${hexAdjust(c.hex,40)}, ${c.hex})`,
                  border: color===c.hex ? "3px solid #d4a853" : "2px solid transparent",
                  boxShadow: color===c.hex ? "0 0 0 1px #d4a853, 0 4px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.25)",
                  transform: color===c.hex ? "scale(1.12)" : "scale(1)",
                  transition:"all 0.15s",
                }} />
              ))}
            </div>
          </div>

          {/* Symbol */}
          <div style={{ marginBottom:26 }}>
            <p style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>
              Symbol
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {SEAL_SYMBOLS.map(s=>(
                <button key={s} onClick={()=>handleSymbolChange(s)} style={{
                  width:40, height:40, borderRadius:6, fontSize:18,
                  background: symbol===s && !artData ? "var(--rust-dim)" : "rgba(0,0,0,0.04)",
                  border:`1.5px solid ${symbol===s && !artData ? "var(--rust)" : "rgba(0,0,0,0.1)"}`,
                  transition:"all 0.15s",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Art upload */}
          <div>
            <p style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>
              Or etch your own art
            </p>
            <label style={{
              display:"flex", alignItems:"center", gap:12, cursor:"pointer",
              padding:"14px 16px", borderRadius:8,
              background: artData ? "rgba(212,168,83,0.08)" : "rgba(0,0,0,0.03)",
              border:`2px dashed ${artData ? "#d4a853" : "rgba(0,0,0,0.14)"}`,
              transition:"all 0.2s",
            }}>
              <span style={{ fontSize:22 }}>{artData ? "✓" : "🖼"}</span>
              <div>
                <p style={{ fontFamily:"var(--body)", fontSize:14, color:"#3a2e24" }}>
                  {artData ? (artFile?.name || "Image uploaded") : "Upload a photo or drawing"}
                </p>
                <p style={{ fontFamily:"var(--mono)", fontSize:10, color:"#9a8878", marginTop:2 }}>
                  Outlined and etched into the wax
                </p>
              </div>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleArt} />
            </label>
            {artData && (
              <button onClick={()=>{setArtData(null);setArtFile(null);setPoured(false);}} style={{ marginTop:6, fontFamily:"var(--mono)", fontSize:10, color:"#9a8878", letterSpacing:"0.08em" }}>
                ✕ remove
              </button>
            )}
          </div>
        </div>

        {/* Preview & Pour */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.14em", color:"#9a8878", textTransform:"uppercase", marginBottom:18 }}>
            Preview
          </p>

          <div style={{ position:"relative", marginBottom:24 }}>
            {/* Candle drip */}
            {pouring && (
              <div style={{
                position:"absolute", top:-56, left:"50%", transform:"translateX(-50%)",
                width:10, borderRadius:4,
                background:`linear-gradient(180deg, ${hexAdjust(color,30)}, ${color})`,
                animation:"waxPour 0.95s ease forwards",
                transformOrigin:"top",
                zIndex:5,
              }} />
            )}
            <div style={{ animation: poured ? "sealLand 0.65s cubic-bezier(.34,1.4,.64,1) forwards" : "none" }}>
              <WaxSeal color={color} symbol={symbol} size={130} imageData={artData} />
            </div>
          </div>

          {!poured ? (
            <div style={{ textAlign:"center" }}>
              <button onClick={pourWax} disabled={pouring} style={{
                background:`linear-gradient(135deg, ${color}, ${hexAdjust(color,-20)})`,
                color:"rgba(255,220,120,0.95)", padding:"12px 28px",
                fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.1em",
                borderRadius:4, border:"none",
                boxShadow:`0 6px 24px ${color}55`,
                opacity: pouring ? 0.7 : 1,
                transition:"all 0.2s",
              }}>
                {pouring ? "Pouring…" : "🕯 Pour wax"}
              </button>
              <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:12, color:"#9a8878", marginTop:8 }}>
                Watch it set
              </p>
            </div>
          ) : (
            <div style={{ textAlign:"center", animation:"slideUp 0.4s ease" }}>
              <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:14, color:"#4a7a4a", marginBottom:14 }}>
                ✓ The seal is set
              </p>
              <button onClick={()=>onConfirm({ color, symbol, imageData: artData })} style={{
                background:"linear-gradient(135deg, #d4a853, #b07830)",
                color:"#1c140c", padding:"12px 28px",
                fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.1em",
                borderRadius:2, border:"none",
                boxShadow:"0 6px 24px rgba(212,168,83,0.4)",
              }}>
                Use this seal →
              </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onBack} style={{ marginTop:24, fontFamily:"var(--mono)", fontSize:11, color:"#9a8878", letterSpacing:"0.08em", padding:"6px 0" }}>
        ← back
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// NEW ENTRY FLOW
// ─────────────────────────────────────────────
function NewEntry({ onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("text");
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState(null);
  const [years, setYears] = useState(1);
  const [seal, setSeal] = useState({ color:"#a02020", symbol:"✦", imageData:null });
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);

  function handleSealConfirm(sealData) {
    setSeal(sealData);
    setSealing(true);
    setTimeout(()=>{ setSealing(false); setSealed(true); }, 600);
  }

  function submit() {
    const deliverAt = new Date(Date.now() + years*365.25*86400000)
      .toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    onSave({
      id: Date.now().toString(),
      type, content: text, prompt: prompt?.text || null,
      sealColor: seal.color, sealSymbol: seal.symbol,
      createdAt: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      deliverAt, status:"sealed",
    });
  }

  const paperStyle = {
    background:"var(--cream)", borderRadius:12,
    padding:"44px 48px",
    boxShadow:"0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
    position:"relative", overflow:"hidden",
  };

  const progressPct = ((step-1)/3)*100;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(20,14,8,0.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.3s ease" }}>
      <div style={{ width:"100%", maxWidth:640, ...paperStyle }}>
        {/* Ruled lines */}
        {Array.from({length:22},(_,i)=>(
          <div key={i} style={{ position:"absolute", left:66, right:28, top:74+i*30, height:1, background:"rgba(120,90,50,0.08)", pointerEvents:"none" }} />
        ))}
        <div style={{ position:"absolute", left:58, top:0, bottom:0, width:1, background:"rgba(180,60,60,0.1)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          {/* Progress */}
          <div style={{ marginBottom:30, display:"flex", gap:5 }}>
            {[1,2,3].map(s=>(
              <div key={s} style={{ flex:1, height:2, borderRadius:1, background: s<=step ? "var(--rust)" : "rgba(0,0,0,0.1)", transition:"background 0.4s" }} />
            ))}
          </div>

          {/* Step 1: Type + Prompt */}
          {step===1 && (
            <div style={{ animation:"slideUp 0.4s ease" }}>
              <h2 style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:28, color:"#1c1410", marginBottom:6 }}>What will you leave behind?</h2>
              <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:15, color:"#8a7060", marginBottom:28 }}>Choose how you want your future self to experience this moment.</p>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:28 }}>
                {[["text","✍","Written letter","Words age like wine"],["audio","🎙","Voice note","Your actual voice"],["video","📹","Video","Your face, preserved"]].map(([id,icon,label,sub])=>(
                  <button key={id} onClick={()=>setType(id)} style={{
                    background: type===id ? "var(--rust-dim)" : "rgba(255,255,255,0.5)",
                    border:`2px solid ${type===id ? "var(--rust)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius:10, padding:"18px 12px", textAlign:"center",
                    transition:"all 0.2s",
                  }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
                    <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"#1c1410", marginBottom:4, letterSpacing:"0.04em" }}>{label}</div>
                    <div style={{ fontFamily:"var(--body)", fontSize:12, color:"#8a7060", fontStyle:"italic" }}>{sub}</div>
                  </button>
                ))}
              </div>

              <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>A prompt to get you started</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {PROMPTS.map(p=>(
                  <button key={p.text} onClick={()=>setPrompt(p)} style={{
                    display:"flex", alignItems:"center", gap:6,
                    padding:"7px 12px", borderRadius:20,
                    background: prompt?.text===p.text ? "var(--rust-dim)" : "rgba(0,0,0,0.04)",
                    border:`1.5px solid ${prompt?.text===p.text ? "var(--rust)" : "rgba(0,0,0,0.1)"}`,
                    fontFamily:"var(--body)", fontSize:13, color: prompt?.text===p.text ? "var(--rust)" : "#5a4030",
                    fontStyle:"italic", transition:"all 0.2s",
                  }}>
                    <span>{p.icon}</span>
                    <span>{p.text.slice(0,40)}{p.text.length>40?"…":""}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginTop:28, display:"flex", justifyContent:"flex-end", gap:10 }}>
                <button onClick={onCancel} style={{ fontFamily:"var(--mono)", fontSize:11, color:"#9a8878", letterSpacing:"0.08em", padding:"10px 16px" }}>cancel</button>
                <button onClick={()=>setStep(2)} style={{ background:"var(--rust)", color:"white", padding:"12px 28px", fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.1em", borderRadius:2, boxShadow:"0 4px 16px rgba(196,98,45,0.35)" }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Write */}
          {step===2 && (
            <div style={{ animation:"slideUp 0.4s ease" }}>
              <h2 style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:28, color:"#1c1410", marginBottom:6 }}>
                {type==="text" ? "Write your letter" : type==="audio" ? "Record your voice" : "Record a video"}
              </h2>
              {prompt && (
                <div style={{ borderLeft:"2px solid rgba(196,98,45,0.35)", paddingLeft:12, marginBottom:20 }}>
                  <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:14, color:"#7a6050", lineHeight:1.65 }}>
                    {prompt.icon} {prompt.text}
                  </p>
                </div>
              )}

              {type==="text" ? (
                <textarea
                  value={text}
                  onChange={e=>setText(e.target.value)}
                  placeholder={"Dear future me,\n\nI'm writing this because…"}
                  style={{
                    width:"100%", height:200, border:"none", outline:"none",
                    background:"transparent", resize:"none",
                    fontFamily:"var(--body)", fontSize:16, lineHeight:2,
                    color:"#1c1410", fontStyle:"italic",
                  }}
                  autoFocus
                />
              ) : (
                <div>
                  <div style={{ background:"rgba(0,0,0,0.04)", border:"2px dashed rgba(196,98,45,0.25)", borderRadius:10, padding:"30px 24px", textAlign:"center", marginBottom:16 }}>
                    <div style={{ fontSize:40, marginBottom:10, animation:"shimmer 2s ease infinite" }}>{type==="audio"?"🎙":"📹"}</div>
                    <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:14, color:"#8a7060", marginBottom:14, lineHeight:1.65 }}>
                      {type==="audio" ? "Audio recording" : "Video recording"} would be captured here in the full app.
                    </p>
                  </div>
                  <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Add a note to accompany your recording…"
                    style={{ width:"100%", height:100, background:"rgba(255,255,255,0.6)", border:"1px solid rgba(0,0,0,0.12)", borderRadius:6, padding:"12px 14px", fontFamily:"var(--body)", fontSize:14, fontStyle:"italic", color:"#1c1410", outline:"none", resize:"none", lineHeight:1.7 }} />
                </div>
              )}

              <div style={{ marginTop:20, marginBottom:24 }}>
                <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>
                  Send in {years} year{years>1?"s":""} — arrives {new Date(Date.now()+years*365.25*86400000).toLocaleDateString("en-US",{month:"long",year:"numeric"})}
                </p>
                <input type="range" min={1} max={5} value={years} onChange={e=>setYears(Number(e.target.value))}
                  style={{ width:"100%", accentColor:"var(--rust)", height:4 }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:9, color:"#b09880", marginTop:6 }}>
                  {[1,2,3,4,5].map(y=><span key={y}>{y}yr</span>)}
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <button onClick={()=>setStep(1)} style={{ fontFamily:"var(--mono)", fontSize:11, color:"#9a8878", letterSpacing:"0.08em", padding:"10px 0" }}>← back</button>
                <button onClick={()=>setStep(3)} disabled={!text.trim()} style={{
                  background: text.trim() ? "var(--rust)" : "rgba(0,0,0,0.1)",
                  color: text.trim() ? "white" : "#b09880",
                  padding:"12px 28px", fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.1em",
                  borderRadius:2, cursor: text.trim() ? "pointer" : "not-allowed",
                  boxShadow: text.trim() ? "0 4px 16px rgba(196,98,45,0.35)" : "none",
                  transition:"all 0.25s",
                }}>
                  Choose seal →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Seal studio */}
          {step===3 && !sealed && (
            <div style={{ animation:"slideUp 0.4s ease" }}>
              <WaxSealStudio onConfirm={handleSealConfirm} onBack={()=>setStep(2)} />
            </div>
          )}

          {/* Sealed confirmation */}
          {sealed && (
            <div style={{ textAlign:"center", padding:"24px 0", animation:"slideUp 0.5s ease" }}>
              <WaxSeal color={seal.color} symbol={seal.symbol} size={90} imageData={seal.imageData} animate={true} style={{ marginBottom:20 }} />
              <h2 style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:28, color:"#1c1410", marginBottom:10 }}>
                Your capsule is sealed.
              </h2>
              <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:15, color:"#8a7060", lineHeight:1.75, marginBottom:28, maxWidth:360, margin:"0 auto 28px" }}>
                It's sitting quietly in your mailbox now, waiting. Your future self will find it on{" "}
                <strong>{new Date(Date.now()+years*365.25*86400000).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</strong>.
              </p>
              <button onClick={submit} style={{
                background:"linear-gradient(135deg, #d4a853, #b07830)",
                color:"#1c140c", padding:"14px 36px",
                fontFamily:"var(--mono)", fontSize:13, letterSpacing:"0.1em",
                borderRadius:2, border:"none",
                boxShadow:"0 6px 24px rgba(212,168,83,0.4)",
              }}>
                Drop in the mailbox →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COVER CUSTOMIZER
// ─────────────────────────────────────────────
function CoverCustomizer({ leather, title, coverImg, onSave, onClose }) {
  const [localLeather, setLocalLeather] = useState(leather || COVER_LEATHERS[0]);
  const [localTitle, setLocalTitle] = useState(title || "Letters to the Future");
  const [localImg, setLocalImg] = useState(coverImg || null);

  function handleImg(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setLocalImg(ev.target.result); r.readAsDataURL(f);
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(20,14,8,0.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", animation:"fadeIn 0.3s ease" }}>
      <div style={{ width:"100%", maxWidth:680, background:"var(--cream)", borderRadius:12, padding:"44px 48px", boxShadow:"0 24px 80px rgba(0,0,0,0.2)", position:"relative", overflow:"hidden" }}>
        {Array.from({length:20},(_,i)=><div key={i} style={{ position:"absolute", left:60, right:24, top:68+i*30, height:1, background:"rgba(120,90,50,0.08)", pointerEvents:"none" }} />)}
        <div style={{ position:"absolute", left:52, top:0, bottom:0, width:1, background:"rgba(180,60,60,0.1)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:44 }}>
          <div>
            <h2 style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:26, color:"#1c1410", marginBottom:6 }}>Design your cover</h2>
            <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:14, color:"#8a7060", marginBottom:28 }}>Your journal, your aesthetic.</p>

            <div style={{ marginBottom:24 }}>
              <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>Leather colour</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {COVER_LEATHERS.map(l=>(
                  <button key={l.name} title={l.name} onClick={()=>setLocalLeather(l)} style={{
                    width:34, height:34, borderRadius:5,
                    background:`linear-gradient(135deg, ${hexAdjust(l.bg,15)}, ${l.bg})`,
                    border: localLeather.name===l.name ? "3px solid #d4a853" : "2px solid transparent",
                    boxShadow: localLeather.name===l.name ? "0 0 0 1px #d4a853" : "0 2px 8px rgba(0,0,0,0.2)",
                    transform: localLeather.name===l.name ? "scale(1.1)" : "scale(1)",
                    transition:"all 0.15s",
                  }} />
                ))}
              </div>
              <p style={{ fontFamily:"var(--mono)", fontSize:9, color:"#9a8878", marginTop:7, letterSpacing:"0.06em" }}>{localLeather.name}</p>
            </div>

            <div style={{ marginBottom:24 }}>
              <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>Journal title</p>
              <input value={localTitle} onChange={e=>setLocalTitle(e.target.value)} maxLength={40}
                style={{ width:"100%", background:"rgba(255,255,255,0.6)", border:"1px solid rgba(0,0,0,0.12)", borderRadius:4, padding:"10px 12px", fontFamily:"var(--serif)", fontStyle:"italic", fontSize:16, color:"#1c1410", outline:"none" }} />
            </div>

            <div style={{ marginBottom:32 }}>
              <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.12em", color:"#9a8878", textTransform:"uppercase", marginBottom:12 }}>Cover image</p>
              <label style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background: localImg ? "rgba(212,168,83,0.08)" : "rgba(0,0,0,0.03)", border:`2px dashed ${localImg ? "#d4a853" : "rgba(0,0,0,0.12)"}`, borderRadius:8, cursor:"pointer", transition:"all 0.2s" }}>
                <span style={{ fontSize:18 }}>{localImg ? "✓" : "🖼"}</span>
                <span style={{ fontFamily:"var(--body)", fontSize:13, color:"#3a2e24", fontStyle:"italic" }}>{localImg ? "Cover photo set" : "Upload a photo"}</span>
                <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleImg} />
              </label>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onClose} style={{ fontFamily:"var(--mono)", fontSize:11, color:"#9a8878", letterSpacing:"0.08em", padding:"10px 0" }}>cancel</button>
              <button onClick={()=>onSave(localLeather, localTitle, localImg)} style={{ background:"var(--rust)", color:"white", padding:"11px 24px", fontFamily:"var(--mono)", fontSize:12, letterSpacing:"0.1em", borderRadius:2, boxShadow:"0 4px 16px rgba(196,98,45,0.3)" }}>
                Save cover
              </button>
            </div>
          </div>

          {/* Preview */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
            <BookCover leather={localLeather} title={localTitle} coverImg={localImg} onClick={()=>{}} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
function Landing({ onEnter }) {
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ setTimeout(()=>setVisible(true), 100); },[]);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #1c1008 0%, #0e0a06 50%, #18100a 100%)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"40px 24px", textAlign:"center", position:"relative", overflow:"hidden",
    }}>
      {/* Soft glow */}
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(196,98,45,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"20%", right:"20%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />

      {/* Envelope */}
      <div style={{ fontSize:64, marginBottom:32, animation:"float 6s ease-in-out infinite", opacity: visible ? 1 : 0, transition:"opacity 0.8s ease" }}>
        ✉
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily:"var(--serif)", fontStyle:"italic",
        fontSize:"clamp(36px,6vw,64px)", fontWeight:400,
        color:"rgba(247,242,232,0.94)",
        lineHeight:1.15, marginBottom:20,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition:"opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s",
      }}>
        A letter to your<br/>
        <span style={{ color:"#d4a853" }}>future self</span>
      </h1>

      <p style={{
        fontFamily:"var(--body)", fontSize:17, lineHeight:1.8,
        color:"rgba(247,242,232,0.48)", maxWidth:460, marginBottom:48,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition:"opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
      }}>
        Inspired by a quiet café in Tokyo where visitors write letters, seal them with wax,
        and receive them a year later — now a living journal on your phone.
      </p>

      <div style={{
        display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition:"opacity 0.8s ease 0.45s, transform 0.8s ease 0.45s",
      }}>
        <button onClick={onEnter} style={{
          background:"linear-gradient(135deg, #d4a853, #b07830)",
          color:"#1c140c", padding:"16px 48px",
          fontFamily:"var(--mono)", fontSize:13, letterSpacing:"0.12em",
          borderRadius:2, border:"none",
          boxShadow:"0 8px 32px rgba(212,168,83,0.35)",
          transition:"transform 0.2s, box-shadow 0.2s",
        }}
          onMouseOver={e=>{e.target.style.transform="translateY(-2px)";e.target.style.boxShadow="0 12px 40px rgba(212,168,83,0.45)";}}
          onMouseOut={e=>{e.target.style.transform="none";e.target.style.boxShadow="0 8px 32px rgba(212,168,83,0.35)";}}
        >
          Begin writing
        </button>
        <button onClick={onEnter} style={{
          background:"transparent", color:"rgba(247,242,232,0.5)",
          padding:"16px 32px", border:"1px solid rgba(255,255,255,0.15)",
          fontFamily:"var(--mono)", fontSize:13, letterSpacing:"0.1em",
          borderRadius:2,
        }}>
          Sign in
        </button>
      </div>

      {/* How it works */}
      <div style={{
        display:"flex", gap:32, marginTop:80, flexWrap:"wrap", justifyContent:"center",
        opacity: visible ? 1 : 0,
        transition:"opacity 0.8s ease 0.6s",
      }}>
        {[
          { icon:"✍", step:"Write", desc:"Text, voice, or video — whatever feels most honest right now." },
          { icon:"🕯", step:"Seal", desc:"Choose your wax. Your capsule is locked away until delivery day." },
          { icon:"📬", step:"Receive", desc:"On the day, your past self's words arrive as a gift." },
        ].map(({icon,step,desc})=>(
          <div key={step} style={{ textAlign:"center", maxWidth:180 }}>
            <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.14em", color:"#d4a853", textTransform:"uppercase", marginBottom:6 }}>{step}</div>
            <div style={{ fontFamily:"var(--body)", fontSize:13, color:"rgba(247,242,232,0.38)", lineHeight:1.65, fontStyle:"italic" }}>{desc}</div>
          </div>
        ))}
      </div>

      <p style={{ position:"absolute", bottom:24, fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.18em", color:"rgba(255,255,255,0.15)", textTransform:"uppercase" }}>
        Future Self Messenger · Inspired by Tokyo
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ capsules, leather, journalTitle, coverImg, onOpenJournal, onNewEntry, onCustomizeCover }) {
  const sealed = capsules.filter(c=>c.status==="sealed").length;
  const delivered = capsules.filter(c=>c.status==="delivered").length;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg, #1c1008, #0e0a06 60%, #18100a)", display:"flex", flexDirection:"column", alignItems:"center", padding:"0 24px 60px" }}>
      {/* Nav */}
      <nav style={{
        width:"100%", maxWidth:900, display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"20px 0", borderBottom:"1px solid rgba(212,168,83,0.1)",
        marginBottom:64,
      }}>
        <span style={{ fontFamily:"var(--serif)", fontStyle:"italic", color:"rgba(212,168,83,0.75)", fontSize:17 }}>✉ Future Self</span>
        <div style={{ display:"flex", gap:24 }}>
          <button onClick={onCustomizeCover} style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.12em", color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>
            Cover
          </button>
          <button onClick={onNewEntry} style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.12em", color:"rgba(212,168,83,0.7)", textTransform:"uppercase" }}>
            + New Entry
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:"center", marginBottom:60 }}>
        <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.2em", color:"rgba(212,168,83,0.45)", textTransform:"uppercase", marginBottom:14 }}>
          Your time capsule journal
        </p>
        <h1 style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:"clamp(24px,4vw,40px)", color:"rgba(247,242,232,0.92)", marginBottom:8, fontWeight:400 }}>
          {journalTitle}
        </h1>
        <p style={{ fontFamily:"var(--body)", fontSize:14, color:"rgba(255,255,255,0.28)", fontStyle:"italic" }}>
          {capsules.length} {capsules.length===1?"entry":"entries"} inside
        </p>
      </div>

      {/* Floating book */}
      <div style={{ marginBottom:48, animation:"floatBook 6s ease-in-out infinite" }}>
        <BookCover leather={leather} title={journalTitle} coverImg={coverImg} onClick={onOpenJournal} />
      </div>

      {/* Open button */}
      <button onClick={onOpenJournal} style={{
        background:"rgba(212,168,83,0.12)", border:"1px solid rgba(212,168,83,0.3)",
        color:"rgba(212,168,83,0.8)", padding:"12px 36px",
        fontFamily:"var(--mono)", fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase",
        borderRadius:2, marginBottom:60, transition:"all 0.2s",
      }}
        onMouseOver={e=>{e.target.style.background="rgba(212,168,83,0.2)";}}
        onMouseOut={e=>{e.target.style.background="rgba(212,168,83,0.12)";}}
      >
        Open journal
      </button>

      {/* Stats */}
      <div style={{ display:"flex", gap:40, marginBottom:60 }}>
        {[
          { n:sealed,    label:"Sealed",    icon:"🔒" },
          { n:delivered, label:"Delivered", icon:"📬" },
          { n:capsules.length, label:"Total", icon:"✉" },
        ].map(({n,label,icon})=>(
          <div key={label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:"var(--serif)", fontStyle:"italic", fontSize:30, color:"rgba(212,168,83,0.85)", lineHeight:1 }}>{n}</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.12em", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Capsule shelf */}
      {capsules.length > 0 && (
        <div style={{ width:"100%", maxWidth:580 }}>
          <p style={{ fontFamily:"var(--mono)", fontSize:9, letterSpacing:"0.16em", color:"rgba(255,255,255,0.22)", textTransform:"uppercase", marginBottom:14 }}>
            Recent entries
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {capsules.map((c,i)=>(
              <button key={c.id} onClick={onOpenJournal} style={{
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(212,168,83,0.1)",
                borderRadius:8, padding:"14px 18px",
                display:"flex", alignItems:"center", gap:14,
                textAlign:"left", width:"100%",
                animation:`slideUp 0.4s ease ${i*0.06}s both`,
                transition:"background 0.2s",
              }}
                onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.055)"}
                onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
              >
                <WaxSeal color={c.sealColor} symbol={c.sealSymbol} size={36} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:"var(--body)", fontStyle:"italic", fontSize:14, color:"rgba(247,242,232,0.75)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:3 }}>
                    {c.prompt || "Personal reflection"}
                  </p>
                  <p style={{ fontFamily:"var(--mono)", fontSize:10, color:"rgba(255,255,255,0.28)", letterSpacing:"0.04em" }}>
                    {c.type.toUpperCase()} · {c.status==="delivered" ? `✓ Delivered ${c.deliverAt}` : `📮 Opens ${c.deliverAt}`}
                  </p>
                </div>
                <span style={{ color:"rgba(212,168,83,0.35)", fontSize:16 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | dashboard
  const [journalOpen, setJournalOpen] = useState(false);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [capsules, setCapsules] = useState(SAMPLE_CAPSULES);
  const [leather, setLeather] = useState(COVER_LEATHERS[0]);
  const [journalTitle, setJournalTitle] = useState("Letters to the Future");
  const [coverImg, setCoverImg] = useState(null);

  function handleSaveEntry(entry) {
    setCapsules(prev => [entry, ...prev]);
    setNewEntryOpen(false);
    setConfetti(true);
    setTimeout(()=>setConfetti(false), 3500);
  }

  function handleSaveCover(newLeather, newTitle, newImg) {
    setLeather(newLeather);
    setJournalTitle(newTitle);
    setCoverImg(newImg);
    setCoverOpen(false);
  }

  return (
    <div style={{ fontFamily:"var(--body)" }}>
      <GlobalStyles />
      <Confetti active={confetti} />

      {screen === "landing" && (
        <Landing onEnter={()=>setScreen("dashboard")} />
      )}

      {screen === "dashboard" && (
        <>
          <Dashboard
            capsules={capsules}
            leather={leather}
            journalTitle={journalTitle}
            coverImg={coverImg}
            onOpenJournal={()=>setJournalOpen(true)}
            onNewEntry={()=>setNewEntryOpen(true)}
            onCustomizeCover={()=>setCoverOpen(true)}
          />

          {journalOpen && (
            <Journal
              capsules={capsules}
              onClose={()=>setJournalOpen(false)}
              onNewEntry={()=>{ setJournalOpen(false); setNewEntryOpen(true); }}
            />
          )}

          {newEntryOpen && (
            <NewEntry
              onSave={handleSaveEntry}
              onCancel={()=>setNewEntryOpen(false)}
            />
          )}

          {coverOpen && (
            <CoverCustomizer
              leather={leather}
              title={journalTitle}
              coverImg={coverImg}
              onSave={handleSaveCover}
              onClose={()=>setCoverOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
