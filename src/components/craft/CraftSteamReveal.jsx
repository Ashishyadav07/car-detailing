import React, { useMemo } from 'react'
import { motion, useTransform } from 'framer-motion'

// The steam cleaner's reveal: soft drifting mist billows up to fully
// obscure the frame, then clears to expose the next shot underneath — a
// veil, not a wipe, matching how the previous beat's steam actually behaves.
export default function CraftSteamReveal({ scrollYProgress, range, image, zIndex }) {
  const [start, end] = range
  const mid = (start + end) / 2

  const imageOpacity = useTransform(scrollYProgress, [start, mid, end], [0, 0, 1])
  const veilOpacity = useTransform(scrollYProgress, [start, mid, end], [0, 1, 0])
  const veilScale = useTransform(scrollYProgress, [start, end], [0.9, 1.3])

  const blobs = useMemo(
    () => [
      { left: 20, top: 30, size: 55, duration: 7, delay: 0 },
      { left: 55, top: 45, size: 65, duration: 8.5, delay: 0.6 },
      { left: 75, top: 25, size: 50, duration: 6.5, delay: 1.2 },
      { left: 40, top: 60, size: 60, duration: 9, delay: 0.3 },
    ],
    []
  )

  return (
    <>
      <motion.div className="absolute inset-0" style={{ zIndex, opacity: imageOpacity }}>
        <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
      </motion.div>
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: zIndex + 1, opacity: veilOpacity, scale: veilScale }}
      >
        {blobs.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-slate-100 blur-3xl"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.size}%`, height: `${b.size}%`, opacity: 0.7 }}
            animate={{ x: [0, 18, -10, 0], y: [0, -12, 8, 0] }}
            transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </>
  )
}
