import React from 'react'
import { motion, useTransform } from 'framer-motion'

// The epilogue shot: one still, one slow Ken Burns settle — no scene
// sequence, because this beat is a resolution, not another chapter.
export default function ContactBackdrop({ scrollYProgress }) {
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.0])
  const y = useTransform(scrollYProgress, [0, 1], [-16, 16])

  return (
    <div className="absolute inset-0 z-0 bg-[#08090c]">
      <motion.img
        src="/images/contact/bay-bluehour.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ scale, y }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/40 to-[#08090c]/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08090c]/70 via-transparent to-[#08090c]/30" />
    </div>
  )
}
