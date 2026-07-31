import React from 'react'
import { BEATS } from '../../utils/craftScenes'
import CraftOrbitalReveal from './CraftOrbitalReveal'
import CraftSweepReveal from './CraftSweepReveal'
import CraftSteamReveal from './CraftSteamReveal'
import CraftFoamReveal from './CraftFoamReveal'

const REVEALERS = {
  orbital: CraftOrbitalReveal,
  sweep: CraftSweepReveal,
  steam: CraftSteamReveal,
  foam: CraftFoamReveal,
}

// Five full-bleed process photographs stacked in scroll order. Each beat
// after the first arrives through a reveal motivated by its own action
// (a buffer pad, a raking lamp, steam, foam) rather than a plain crossfade —
// once a layer finishes revealing it simply stays on top for the rest of
// the section, since later beats stack over it in turn.
export default function CraftReel({ scrollYProgress }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#050608]">
      <img src={BEATS[0].image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      {BEATS.slice(1).map((beat, i) => {
        const Reveal = REVEALERS[beat.transitionIn.style]
        return (
          <Reveal
            key={beat.id}
            scrollYProgress={scrollYProgress}
            range={beat.transitionIn.range}
            image={beat.image}
            zIndex={(i + 1) * 10}
          />
        )
      })}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_45%,rgba(5,6,8,0.7)_100%)]" style={{ zIndex: 45 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/60" style={{ zIndex: 45 }} />
    </div>
  )
}
