// Scene data for the post-hero cinematic environment journey. Each scene maps
// to an equal 1/5th slice of the section's scroll progress (0..1).

export const JOURNEY_SCENES = [
  {
    id: 'showroom',
    image: '/images/journey/scene-1-showroom.jpg',
    eyebrow: '01 — ARRIVAL',
    title: 'Precision Detailing',
    caption: 'Every journey begins in the bay.',
  },
  {
    id: 'paintbay',
    image: '/images/journey/scene-2-paintbay.jpg',
    eyebrow: '02 — CORRECTION',
    title: 'Paint Correction',
    caption: 'Swirls erased, clarity restored.',
  },
  {
    id: 'ceramic',
    image: '/images/journey/scene-3-ceramic.jpg',
    eyebrow: '03 — PROTECTION',
    title: 'Ceramic Protection',
    caption: 'A shield that outlasts the elements.',
  },
  {
    id: 'showroom2',
    image: '/images/journey/scene-4-showroom2.jpg',
    eyebrow: '04 — FINISH',
    title: 'Mirror Finish',
    caption: 'Depth you can fall into.',
  },
  {
    id: 'reveal',
    image: '/images/journey/scene-5-reveal.jpg',
    eyebrow: '05 — REVEAL',
    title: 'Drive Like New',
    caption: 'The unveiling.',
  },
]

export const SCENE_COUNT = JOURNEY_SCENES.length
export const SCENE_SPAN = 1 / SCENE_COUNT
