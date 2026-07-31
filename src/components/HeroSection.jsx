import React, { useState } from 'react'
import { motion, useMotionValueEvent, useSpring, useTransform } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'

const STAGES = [
  { num: '01', title: '3/4 STUDIO', range: [0.0, 0.2] },
  { num: '02', title: 'SIDE PROFILE', range: [0.2, 0.4] },
  { num: '03', title: 'RIMS & BRAKES', range: [0.4, 0.6] },
  { num: '04', title: 'FRONT GRILLE', range: [0.6, 0.8] },
]

// Matches the critically damped follower driving the 3D camera (omega = 12,
// so stiffness = omega^2 and damping = 2*omega) — the bar and the camera then
// ease on the same curve instead of drifting apart.
const BAR_SPRING = { stiffness: 144, damping: 24, mass: 1, restDelta: 0.0005 }

export default function HeroSection({ scrollYProgress }) {
  // The bar is driven straight off a motion value: no React state, no layout,
  // just a compositor transform. It used to animate `height` from a state
  // update on every scroll event, which forced a layout pass per frame on the
  // same main thread the 3D render loop runs on.
  const smoothProgress = useSpring(scrollYProgress, BAR_SPRING)
  const barScaleY = useTransform(smoothProgress, (p) => Math.min(1, Math.max(0.05, p)))

  // Only the two genuinely discrete pieces of UI stay in React state, and they
  // re-render on a change of value rather than on every scroll tick.
  const [activeIndex, setActiveIndex] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(true)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const nextIndex = Math.min(
      Math.max(Math.floor(latest / 0.25), 0),
      STAGES.length - 1
    )
    setActiveIndex((prev) => (prev !== nextIndex ? nextIndex : prev))

    const nextHint = latest < 0.15
    setShowScrollHint((prev) => (prev !== nextHint ? nextHint : prev))
  })

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 md:p-10">
      {/* Top Header Information HUD */}
      <div className="flex items-start justify-between mt-20 md:mt-24">
        {/* Top Left Minimal Studio Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2.5 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800/80 text-xs font-mono text-slate-300 tracking-wider shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="font-semibold text-white">APEX STUDIO</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">GT500 SPEC</span>
        </motion.div>

        {/* Top Right Spec Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden sm:flex flex-col items-end text-[11px] font-mono text-slate-400 tracking-wider bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800/60"
        >
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>3D CINEMATIC VIEWPORT</span>
          </div>
          <span className="text-slate-400 text-[10px] mt-0.5">STUDIO BAY 01 &bull; SHADOW REFLECTIONS</span>
        </motion.div>
      </div>

      {/* Right Floating Minimal Scroll Progress Indicator (01 - 04) */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-end gap-5">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-end gap-3 bg-slate-950/60 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800/60 shadow-2xl shadow-black/80"
        >
          {/* Vertical Track Progress Bar */}
          <div className="w-1 h-32 bg-slate-800/80 rounded-full overflow-hidden relative mb-1">
            <motion.div
              className="w-full h-full origin-top bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-400 rounded-full"
              style={{ scaleY: barScaleY }}
            />
          </div>

          {/* Stage Step Numbers & Labels */}
          {STAGES.map((stage, idx) => {
            const isActive = activeIndex === idx
            return (
              <div
                key={stage.num}
                className={`flex items-center gap-2.5 transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <span className={`text-[10px] font-mono uppercase tracking-widest font-bold hidden md:inline ${
                  isActive ? 'text-blue-400' : 'text-slate-400'
                }`}>
                  {stage.title}
                </span>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {stage.num}
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Bottom Center Subtle "SCROLL TO EXPLORE" Guidance Hint */}
      <div className="flex justify-center pb-24 md:pb-28">
        <motion.div
          animate={{
            opacity: showScrollHint ? 1 : 0,
            y: showScrollHint ? [0, 6, 0] : 10,
          }}
          transition={{
            opacity: { duration: 0.4 },
            y: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-slate-800/80 px-4 py-1.5 rounded-full shadow-lg"
        >
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-300">
            SCROLL TO EXPLORE
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
        </motion.div>
      </div>
    </div>
  )
}

