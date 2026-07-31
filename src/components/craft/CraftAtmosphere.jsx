import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const DUST_COUNT = 26

// Ambient dust drifting through the bay's light shafts — always present,
// independent of scroll, so the room never reads as a static photograph
// between beats. This is the "standing beside the detailer" texture.
export default function CraftAtmosphere() {
  const dust = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, (_, i) => ({
        id: i,
        left: (i * 39.3) % 100,
        top: 8 + ((i * 67.1) % 78),
        size: 1.5 + (i % 3) * 0.9,
        duration: 9 + (i % 6) * 2.2,
        delay: (i % 8) * 0.65,
        drift: 14 + (i % 5) * 7,
      })),
    []
  )

  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
      {dust.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-blue-50/70 blur-[0.5px]"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -d.drift, 0], x: [0, d.id % 2 ? 6 : -6, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
