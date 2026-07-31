import React, { useMemo } from 'react'
import { motion, useTransform } from 'framer-motion'
import { smootherstep, clamp01 } from '../../utils/animation'

const BEAD_COUNT = 14

// One before/after pair. A soft-edged reveal (never a hard geometric mask —
// that's Act 4's language) sweeps across, carrying a light seam, while the
// "after" layer's own saturation/brightness keep climbing past the point the
// mask reveals it — the transformation keeps deepening, it doesn't just
// switch on.
export default function TransformPair({ pair, scrollYProgress, active, holdAtEnd = false }) {
  const [start, end] = pair.range
  const span = end - start
  const fade = span * 0.1

  const localT = useTransform(scrollYProgress, [start, start + span * 0.7], [0, 1])
  const eased = useTransform(localT, (v) => smootherstep(clamp01(v)))

  const opacityHeld = useTransform(scrollYProgress, [start, start + fade, end], [0, 1, 1])
  const opacityFading = useTransform(scrollYProgress, [start, start + fade, end - fade, end], [0, 1, 1, 0])
  const opacity = holdAtEnd ? opacityHeld : opacityFading

  // Richness ramp: keeps climbing across the whole pair span, not just the
  // reveal portion, so the "after" state keeps feeling alive after the wipe passes.
  const fullT = useTransform(scrollYProgress, [start, end], [0, 1])
  const saturate = useTransform(fullT, [0, 1], [0.9, 1.18])
  const brightness = useTransform(fullT, [0, 1], [0.94, 1.1])
  const afterFilter = useTransform([saturate, brightness], ([s, b]) => `saturate(${s}) brightness(${b})`)

  // All three wipe geometries are computed unconditionally (hooks can't be
  // called conditionally) and the right one is picked below by value.
  const linearP = useTransform(eased, [0, 1], [-15, 115])
  const radialP = useTransform(eased, [0, 1], [0, 78])

  const diagonalMask = useTransform(linearP, (v) => `linear-gradient(105deg, transparent ${v - 14}%, white ${v}%, white 100%)`)
  const horizontalMask = useTransform(linearP, (v) => `linear-gradient(180deg, transparent ${v - 14}%, white ${v}%, white 100%)`)
  const radialMask = useTransform(radialP, (v) => `radial-gradient(circle at 50% 50%, white 0%, white ${v}%, transparent ${v + 16}%)`)

  const diagonalSeamLeft = useTransform(linearP, (v) => `${v - 5}%`)
  const horizontalSeamTop = useTransform(linearP, (v) => `${v - 5}%`)

  const maskImage = pair.wipe === 'diagonal' ? diagonalMask : pair.wipe === 'horizontal' ? horizontalMask : radialMask

  const seamStyle =
    pair.wipe === 'diagonal'
      ? {
          left: diagonalSeamLeft,
          width: '5%',
          top: 0,
          bottom: 0,
          background:
            'linear-gradient(105deg, transparent, rgba(191,219,254,0.5) 45%, rgba(255,255,255,0.75) 50%, rgba(191,219,254,0.5) 55%, transparent)',
        }
      : pair.wipe === 'horizontal'
        ? {
            top: horizontalSeamTop,
            height: '5%',
            left: 0,
            right: 0,
            background:
              'linear-gradient(180deg, transparent, rgba(191,219,254,0.5) 45%, rgba(255,255,255,0.75) 50%, rgba(191,219,254,0.5) 55%, transparent)',
          }
        : null

  const beads = useMemo(
    () =>
      Array.from({ length: BEAD_COUNT }, (_, i) => ({
        id: i,
        left: 10 + ((i * 53.7) % 82),
        top: 10 + ((i * 31.1) % 80),
        size: 5 + (i % 4) * 3,
        delay: (i % 6) * 0.12,
      })),
    []
  )
  const beadReveal = useTransform(eased, [0.15, 0.9], [0, 1])

  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity, pointerEvents: active ? 'auto' : 'none' }}
    >
      <img src={pair.before} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <motion.div className="absolute inset-0" style={{ maskImage, WebkitMaskImage: maskImage }}>
        <motion.img
          src={pair.after}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: afterFilter }}
          loading="lazy"
        />
        {pair.bead && (
          <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: beadReveal }}>
            {beads.map((b) => (
              <motion.span
                key={b.id}
                className="absolute rounded-full bg-white/70 shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size * 1.15 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={active ? { scale: 1, opacity: 0.85, y: [0, 3, 6] } : {}}
                transition={{ duration: 1.6, delay: b.delay, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
      {seamStyle && <motion.div className="absolute pointer-events-none mix-blend-screen" style={seamStyle} />}
    </motion.div>
  )
}
