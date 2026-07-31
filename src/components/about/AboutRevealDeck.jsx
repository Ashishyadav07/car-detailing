import React from 'react'
import { motion, useTransform } from 'framer-motion'
import { CHECKPOINTS, transitionWindowFor } from '../../utils/aboutScenes'
import { smootherstep } from '../../utils/animation'

// Each reveal style returns a clip-path template as a function of local
// progress t (0..1, already eased). Deliberately four different shapes so no
// two checkpoints open the same way.
const REVEALERS = {
  iris: (t) => `circle(${(t * 78).toFixed(1)}% at 50% 50%)`,
  diagonal: (t) => {
    const lead = Math.min(100, t * 118)
    const trail = Math.max(0, lead - 22)
    return `polygon(0% 0%, ${lead}% 0%, ${trail}% 100%, 0% 100%)`
  },
  slit: (t) => {
    const inset = (50 - t * 50).toFixed(1)
    return `inset(0% ${inset}% 0% ${inset}%)`
  },
  horizontal: (t) => {
    const inset = (50 - t * 50).toFixed(1)
    return `inset(${inset}% 0% ${inset}% 0%)`
  },
}

function Panel({ checkpoint, scrollYProgress }) {
  const [start, end] = checkpoint.range
  const span = end - start
  const fade = span * 0.18

  const localT = useTransform(scrollYProgress, [start, start + span * 0.55], [0, 1])
  const easedT = useTransform(localT, (v) => smootherstep(Math.min(1, Math.max(0, v))))
  const clipPath = useTransform(easedT, REVEALERS[checkpoint.reveal])

  const opacity = useTransform(
    scrollYProgress,
    [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  )
  const frameScale = useTransform(scrollYProgress, [start, start + fade, end], [0.94, 1, 1.03])

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 w-[min(34vw,420px)] h-[min(42vh,460px)] pointer-events-none"
      style={{ left: `${checkpoint.origin.x}%`, top: `${checkpoint.origin.y}%`, opacity, scale: frameScale }}
    >
      {/* Thin metallic viewfinder frame — reads as an instrument, not a card */}
      <div className="absolute inset-0 rounded-sm border border-blue-200/25 shadow-[0_0_40px_rgba(59,130,246,0.12)]" />
      <div className="absolute -top-px -left-px w-3 h-3 border-t border-l border-blue-300/60" />
      <div className="absolute -top-px -right-px w-3 h-3 border-t border-r border-blue-300/60" />
      <div className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-blue-300/60" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-blue-300/60" />

      <motion.div className="absolute inset-0 overflow-hidden" style={{ clipPath }}>
        <img src={checkpoint.image} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </motion.div>

      {/* Spec-plate stat — an engraved readout, not an icon card */}
      <div className="absolute -bottom-14 left-0 flex items-baseline gap-2.5 font-mono">
        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-blue-400">
          {checkpoint.stat.value}
        </span>
        <span className="text-[9px] tracking-[0.25em] text-slate-400 uppercase">{checkpoint.stat.label}</span>
      </div>
    </motion.div>
  )
}

function TransitionFlare({ checkpoint, scrollYProgress }) {
  const [wStart, wEnd] = transitionWindowFor(checkpoint)
  const mid = (wStart + wEnd) / 2
  const flareOpacity = useTransform(scrollYProgress, [wStart, mid, wEnd], [0, 0.9, 0])
  const flareScale = useTransform(scrollYProgress, [wStart, wEnd], [0.4, 1.6])
  const sweepX = useTransform(scrollYProgress, [wStart, wEnd], ['-30%', '130%'])
  const rotate = useTransform(scrollYProgress, [wStart, wEnd], [0, 35])

  return (
    <>
      {/* Lens flare — a bright point-source bloom at the checkpoint's origin */}
      <motion.div
        className="absolute z-35 pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
        style={{
          left: `${checkpoint.origin.x}%`,
          top: `${checkpoint.origin.y}%`,
          opacity: flareOpacity,
          scale: flareScale,
        }}
      >
        <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.9),rgba(96,165,250,0.35)_35%,transparent_70%)] blur-[2px]" />
        <motion.div
          className="absolute inset-[-60%] rounded-full border border-blue-200/30"
          style={{ rotate }}
        />
      </motion.div>

      {/* Light sweep — a diagonal band of light crossing the whole frame,
          the connective wipe between one checkpoint and the next. */}
      <motion.div
        className="absolute inset-y-0 z-34 pointer-events-none w-[45%] mix-blend-screen"
        style={{
          left: sweepX,
          opacity: flareOpacity,
          background:
            'linear-gradient(75deg, transparent 20%, rgba(191,219,254,0.16) 45%, rgba(219,234,254,0.28) 50%, rgba(191,219,254,0.16) 55%, transparent 80%)',
        }}
      />
    </>
  )
}

export default function AboutRevealDeck({ scrollYProgress }) {
  return (
    <div className="absolute inset-0 z-30">
      {CHECKPOINTS.map((cp) => (
        <Panel key={cp.id} checkpoint={cp} scrollYProgress={scrollYProgress} />
      ))}
      {CHECKPOINTS.map((cp) => (
        <TransitionFlare key={`flare-${cp.id}`} checkpoint={cp} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  )
}
