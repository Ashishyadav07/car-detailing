import React from 'react'
import { motion, useTransform } from 'framer-motion'
import { DEPTH_LAYERS } from '../../utils/aboutScenes'

// Three photographic depth planes drifting at different scroll speeds — the
// "camera dollies through a real bay" illusion that stands in for the fourth
// WebGL canvas we deliberately didn't build. Background is the slowest/most
// distant layer, foreground the fastest/closest, exactly like real parallax.
export default function AboutParallax({ scrollYProgress }) {
  // Gentle continuous push the whole scene forward (camera push), each layer
  // scaling at a different rate so the depth separation reads even at rest.
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14])
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -40])

  const midScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.08])
  const midY = useTransform(scrollYProgress, [0, 1], [0, -90])

  const fgScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.22])
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -170])
  // Foreground bokeh breathes in and out of frame rather than sitting static.
  const fgOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.45, 0.55, 0.9, 1],
    [0.55, 0.4, 0.55, 0.55, 0.4, 0.55]
  )

  // Depth-of-field: background softens slightly once the story is underway
  // (attention pulled to the checkpoints), foreground bokeh stays soft always
  // but deepens a touch at the same moments for a synchronized rack-focus feel.
  const bgBlurPx = useTransform(scrollYProgress, [0, 0.12, 0.5, 0.92, 1], [0, 0, 2.2, 2.2, 0])
  const bgFilter = useTransform(bgBlurPx, (b) => `blur(${b.toFixed(1)}px) brightness(0.9)`)
  const fgBlurPx = useTransform(scrollYProgress, [0, 0.12, 0.5, 0.92, 1], [3, 3, 6, 6, 3])
  const fgFilter = useTransform(fgBlurPx, (b) => `blur(${b.toFixed(1)}px)`)

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#050608]">
      <motion.img
        src={DEPTH_LAYERS.background}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ scale: bgScale, y: bgY, filter: bgFilter }}
        loading="eager"
      />
      <motion.img
        src={DEPTH_LAYERS.midground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ scale: midScale, y: midY }}
        loading="eager"
      />
      <motion.img
        src={DEPTH_LAYERS.foreground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
        style={{ scale: fgScale, y: fgY, opacity: fgOpacity, filter: fgFilter }}
        loading="lazy"
      />

      {/* Cinematic vignette + base tone, ties the photography to the frame */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_45%,rgba(5,6,8,0.75)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/70" />
    </div>
  )
}
