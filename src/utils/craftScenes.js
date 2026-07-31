// Scene data for Act 2 — "The Craft". A full-bleed process reel: five beats,
// each its own photograph, connected by transitions motivated by the action
// in the shot rather than a generic crossfade. Progress (0..1) is scroll
// position across the section's own sticky scroll range.

export const BEATS = [
  {
    id: 'wash',
    image: '/images/craft/wash-foam.jpg',
    dwell: [0.0, 0.16],
    eyebrow: '01 — ARRIVAL',
    headline: 'The First Pass',
    caption: 'Every commission starts the same way: a clean slate.',
  },
  {
    id: 'polish',
    image: '/images/craft/polish-machine.jpg',
    dwell: [0.24, 0.38],
    transitionIn: { style: 'orbital', range: [0.16, 0.24] },
    eyebrow: '02 — CORRECTION',
    headline: 'Swirl-Free, By Hand',
    caption: 'The pad finds what light reveals. Nothing is rushed.',
  },
  {
    id: 'inspection',
    image: '/images/craft/inspection-light.jpg',
    dwell: [0.46, 0.60],
    transitionIn: { style: 'sweep', range: [0.38, 0.46] },
    eyebrow: '03 — INSPECTION',
    headline: 'Nothing Escapes the Light',
    caption: 'A raking lamp exposes what the eye alone would miss.',
  },
  {
    id: 'steam',
    image: '/images/craft/steam-detail.jpg',
    dwell: [0.68, 0.82],
    transitionIn: { style: 'steam', range: [0.60, 0.68] },
    eyebrow: '04 — DETAIL',
    headline: 'Every Seam, Considered',
    caption: 'Steam lifts what a cloth alone could never reach.',
  },
  {
    id: 'ceramic',
    image: '/images/craft/ceramic-apply.jpg',
    dwell: [0.9, 1.0],
    transitionIn: { style: 'foam', range: [0.82, 0.9] },
    eyebrow: '05 — PROTECTION',
    headline: 'Sealed By Hand',
    caption: 'The final pass. A shield, applied one panel at a time.',
  },
]

export function beatIndexForProgress(p) {
  for (let i = BEATS.length - 1; i >= 0; i--) {
    const gateStart = BEATS[i].transitionIn ? BEATS[i].transitionIn.range[0] : BEATS[i].dwell[0]
    if (p >= gateStart) return i
  }
  return 0
}
