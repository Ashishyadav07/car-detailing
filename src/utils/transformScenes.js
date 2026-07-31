// Scene data for Act 3 — "The Transformation". Three before/after pairs,
// each its own scroll-scrubbed reveal with a distinct wipe geometry, plus a
// synced richness ramp on the "after" layer so the reveal keeps deepening
// after the boundary passes rather than snapping to a finished state.

export const INTRO_RANGE = [0.0, 0.08]
export const OUTRO_RANGE = [0.92, 1.0]

export const PAIRS = [
  {
    id: 'panel',
    wipe: 'diagonal',
    before: '/images/transform/panel-before.jpg',
    after: '/images/transform/panel-after.jpg',
    range: [0.08, 0.36],
    eyebrow: '01 — CORRECTION',
    headline: 'Swirl Marks, Erased',
    caption: 'Depth returns to the paint, pass by pass.',
    bead: false,
  },
  {
    id: 'macro',
    wipe: 'radial',
    before: '/images/transform/macro-before.jpg',
    after: '/images/transform/macro-after.jpg',
    range: [0.36, 0.64],
    eyebrow: '02 — PROTECTION',
    headline: 'The Shield Forms',
    caption: 'Water beads, holds, and rolls away clean.',
    bead: true,
  },
  {
    id: 'wheel',
    wipe: 'horizontal',
    before: '/images/transform/wheel-before.jpg',
    after: '/images/transform/wheel-after.jpg',
    range: [0.64, 0.92],
    eyebrow: '03 — FINISH',
    headline: 'Chrome, Sharpened',
    caption: 'Every reflection, restored to its edge.',
    bead: false,
  },
]

export function isIntro(p) {
  return p < INTRO_RANGE[1]
}

export function isOutro(p) {
  return p >= OUTRO_RANGE[0]
}

export function pairIndexForProgress(p) {
  for (let i = 0; i < PAIRS.length; i++) {
    if (p < PAIRS[i].range[1] || i === PAIRS.length - 1) return i
  }
  return PAIRS.length - 1
}
