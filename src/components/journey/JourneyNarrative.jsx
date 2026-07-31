import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValueEvent } from 'framer-motion'
import { JOURNEY_SCENES, SCENE_COUNT, SCENE_SPAN } from '../../utils/journeyScenes'

export default function JourneyNarrative({ scrollYProgress }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = Math.min(SCENE_COUNT - 1, Math.max(0, Math.floor(latest / SCENE_SPAN)))
    setActiveIndex((prev) => (prev !== next ? next : prev))
  })

  const scene = JOURNEY_SCENES[activeIndex]

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-end pb-16 md:pb-20 px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 26, letterSpacing: '0.4em', filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.02em', filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, letterSpacing: '0.1em', filter: 'blur(10px)' }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-blue-300/80 uppercase mb-4">
            {scene.eyebrow}
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extralight text-white tracking-tight leading-none">
            {scene.title}
          </h2>
          <p className="mt-4 text-sm md:text-base font-light text-slate-300/80 max-w-md">
            {scene.caption}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Minimal progress markers — no HUD panel, just five slivers */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        {JOURNEY_SCENES.map((s, i) => (
          <span
            key={s.id}
            className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
              i === activeIndex ? 'w-7 bg-blue-400' : 'w-2 bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
