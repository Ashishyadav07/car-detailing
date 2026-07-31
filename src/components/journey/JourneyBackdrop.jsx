import React, { useState } from 'react'
import { motion, useTransform, useMotionValueEvent } from 'framer-motion'
import { JOURNEY_SCENES, SCENE_COUNT, SCENE_SPAN } from '../../utils/journeyScenes'

// Crossfade overlap as a fraction of one scene's span. Kept under half a span
// so entering and exiting windows never collide.
const OVERLAP = SCENE_SPAN * 0.35

function BackdropLayer({ scene, index, scrollYProgress }) {
  const isFirst = index === 0
  const isLast = index === SCENE_COUNT - 1

  const start = index * SCENE_SPAN
  const end = (index + 1) * SCENE_SPAN
  const enterEnd = start + OVERLAP
  const exitStart = end - OVERLAP

  const range = isFirst
    ? [0, exitStart, end]
    : isLast
      ? [start, enterEnd, 1]
      : [start, enterEnd, exitStart, end]

  const opacity = useTransform(
    scrollYProgress,
    range,
    isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0]
  )
  const blurPx = useTransform(
    scrollYProgress,
    range,
    isFirst ? [0, 0, 10] : isLast ? [10, 0, 0] : [10, 0, 0, 10]
  )
  const filter = useTransform(blurPx, (b) => `blur(${b.toFixed(1)}px)`)

  // Slow zoom-out across the scene's own lifespan — the classic Ken Burns
  // settle — plus a faint vertical drift for depth.
  const scale = useTransform(scrollYProgress, [start, end], [1.08, 1.0])
  const y = useTransform(scrollYProgress, [start, end], [-18, 18])

  return (
    <motion.div className="absolute inset-0" style={{ opacity, zIndex: index }}>
      <motion.img
        src={scene.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ scale, y, filter }}
        loading={index <= 1 ? 'eager' : 'lazy'}
      />
    </motion.div>
  )
}

export default function JourneyBackdrop({ scrollYProgress }) {
  // Scenes are mounted (and their image fetched) only once they're within
  // one scene of becoming visible — a real network preload, not just CSS
  // opacity, since an absolutely-stacked `loading="lazy"` img is already
  // inside the viewport rect and would load immediately regardless.
  const [preloadUpTo, setPreloadUpTo] = useState(1)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const activeIndex = Math.min(SCENE_COUNT - 1, Math.max(0, Math.floor(latest / SCENE_SPAN)))
    const needed = Math.min(SCENE_COUNT - 1, activeIndex + 1)
    setPreloadUpTo((prev) => (needed > prev ? needed : prev))
  })

  return (
    <div className="absolute inset-0 z-0 bg-[#08090c]">
      {JOURNEY_SCENES.map((scene, index) =>
        index <= preloadUpTo ? (
          <BackdropLayer key={scene.id} scene={scene} index={index} scrollYProgress={scrollYProgress} />
        ) : null
      )}
    </div>
  )
}
