import React, { useMemo } from 'react'
import { motion, useTransform } from 'framer-motion'

const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const RAY_COUNT = 4
const DUST_COUNT = 22

// Shared "the room is alive" layer: volumetric light shafts, floating dust,
// and a filmic grain pass — all ambient/looping, independent of scroll so the
// scene never feels static even when the user pauses mid-read.
export default function AboutAtmosphere({ scrollYProgress }) {
  const raysY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const haze = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.35, 0.55, 0.55, 0.35])

  const rays = useMemo(
    () =>
      Array.from({ length: RAY_COUNT }, (_, i) => ({
        id: i,
        left: 12 + i * 24,
        width: 10 + (i % 2) * 6,
        rotate: -8 + i * 3,
        delay: i * 1.3,
        duration: 9 + i * 1.5,
      })),
    []
  )

  const dust = useMemo(
    () =>
      Array.from({ length: DUST_COUNT }, (_, i) => ({
        id: i,
        left: (i * 43.7) % 100,
        top: 10 + ((i * 61.3) % 80),
        size: 1.5 + (i % 3) * 0.8,
        duration: 10 + (i % 6) * 2,
        delay: (i % 9) * 0.7,
        drift: 12 + (i % 5) * 6,
      })),
    []
  )

  return (
    <>
      {/* Volumetric light rays — soft conic shafts breathing independently of
          scroll, drifting slowly upward with the parallax so they read as
          part of the same physical room rather than a screen overlay. */}
      <motion.div className="absolute inset-0 z-15 pointer-events-none mix-blend-screen" style={{ y: raysY, opacity: haze }}>
        {rays.map((r) => (
          <div
            key={r.id}
            className="absolute top-[-10%] h-[130%] animate-[ambient-drift_11s_ease-in-out_infinite]"
            style={{
              left: `${r.left}%`,
              width: `${r.width}%`,
              transform: `rotate(${r.rotate}deg)`,
              animationDelay: `${r.delay}s`,
              animationDuration: `${r.duration}s`,
              background:
                'linear-gradient(to bottom, rgba(147,197,253,0.16), rgba(99,179,237,0.05) 45%, transparent 80%)',
              filter: 'blur(18px)',
            }}
          />
        ))}
      </motion.div>

      {/* Floating dust — tiny compositor-only drifting specks. */}
      <div className="absolute inset-0 z-16 pointer-events-none overflow-hidden">
        {dust.map((d) => (
          <motion.span
            key={d.id}
            className="absolute rounded-full bg-blue-100/60 blur-[0.5px]"
            style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }}
            animate={{ y: [0, -d.drift, 0], opacity: [0, 0.55, 0] }}
            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Filmic grain — jittered in whole steps, GPU-only, never repaints. */}
      <div
        className="absolute inset-0 z-40 pointer-events-none opacity-[0.05] mix-blend-overlay animate-[film-grain_0.45s_steps(8)_infinite]"
        style={{ backgroundImage: GRAIN_URL, backgroundSize: '140px 140px' }}
      />
    </>
  )
}
