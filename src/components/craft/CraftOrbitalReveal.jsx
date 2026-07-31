import React from 'react'
import { motion, useTransform } from 'framer-motion'
import { smootherstep, clamp01 } from '../../utils/animation'

// The polisher's reveal: three overlapping circles grow and slowly orbit
// each other, exactly like a dual-action buffer working a panel in
// overlapping passes — the incoming shot appears wherever the "pad" has
// already worked, not as a flat wipe.
export default function CraftOrbitalReveal({ scrollYProgress, range, image, zIndex }) {
  const [start, end] = range
  const t = useTransform(scrollYProgress, [start, end], [0, 1])
  const eased = useTransform(t, (v) => smootherstep(clamp01(v)))
  const angle = useTransform(scrollYProgress, [start, end], [0, 4.2])

  const r = useTransform(eased, [0, 1], [0, 68])
  const cx1 = useTransform(angle, (a) => 30 + Math.cos(a) * 8)
  const cy1 = useTransform(angle, (a) => 40 + Math.sin(a) * 8)
  const cx2 = useTransform(angle, (a) => 62 + Math.cos(a + 2.1) * 8)
  const cy2 = useTransform(angle, (a) => 58 + Math.sin(a + 2.1) * 8)
  const cx3 = useTransform(angle, (a) => 48 + Math.cos(a + 4.2) * 9)
  const cy3 = useTransform(angle, (a) => 28 + Math.sin(a + 4.2) * 9)

  const maskImage = useTransform(
    [cx1, cy1, cx2, cy2, cx3, cy3, r],
    ([x1, y1, x2, y2, x3, y3, rad]) =>
      `radial-gradient(circle at ${x1}% ${y1}%, #fff 0%, #fff ${rad}%, transparent ${rad + 4}%),` +
      `radial-gradient(circle at ${x2}% ${y2}%, #fff 0%, #fff ${rad}%, transparent ${rad + 4}%),` +
      `radial-gradient(circle at ${x3}% ${y3}%, #fff 0%, #fff ${rad}%, transparent ${rad + 4}%)`
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
