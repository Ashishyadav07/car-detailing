import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValueEvent } from 'framer-motion'
import { PAIRS, pairIndexForProgress, isIntro, isOutro } from '../../utils/transformScenes'

export default function TransformNarrative({ scrollYProgress }) {
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const nextPhase = isIntro(latest) ? 'intro' : isOutro(latest) ? 'outro' : 'pair'
    setPhase((prev) => (prev !== nextPhase ? nextPhase : prev))
    if (nextPhase === 'pair') {
      const idx = pairIndexForProgress(latest)
      setIndex((prev) => (prev !== idx ? idx : prev))
    }
  })

  const pair = PAIRS[index]

  return (
    <div className="absolute inset-x-0 bottom-0 h-[42%] z-40 pointer-events-none flex flex-col items-center justify-end pb-16 md:pb-20 px-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-xl"
          >
            <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-blue-300/80 uppercase mb-5">
              THE TRANSFORMATION
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extralight text-white tracking-tight leading-none">
              Witness It Happen
            </h2>
          </motion.div>
        )}

        {phase === 'pair' && (
          <motion.div
            key={pair.id}
            initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-xl"
          >
            <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-blue-300/80 uppercase mb-4">
              {pair.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight leading-none">
              {pair.headline}
            </h2>
            <p className="mt-4 text-sm md:text-base font-light text-slate-300/70 max-w-sm">{pair.caption}</p>
          </motion.div>
        )}

        {phase === 'outro' && (
          <motion.div
            key="outro"
            initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center"
          >
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight leading-none">
              Transformed.
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        {PAIRS.map((p, i) => (
          <span
            key={p.id}
            className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
              phase === 'pair' && i === index ? 'w-7 bg-blue-400' : 'w-2 bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
