'use client'
// src/components/WaxSeal.tsx
import { useEffect, useRef } from 'react'

function adj(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amt))
  const b = Math.min(255, Math.max(0, (n & 255) + amt))
  return `rgb(${r},${g},${b})`
}

interface Props {
  color:     string
  symbol:    string
  size?:     number
  imgData?:  string | null
  animate?:  boolean
  className?: string
}

export default function WaxSeal({ color, symbol, size = 60, imgData = null, animate = false, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const cx = size / 2, cy = size / 2, r = size / 2 - 3
    ctx.clearRect(0, 0, size, size)

    // Wax body
    const bg = ctx.createRadialGradient(cx - r * .28, cy - r * .3, r * .05, cx, cy, r)
    bg.addColorStop(0, adj(color, 55))
    bg.addColorStop(.3, adj(color, 20))
    bg.addColorStop(.7, color)
    bg.addColorStop(1, adj(color, -35))
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill()

    // Organic drip bumps at edges
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + Math.sin(i * 1.3) * 0.5
      const dr = r * (0.88 + Math.sin(i * 2.1) * 0.08)
      const bx = cx + Math.cos(a) * dr, by = cy + Math.sin(a) * dr
      const dg = ctx.createRadialGradient(bx, by, 0, bx, by, r * .22)
      dg.addColorStop(0, adj(color, 28) + '99'); dg.addColorStop(1, 'transparent')
      ctx.beginPath(); ctx.arc(bx, by, r * .22, 0, Math.PI * 2); ctx.fillStyle = dg; ctx.fill()
    }

    // Specular highlight
    const hl = ctx.createRadialGradient(cx - r * .32, cy - r * .38, 0, cx - r * .18, cy - r * .2, r * .5)
    hl.addColorStop(0, 'rgba(255,255,255,0.42)'); hl.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = hl; ctx.fill()

    if (imgData) {
      const img = new Image()
      img.onload = () => {
        ctx.save()
        ctx.beginPath(); ctx.arc(cx, cy, r * .6, 0, Math.PI * 2); ctx.clip()
        ctx.drawImage(img, cx - r * .6, cy - r * .6, r * 1.2, r * 1.2)
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = adj(color, -15) + '88'
        ctx.fillRect(cx - r * .6, cy - r * .6, r * 1.2, r * 1.2)
        ctx.restore()
        ctx.beginPath(); ctx.arc(cx, cy, r * .62, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(212,168,83,0.65)'; ctx.lineWidth = 1.5; ctx.stroke()
      }
      img.src = imgData
    } else {
      ctx.font = `${Math.round(r * .58)}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillText(symbol, cx + 1.5, cy + 1.5)
      const sg = ctx.createLinearGradient(cx, cy - r * .3, cx, cy + r * .3)
      sg.addColorStop(0, '#f0d880'); sg.addColorStop(.5, '#d4a853'); sg.addColorStop(1, '#b8883a')
      ctx.fillStyle = sg; ctx.fillText(symbol, cx, cy)
    }

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(212,168,83,0.35)'; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, r * .68, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = .8; ctx.stroke()
  }, [color, symbol, size, imgData])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={className}
      style={{
        borderRadius: '50%',
        filter: `drop-shadow(0 ${Math.round(size * .06)}px ${Math.round(size * .16)}px rgba(0,0,0,0.45))`,
        animation: animate ? 'sealLand 0.65s cubic-bezier(.34,1.4,.64,1) forwards' : 'none',
        flexShrink: 0,
      }}
    />
  )
}
