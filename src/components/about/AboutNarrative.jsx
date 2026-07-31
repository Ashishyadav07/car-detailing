import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValueEvent } from 'framer-motion'
import { CHECKPOINTS, checkpointIndexForProgress, isIntro, isOutro } from '../../utils/aboutScenes'

// One-shot light-sweep across the headline glyphs — the "polish reveal"
// motif from the Lab, applied to type instead of paint.
function SweepHeadline({ text }) {
  return (
    <span className="relative inline-block">
      <span>{text}</span>
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-clip-text text-transparent bg-[length:250%_100%] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.95) 50%, transparent 70%)',
        }}
        initial={{ backgroundPositionX: '150%' }}
        animate={{ backgroundPositionX: '-60%' }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        {text}
      </motion.span>
    </span>
  )
}

export default function AboutNarrative({ scrollYProgress }) {
  const [phase, setPhase] = useState('intro') // 'intro' | 'checkpoint' | 'outro'
  const [checkpointIndex, setCheckpointIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const nextPhase = isIntro(latest) ? 'intro' : isOutro(latest) ? 'outro' : 'checkpoint'
    setPhase((prev) => (prev !== nextPhase ? nextPhase : prev))
    if (nextPhase === 'checkpoint') {
      const idx = checkpointIndexForProgress(latest)
      setCheckpointIndex((prev) => (prev !== idx ? idx : prev))
    }
  })

  const checkpoint = CHECKPOINTS[checkpointIndex]

  return (
    <div className="absolute inset-x-0 bottom-0 h-[46%] z-30 pointer-events-none flex flex-col items-center justify-end pb-16 md:pb-20 px-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-2xl"
          >
            <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-blue-300/80 uppercase mb-5">
              THE STUDIO STANDARD
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extralight text-white tracking-tight leading-none">
              <SweepHeadline text="Precision, Engineered" />
            </h2>
            <p className="mt-5 text-sm md:text-base font-light text-slate-300/70 max-w-md">
              Four disciplines. One uncompromising standard.
            </p>
          </motion.div>
        )}

        {phase === 'checkpoint' && (
          <motion.div
            key={checkpoint.id}
            initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-xl"
          >
            <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-blue-300/80 uppercase mb-4">
              {checkpoint.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight leading-none">
              <SweepHeadline text={checkpoint.headline} />
            </h2>
            <p className="mt-4 text-sm md:text-base font-light text-slate-300/70 max-w-sm">
              {checkpoint.caption}
            </p>
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
              <SweepHeadline text="Every Commission, Engineered." />
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress pips — only meaningful during the checkpoint phase */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        {CHECKPOINTS.map((cp, i) => (
          <span
            key={cp.id}
            className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
              phase === 'checkpoint' && i === checkpointIndex ? 'w-7 bg-blue-400' : 'w-2 bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
