import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValueEvent } from 'framer-motion'
import { BEATS, beatIndexForProgress } from '../../utils/craftScenes'

export default function CraftNarrative({ scrollYProgress }) {
  const [index, setIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = beatIndexForProgress(latest)
    setIndex((prev) => (prev !== next ? next : prev))
  })

  const beat = BEATS[index]

  return (
    <div className="absolute inset-x-0 bottom-0 h-[42%] z-50 pointer-events-none flex flex-col items-center justify-end pb-16 md:pb-20 px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.id}
          initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-xl"
        >
          <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-blue-300/80 uppercase mb-4">
            {beat.eyebrow}
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-extralight text-white tracking-tight leading-none">
            {beat.headline}
          </h2>
          <p className="mt-4 text-sm md:text-base font-light text-slate-300/70 max-w-md">{beat.caption}</p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        {BEATS.map((b, i) => (
          <span
            key={b.id}
            className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
              i === index ? 'w-7 bg-blue-400' : 'w-2 bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
