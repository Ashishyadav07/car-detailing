import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Zap } from 'lucide-react'

const PULL = 0.35
const SPRING = { stiffness: 200, damping: 18, mass: 0.6 }

// The single conversion action on the whole page, styled as an engine-start
// control: magnetic hover (the button leans toward the cursor within its
// bounds), a radial fill-sweep on press, and a full-bleed bloom flash handed
// back to the caller on activation.
export default function MagneticIgnition({ label = 'IGNITION', busy = false, onActivate = null }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, SPRING)
  const springY = useSpring(y, SPRING)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * PULL)
    y.set(relY * PULL)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={busy}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onActivate}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      className="group relative isolate mt-2 flex items-center justify-center gap-3 w-full py-4 rounded-full overflow-hidden border border-blue-400/40 bg-slate-900/80 text-white font-mono font-bold text-xs uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(37,99,235,0.15)] transition-shadow duration-300 hover:shadow-[0_0_55px_rgba(59,130,246,0.35)] disabled:opacity-60"
    >
      {/* Radial fill-sweep beneath the label, expands from center on hover */}
      <span className="absolute inset-0 -z-10 scale-0 group-hover:scale-[2.2] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.9),rgba(37,99,235,0.4)_55%,transparent_75%)] transition-transform duration-500 ease-out origin-center" />
      <Zap className="w-3.5 h-3.5 text-blue-300 group-hover:text-white transition-colors" />
      <span>{busy ? 'IGNITING…' : label}</span>
    </motion.button>
  )
}
