import React from 'react'
import { motion, useTransform } from 'framer-motion'
import { smootherstep, clamp01 } from '../../utils/animation'

// The inspection lamp's reveal: a hard diagonal edge sweeps across carrying
// a bright raking-light bar exactly on its seam — the light itself is what
// exposes the next shot, echoing the lamp in the photograph.
export default function CraftSweepReveal({ scrollYProgress, range, image, zIndex }) {
  const [start, end] = range
  const t = useTransform(scrollYProgress, [start, end], [0, 1])
  const eased = useTransform(t, (v) => smootherstep(clamp01(v)))
  const lead = useTransform(eased, [0, 1], [-15, 115])

  const maskImage = useTransform(lead, (l) => `linear-gradient(100deg, #fff ${l - 18}%, #fff ${l}%, transparent ${l + 1}%)`)
  const barLeft = useTransform(lead, (l) => `${l - 6}%`)
  const barOpacity = useTransform(eased, [0, 0.08, 0.92, 1], [0, 1, 1, 0])

  return (
    <>
      <motion.div
        className="absolute inset-0"
        style={{ zIndex, maskImage, WebkitMaskImage: maskImage }}
      >
        <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
      </motion.div>
      <motion.div
        className="absolute inset-y-0 w-[6%] pointer-events-none mix-blend-screen"
        style={{
          zIndex: zIndex + 1,
          left: barLeft,
          opacity: barOpacity,
          background:
            'linear-gradient(100deg, transparent, rgba(255,244,214,0.9) 45%, rgba(255,255,255,0.95) 50%, rgba(255,244,214,0.9) 55%, transparent)',
          filter: 'blur(2px)',
        }}
      />
    </>
  )
}
