import React from 'react'
import { motion, useTransform } from 'framer-motion'
import { smootherstep, clamp01 } from '../../utils/animation'

// The final pass: a row of foam-sud-sized circles sweeps left to right at
// roughly constant size, like suds being pushed across the panel — a
// translating band rather than a growing bloom, so it reads distinctly from
// the polisher's orbital reveal even though both are circle-based.
const ROW = [
  { y: 18, r: 22, phase: 0 },
  { y: 38, r: 26, phase: 0.08 },
  { y: 55, r: 24, phase: -0.05 },
  { y: 72, r: 27, phase: 0.12 },
  { y: 90, r: 21, phase: -0.08 },
]

export default function CraftFoamReveal({ scrollYProgress, range, image, zIndex }) {
  const [start, end] = range
  const t = useTransform(scrollYProgress, [start, end], [0, 1])
  const eased = useTransform(t, (v) => smootherstep(clamp01(v)))
  const x = useTransform(eased, [0, 1], [-15, 115])

  const inputs = ROW.map(() => x)
  const maskImage = useTransform(inputs, (xs) =>
    ROW.map((c, i) => `radial-gradient(circle at ${xs[i] + c.phase * 40}% ${c.y}%, #fff 0%, #fff ${c.r}%, transparent ${c.r + 5}%)`).join(',')
  )

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex, maskImage, WebkitMaskImage: maskImage, maskComposite: 'add', WebkitMaskComposite: 'source-over' }}
    >
      <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
    </motion.div>
  )
}
