import { useState, useEffect, useRef } from "react";

const PROMPTS = [
  "What are you most afraid of right now, and what do you hope to have overcome?",
  "Describe your ideal ordinary Tuesday one year from now.",
  "What would your wiser self tell you today?",
  "Name three things you're proud of this season.",
  "What has surprised you most about where life has taken you?",
  "What do you want to remember about exactly how things feel right now?",
  "What are you still waiting for permission to do?",
  "Write a note to the person you love most.",
];

const THEMES = [
  { id: "vintage", label: "Vintage Letter", color: "#c8a96e", bg: "#fdf6e3", accent: "#8b5e3c" },
  { id: "midnight", label: "Midnight Dream", color: "#7c8fde", bg: "#0f0f1a", accent: "#c792ea" },
  { id: "bloom", label: "Spring Bloom", color: "#e8829a", bg: "#fff5f7", accent: "#6daedb" },
  { id: "forest", label: "Forest Walk", color: "#5a9a6f", bg: "#f0f7f2", accent: "#c4a35a" },
];

const SEALS = ["🌸", "🌙", "✦", "🍃", "💌", "🕊️", "⭐", "🌿"];

const SAMPLE_CAPSULES = [
  { id: 1, theme: "vintage", seal: "💌", deliveryAt: "Jan 12, 2027", createdAt: "Jan 12, 2026", type: "text", status: "sealed", prompt: "Describe your ideal ordinary Tuesday..." },
  { id: 2, theme: "midnight", seal: "🌙", deliveryAt: "Jun 3, 2026", createdAt: "Jun 3, 2025", type: "audio", status: "delivered", prompt: "What are you most afraid of right now..." },
];

function WaxSeal({ seal, color, size = 64, animate = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, boxShadow: `0 2px 12px ${color}66, inset 0 1px 3px rgba(255,255,255,0.3)`,
      border: `2px solid ${color}99`,
      animation: animate ? "sealPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
      flexShrink: 0,
    }}>
      {seal}
    </div>
  );
}

function EnvelopeIcon({ theme, size = 40 }) {
  const t = THEMES.find(th => th.id === theme) || THEMES[0];
  return (
    <div style={{
      width: size * 1.5, height: size, borderRadius: 6,
      background: t.bg, border: `2px solid ${t.color}55`,
      position: "relative", overflow: "hidden",
      boxShadow: `0 4px 16px ${t.color}33`,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "50%",
        background: `linear-gradient(135deg, ${t.color}22 50%, transparent 50%)`,
        borderBottom: `1px solid ${t.color}44`,
      }} />
    </div>
  );
}

function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!active) return;
    const newPieces = Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 0.8,
      color: ["#e8829a", "#7c8fde", "#c8a96e", "#5a9a6f", "#c4a35a"][Math.floor(Math.random() * 5)],
      char: ["✦", "◆", "●", "▲", "✿"][Math.floor(Math.random() * 5)],
      size: 8 + Math.random() * 10,
    }));
    setPieces(newPieces);
    const t = setTimeout(() => setPieces([]), 3000);
    return () => clearTimeout(t);
  }, [active]);

  if (!pieces.length) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: "-20px",
          color: p.color, fontSize: p.size,
          animation: `confettiFall 2.5s ease-in ${p.delay}s forwards`,
        }}>{p.char}</div>
      ))}
    </div>
  );
}

function ProgressBar({ step, total = 4 }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < step ? "var(--accent)" : "var(--border)",
          transition: "background 0.4s ease",
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home"); // home | create | seal | capsules | open
  const [step, setStep] = useState(1);
  const [capsuleType, setCapsuleType] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("vintage");
  const [selectedSeal, setSelectedSeal] = useState("💌");
  const [deliveryYears, setDeliveryYears] = useState(1);
  const [confetti, setConfetti] = useState(false);
  const [openCapsule, setOpenCapsule] = useState(null);
  const [capsules, setCapsules] = useState(SAMPLE_CAPSULES);
  const [hoveredId, setHoveredId] = useState(null);
  const currentTheme = THEMES.find(t => t.id === selectedTheme);

  const isDark = selectedTheme === "midnight";

  const cssVars = {
    "--bg": currentTheme.bg,
    "--accent": currentTheme.color,
    "--accent2": currentTheme.accent,
    "--text": isDark ? "#e8e6f0" : "#2c2420",
    "--subtext": isDark ? "#9990b8" : "#7a6a60",
    "--border": isDark ? "#2a2840" : "#e8ddd0",
    "--card": isDark ? "#16142a" : "#fffdf8",
    "--cardBorder": isDark ? "#2e2b4a" : "#f0e8dc",
  };

  function handleSeal() {
    const newCapsule = {
      id: Date.now(), theme: selectedTheme, seal: selectedSeal,
      deliveryAt: `${new Date(Date.now() + deliveryYears * 365.25 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: capsuleType, status: "sealed",
      prompt: selectedPrompt || "Personal reflection",
      content: textContent,
    };
    setCapsules(prev => [newCapsule, ...prev]);
    setView("seal");
    setConfetti(true);
  }

  function resetCreate() {
    setStep(1); setTextContent(""); setSelectedPrompt(null);
    setCapsuleType("text"); setSelectedTheme("vintage"); setSelectedSeal("💌"); setDeliveryYears(1);
  }

  const fontStack = "'Cormorant Garamond', 'Crimson Text', Georgia, serif";
  const monoStack = "'Courier Prime', 'Courier New', monospace";

  return (
    <div style={{ ...cssVars, minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: fontStack, transition: "background 0.5s ease, color 0.3s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Courier+Prime:ital@0;1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes sealPop {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes envelopeOpen {
          0% { transform: scaleY(0); opacity: 0; transform-origin: top; }
          100% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        
        textarea:focus, input:focus, select:focus { outline: none; }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
        
        button { cursor: pointer; font-family: inherit; }
        
        .nav-btn:hover { opacity: 0.7; }
        
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
        }
        
        .prompt-card:hover { background: var(--accent) !important; color: white !important; }
        .theme-opt:hover { transform: scale(1.04); }
        .seal-opt:hover { transform: scale(1.15); }
        .type-btn:hover { border-color: var(--accent) !important; }
      `}</style>

      <Confetti active={confetti} />

      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 100,
        backdropFilter: "blur(8px)",
      }}>
        <button onClick={() => { setView("home"); resetCreate(); }} style={{
          background: "none", border: "none", color: "var(--text)", fontSize: 20,
          fontFamily: fontStack, fontWeight: 500, letterSpacing: "0.02em", cursor: "pointer",
        }}>
          ✉ Future Self
        </button>
        <div style={{ display: "flex", gap: 24 }}>
          {["home", "capsules"].map(v => (
            <button key={v} className="nav-btn" onClick={() => { setView(v); resetCreate(); }} style={{
              background: "none", border: "none", color: view === v ? "var(--accent)" : "var(--subtext)",
              fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase",
              fontFamily: monoStack, transition: "color 0.2s",
            }}>
              {v === "home" ? "Home" : "My Capsules"}
            </button>
          ))}
        </div>
      </nav>

      {/* HOME */}
      {view === "home" && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 32px", animation: "fadeUp 0.6s ease" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 56, marginBottom: 20, animation: "float 4s ease-in-out infinite" }}>✉</div>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 300, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.01em" }}>
              A letter to your<br />
              <em style={{ fontStyle: "italic", color: "var(--accent)" }}>future self</em>
            </h1>
            <p style={{ fontSize: 18, color: "var(--subtext)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 40px", fontWeight: 300 }}>
              Inspired by a quiet café in Tokyo where visitors write letters, seal them with wax, and receive them a year later. Create your own time capsule — text, audio, or video — sealed until the moment you need it most.
            </p>
            <button onClick={() => { setView("create"); setStep(1); }} style={{
              background: "var(--accent)", color: "white", border: "none",
              padding: "16px 48px", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase",
              fontFamily: monoStack, borderRadius: 2,
              boxShadow: `0 8px 32px var(--accent)44`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseOver={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 12px 40px var(--accent)66`; }}
              onMouseOut={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 8px 32px var(--accent)44`; }}
            >
              Begin Writing
            </button>
          </div>

          {/* How it works */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 64 }}>
            {[
              { icon: "✍", title: "Write", desc: "Compose a text, audio, or video message. Choose a reflection prompt if you need a nudge." },
              { icon: "🕯", title: "Seal", desc: "Pick a wax seal and theme. Your capsule is locked away — invisible until its delivery date." },
              { icon: "📬", title: "Receive", desc: "On your chosen date, your past self's words arrive as a gift from someone who knew you then." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card-hover" style={{
                background: "var(--card)", border: "1px solid var(--cardBorder)",
                borderRadius: 12, padding: "28px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, fontFamily: monoStack, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent)" }}>{title}</div>
                <div style={{ fontSize: 14, color: "var(--subtext)", lineHeight: 1.65, fontWeight: 300 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Recent capsules preview */}
          {capsules.length > 0 && (
            <div>
              <div style={{ fontFamily: monoStack, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--subtext)", marginBottom: 16 }}>Recent Capsules</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {capsules.slice(0, 2).map(c => {
                  const t = THEMES.find(th => th.id === c.theme) || THEMES[0];
                  return (
                    <div key={c.id} className="card-hover" onClick={() => { setOpenCapsule(c); setView("open"); }}
                      style={{ background: "var(--card)", border: "1px solid var(--cardBorder)", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
                      <WaxSeal seal={c.seal} color={t.color} size={44} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "var(--subtext)", fontFamily: monoStack, letterSpacing: "0.04em", marginBottom: 4 }}>
                          {c.type.toUpperCase()} · {c.status === "delivered" ? "✓ Delivered" : `📮 Delivers ${c.deliveryAt}`}
                        </div>
                        <div style={{ fontSize: 15, fontStyle: "italic", color: "var(--text)" }}>{c.prompt.slice(0, 60)}…</div>
                      </div>
                      <div style={{ color: "var(--border)", fontSize: 18 }}>›</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE FLOW */}
      {view === "create" && (
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "48px 32px", animation: "fadeUp 0.5s ease" }}>
          <ProgressBar step={step} />

          {/* Step 1: Type */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 8 }}>What kind of capsule?</h2>
              <p style={{ color: "var(--subtext)", marginBottom: 36, fontSize: 16, fontWeight: 300 }}>Choose the medium that feels most honest right now.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
                {[
                  { id: "text", icon: "✍", label: "Written Letter", desc: "Words that will age like wine" },
                  { id: "audio", icon: "🎙", label: "Voice Note", desc: "Your actual voice, preserved" },
                  { id: "video", icon: "📹", label: "Video", desc: "Your face, your expressions" },
                ].map(opt => (
                  <button key={opt.id} className="type-btn" onClick={() => setCapsuleType(opt.id)} style={{
                    background: capsuleType === opt.id ? `${currentTheme.color}15` : "var(--card)",
                    border: `2px solid ${capsuleType === opt.id ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 12, padding: "24px 16px", textAlign: "center",
                    transition: "all 0.25s ease", cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{opt.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "var(--subtext)", lineHeight: 1.5 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} style={{
                width: "100%", background: "var(--accent)", color: "white", border: "none",
                padding: "14px", fontSize: 14, fontFamily: monoStack, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2,
              }}>Continue →</button>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 8 }}>
                {capsuleType === "text" ? "Write your letter" : capsuleType === "audio" ? "Record your voice" : "Record a video"}
              </h2>
              <p style={{ color: "var(--subtext)", marginBottom: 28, fontSize: 16, fontWeight: 300 }}>Be honest. Be specific. Your future self will thank you for the details.</p>

              {/* Prompts */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: monoStack, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtext)", marginBottom: 12 }}>Reflection Prompts</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PROMPTS.slice(0, 4).map(p => (
                    <button key={p} className="prompt-card" onClick={() => { setSelectedPrompt(p); setTextContent(p + "\n\n"); }} style={{
                      background: selectedPrompt === p ? "var(--accent)" : "var(--card)",
                      color: selectedPrompt === p ? "white" : "var(--text)",
                      border: `1px solid ${selectedPrompt === p ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 6, padding: "8px 14px", fontSize: 12, fontFamily: monoStack,
                      cursor: "pointer", textAlign: "left", lineHeight: 1.4, transition: "all 0.2s",
                    }}>
                      {p.slice(0, 45)}…
                    </button>
                  ))}
                </div>
              </div>

              {capsuleType === "text" ? (
                <textarea value={textContent} onChange={e => setTextContent(e.target.value)}
                  placeholder="Dear future self…&#10;&#10;Begin wherever feels right. There's no wrong way to do this."
                  style={{
                    width: "100%", height: 240, background: "var(--card)",
                    border: "1px solid var(--border)", borderRadius: 8, padding: "20px",
                    color: "var(--text)", fontSize: 17, lineHeight: 1.8, fontFamily: fontStack,
                    fontWeight: 300, resize: "none", fontStyle: "italic",
                  }} />
              ) : (
                <div style={{
                  background: "var(--card)", border: "2px dashed var(--border)", borderRadius: 12,
                  padding: "48px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 16, animation: "shimmer 2s ease infinite" }}>
                    {capsuleType === "audio" ? "🎙" : "📹"}
                  </div>
                  <div style={{ fontSize: 15, color: "var(--subtext)", marginBottom: 20, fontWeight: 300 }}>
                    {capsuleType === "audio" ? "Audio recording" : "Video recording"} would be available in the full app.<br />For this demo, add a written note below.
                  </div>
                  <textarea value={textContent} onChange={e => setTextContent(e.target.value)}
                    placeholder="Add a written note to accompany your recording…"
                    style={{
                      width: "100%", height: 120, background: "var(--bg)",
                      border: "1px solid var(--border)", borderRadius: 8, padding: "16px",
                      color: "var(--text)", fontSize: 15, fontFamily: fontStack, fontWeight: 300, resize: "none",
                    }} />
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(1)} style={{ flex: 0, background: "none", border: "1px solid var(--border)", color: "var(--subtext)", padding: "12px 24px", fontFamily: monoStack, fontSize: 13, borderRadius: 2, cursor: "pointer" }}>← Back</button>
                <button onClick={() => setStep(3)} disabled={!textContent.trim()} style={{
                  flex: 1, background: textContent.trim() ? "var(--accent)" : "var(--border)", color: "white",
                  border: "none", padding: "12px", fontFamily: monoStack, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2, transition: "background 0.3s",
                }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 8 }}>Choose your seal</h2>
              <p style={{ color: "var(--subtext)", marginBottom: 32, fontSize: 16, fontWeight: 300 }}>Personalize your capsule. It will be invisible to you until delivery.</p>

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: monoStack, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtext)", marginBottom: 14 }}>Theme</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {THEMES.map(t => (
                    <button key={t.id} className="theme-opt" onClick={() => setSelectedTheme(t.id)} style={{
                      background: t.bg, border: `2px solid ${selectedTheme === t.id ? t.color : "transparent"}`,
                      borderRadius: 8, padding: "10px 14px", fontSize: 12, color: t.accent || t.color,
                      cursor: "pointer", transition: "transform 0.2s", fontFamily: monoStack, fontWeight: selectedTheme === t.id ? "bold" : "normal",
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: monoStack, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtext)", marginBottom: 14 }}>Wax Seal</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {SEALS.map(s => (
                    <button key={s} className="seal-opt" onClick={() => setSelectedSeal(s)} style={{
                      width: 52, height: 52, borderRadius: "50%", border: `2px solid ${selectedSeal === s ? "var(--accent)" : "transparent"}`,
                      background: selectedSeal === s ? `${currentTheme.color}22` : "var(--card)",
                      fontSize: 24, cursor: "pointer", transition: "transform 0.2s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: monoStack, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtext)", marginBottom: 14 }}>Delivery: {deliveryYears} year{deliveryYears > 1 ? "s" : ""} from today</div>
                <input type="range" min="1" max="5" value={deliveryYears} onChange={e => setDeliveryYears(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)", height: 4 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--subtext)", fontFamily: monoStack, marginTop: 8 }}>
                  {[1, 2, 3, 4, 5].map(y => <span key={y}>{y}yr</span>)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(2)} style={{ flex: 0, background: "none", border: "1px solid var(--border)", color: "var(--subtext)", padding: "12px 24px", fontFamily: monoStack, fontSize: 13, borderRadius: 2 }}>← Back</button>
                <button onClick={() => setStep(4)} style={{ flex: 1, background: "var(--accent)", color: "white", border: "none", padding: "12px", fontFamily: monoStack, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2 }}>Preview →</button>
              </div>
            </div>
          )}

          {/* Step 4: Preview & Send */}
          {step === 4 && (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 32, fontWeight: 300, marginBottom: 8 }}>Ready to seal?</h2>
              <p style={{ color: "var(--subtext)", marginBottom: 40, fontWeight: 300 }}>Once sealed, your capsule is locked until {new Date(Date.now() + deliveryYears * 365.25 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>

              {/* Envelope Preview */}
              <div style={{ position: "relative", display: "inline-block", marginBottom: 48 }}>
                <div style={{
                  width: 280, height: 190, borderRadius: 12,
                  background: currentTheme.bg,
                  border: `2px solid ${currentTheme.color}44`,
                  boxShadow: `0 20px 60px ${currentTheme.color}33, 0 4px 20px rgba(0,0,0,0.1)`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                  margin: "0 auto",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "45%",
                    background: `linear-gradient(160deg, ${currentTheme.color}22 45%, transparent 45%)`,
                  }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: `${currentTheme.color}08` }} />
                  <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
                    <WaxSeal seal={selectedSeal} color={currentTheme.color} size={56} animate={true} />
                    <div style={{ marginTop: 12, fontFamily: monoStack, fontSize: 11, color: "var(--subtext)", letterSpacing: "0.08em" }}>
                      DELIVER: {new Date(Date.now() + deliveryYears * 365.25 * 86400000).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--card)", border: "1px solid var(--cardBorder)", borderRadius: 10, padding: "20px 24px", marginBottom: 32, textAlign: "left" }}>
                <div style={{ fontFamily: monoStack, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtext)", marginBottom: 12 }}>Capsule Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    ["Type", capsuleType.toUpperCase()],
                    ["Theme", THEMES.find(t => t.id === selectedTheme)?.label],
                    ["Sealed", new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
                    ["Delivers", new Date(Date.now() + deliveryYears * 365.25 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: "var(--subtext)", fontFamily: monoStack, letterSpacing: "0.06em" }}>{k}</div>
                      <div style={{ fontSize: 15, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setStep(3)} style={{ flex: 0, background: "none", border: "1px solid var(--border)", color: "var(--subtext)", padding: "12px 24px", fontFamily: monoStack, fontSize: 13, borderRadius: 2 }}>← Back</button>
                <button onClick={handleSeal} style={{
                  flex: 1, background: `linear-gradient(135deg, ${currentTheme.color}, ${currentTheme.accent})`,
                  color: "white", border: "none", padding: "16px", fontFamily: monoStack,
                  fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 2,
                  boxShadow: `0 8px 32px ${currentTheme.color}44`,
                }}>
                  🕯 Seal & Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEALED CONFIRMATION */}
      {view === "seal" && (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "80px 32px", textAlign: "center", animation: "fadeUp 0.7s ease" }}>
          <div style={{ fontSize: 72, marginBottom: 24, animation: "float 3s ease-in-out infinite" }}>
            <WaxSeal seal={selectedSeal} color={currentTheme.color} size={80} />
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 300, marginBottom: 16 }}>Your capsule is sealed.</h2>
          <p style={{ fontSize: 17, color: "var(--subtext)", lineHeight: 1.8, marginBottom: 16, fontWeight: 300, fontStyle: "italic" }}>
            "The envelope has been placed in the mailbox.<br />Now, let time do its work."
          </p>
          <p style={{ fontSize: 15, color: "var(--subtext)", marginBottom: 48, fontFamily: monoStack, letterSpacing: "0.04em" }}>
            Arrives: {new Date(Date.now() + deliveryYears * 365.25 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { resetCreate(); setView("create"); }} style={{
              background: "var(--accent)", color: "white", border: "none", padding: "14px 32px",
              fontFamily: monoStack, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2,
            }}>Write Another</button>
            <button onClick={() => setView("capsules")} style={{
              background: "none", border: "1px solid var(--border)", color: "var(--text)", padding: "14px 32px",
              fontFamily: monoStack, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2,
            }}>View My Capsules</button>
          </div>
        </div>
      )}

      {/* CAPSULES LIST */}
      {view === "capsules" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 32px", animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 300, marginBottom: 6 }}>My Capsules</h2>
              <p style={{ color: "var(--subtext)", fontWeight: 300 }}>{capsules.length} letter{capsules.length !== 1 ? "s" : ""} through time</p>
            </div>
            <button onClick={() => { resetCreate(); setView("create"); }} style={{
              background: "var(--accent)", color: "white", border: "none",
              padding: "12px 24px", fontFamily: monoStack, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2,
            }}>+ New Capsule</button>
          </div>

          {capsules.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--subtext)" }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>📭</div>
              <p style={{ fontSize: 18, fontStyle: "italic", fontWeight: 300 }}>Your mailbox is empty.<br />Write your first letter to the future.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {capsules.map(c => {
                const t = THEMES.find(th => th.id === c.theme) || THEMES[0];
                const isDelivered = c.status === "delivered";
                return (
                  <div key={c.id} className="card-hover"
                    onClick={() => isDelivered ? (setOpenCapsule(c), setView("open")) : null}
                    onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: "var(--card)", border: `1px solid ${isDelivered ? t.color + "44" : "var(--cardBorder)"}`,
                      borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20,
                      cursor: isDelivered ? "pointer" : "default",
                      opacity: isDelivered ? 1 : 0.85,
                    }}>
                    <div style={{ position: "relative" }}>
                      <WaxSeal seal={c.seal} color={t.color} size={52} />
                      {isDelivered && (
                        <div style={{
                          position: "absolute", bottom: -4, right: -4,
                          background: "#4caf50", color: "white", borderRadius: "50%",
                          width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                        }}>✓</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{
                          fontFamily: monoStack, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                          color: "white", background: isDelivered ? "#4caf50" : "var(--accent)",
                          padding: "3px 8px", borderRadius: 3,
                        }}>
                          {isDelivered ? "Delivered" : "Sealed"}
                        </span>
                        <span style={{ fontFamily: monoStack, fontSize: 11, color: "var(--subtext)", letterSpacing: "0.04em" }}>
                          {c.type.toUpperCase()} · {t.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 15, fontStyle: "italic", color: "var(--text)", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.prompt.slice(0, 70)}…
                      </div>
                      <div style={{ fontFamily: monoStack, fontSize: 11, color: "var(--subtext)" }}>
                        Written {c.createdAt} · {isDelivered ? `Delivered ${c.deliveryAt}` : `Delivers ${c.deliveryAt}`}
                      </div>
                    </div>
                    {isDelivered && <div style={{ color: "var(--accent)", fontSize: 20 }}>›</div>}
                    {!isDelivered && <div style={{ fontSize: 24, opacity: 0.5 }}>🔒</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* OPEN CAPSULE */}
      {view === "open" && openCapsule && (() => {
        const t = THEMES.find(th => th.id === openCapsule.theme) || THEMES[0];
        return (
          <div style={{ maxWidth: 580, margin: "0 auto", padding: "48px 32px", animation: "fadeUp 0.6s ease" }}>
            <button onClick={() => setView("capsules")} style={{
              background: "none", border: "none", color: "var(--subtext)", fontFamily: monoStack,
              fontSize: 13, letterSpacing: "0.06em", marginBottom: 32, cursor: "pointer",
            }}>← Back to capsules</button>

            <div style={{
              background: t.bg, border: `2px solid ${t.color}33`, borderRadius: 16,
              padding: "48px", textAlign: "center", marginBottom: 32,
              boxShadow: `0 20px 60px ${t.color}22`,
              animation: "envelopeOpen 0.5s ease",
            }}>
              <WaxSeal seal={openCapsule.seal} color={t.color} size={64} animate={true} />
              <div style={{ marginTop: 24, fontFamily: monoStack, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: t.accent || t.color, marginBottom: 8 }}>
                A letter from your past self
              </div>
              <div style={{ fontSize: 13, color: "var(--subtext)", fontFamily: monoStack }}>
                Written {openCapsule.createdAt}
              </div>
            </div>

            <div style={{
              background: "var(--card)", border: "1px solid var(--cardBorder)", borderRadius: 12, padding: "36px",
            }}>
              <div style={{ fontFamily: monoStack, fontSize: 11, color: "var(--subtext)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
                {openCapsule.type === "text" ? "Written Letter" : openCapsule.type === "audio" ? "Voice Note" : "Video Message"}
              </div>

              {openCapsule.type !== "text" && (
                <div style={{
                  background: `${t.color}15`, border: `1px solid ${t.color}33`,
                  borderRadius: 8, padding: "20px", textAlign: "center", marginBottom: 24,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{openCapsule.type === "audio" ? "🎙" : "📹"}</div>
                  <div style={{ fontSize: 13, color: "var(--subtext)", fontFamily: monoStack }}>
                    {openCapsule.type === "audio" ? "Audio" : "Video"} playback available in the full app
                  </div>
                </div>
              )}

              <p style={{ fontSize: 17, lineHeight: 1.9, fontStyle: "italic", fontWeight: 300, color: "var(--text)" }}>
                {openCapsule.content || "This is a sample capsule from your past self. In the full app, your actual message would appear here — your thoughts, your fears, your dreams captured in this moment for your future self to rediscover."}
              </p>
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button onClick={() => { resetCreate(); setView("create"); }} style={{
                background: "var(--accent)", color: "white", border: "none",
                padding: "14px 36px", fontFamily: monoStack, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2,
                boxShadow: `0 8px 24px ${t.color}44`,
              }}>✍ Write a Reply</button>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "48px 32px 32px", color: "var(--subtext)", borderTop: "1px solid var(--border)", marginTop: 80 }}>
        <div style={{ fontFamily: monoStack, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Future Self Messenger</div>
        <div style={{ fontSize: 13, fontStyle: "italic", fontWeight: 300 }}>Inspired by a quiet café in Tokyo.</div>
      </footer>
    </div>
  );
}
