// Scene data for Act 4 — "The Studio Standard". Progress (0..1) is scroll
// position across the section's own sticky scroll range. Four checkpoints,
// each pairing a macro detail shot with a spec-plate stat and its own reveal
// style, bookended by an intro and outro beat.

export const DEPTH_LAYERS = {
  background: '/images/about/background.jpg',
  midground: '/images/about/car-silhouette.jpg',
  foreground: '/images/about/foreground-bokeh.jpg',
}

export const INTRO_RANGE = [0.0, 0.12]
export const OUTRO_RANGE = [0.92, 1.0]

export const CHECKPOINTS = [
  {
    id: 'ppf',
    range: [0.12, 0.32],
    reveal: 'iris',
    image: '/images/about/macro-ppf.jpg',
    eyebrow: '01 — PRECISION',
    headline: 'Zero-Contact Precision',
    caption: 'Computer-plotted cut lines. The blade never meets your paint.',
    stat: { value: '100%', label: 'PRECISION GUARANTEE' },
    origin: { x: 32, y: 46 },
  },
  {
    id: 'ir',
    range: [0.32, 0.52],
    reveal: 'diagonal',
    image: '/images/about/macro-ir.jpg',
    eyebrow: '02 — CURING',
    headline: 'Infrared Cure',
    caption: 'Short-wave heat locks nano-ceramic into a 9H shell.',
    stat: { value: '9H+', label: 'CERAMIC HARDNESS' },
    origin: { x: 68, y: 40 },
  },
  {
    id: 'ceramic',
    range: [0.52, 0.72],
    reveal: 'slit',
    image: '/images/about/macro-ceramic.jpg',
    eyebrow: '03 — PROTECTION',
    headline: 'Nano-Ceramic Shield',
    caption: 'Fifteen years of craft, sealed into every panel.',
    stat: { value: '15+', label: 'YEARS OF MASTERY' },
    origin: { x: 50, y: 50 },
  },
  {
    id: 'plaque',
    range: [0.72, 0.92],
    reveal: 'horizontal',
    image: '/images/about/macro-plaque.jpg',
    eyebrow: '04 — TRUST',
    headline: 'Fully Insured Studio',
    caption: 'Trusted with over a thousand bespoke commissions.',
    stat: { value: '1,200+', label: 'SUPERCARS COMMISSIONED' },
    origin: { x: 40, y: 55 },
  },
]

export function checkpointIndexForProgress(p) {
  for (let i = 0; i < CHECKPOINTS.length; i++) {
    if (p < CHECKPOINTS[i].range[1] || i === CHECKPOINTS.length - 1) return i
  }
  return CHECKPOINTS.length - 1
}

export function isIntro(p) {
  return p < INTRO_RANGE[1]
}

export function isOutro(p) {
  return p >= OUTRO_RANGE[0]
}

// Transition flare window: the last 12% of a checkpoint's span, shared by the
// light-sweep and lens-flare connective effects that play between checkpoints.
export function transitionWindowFor(checkpoint) {
  const [start, end] = checkpoint.range
  const span = end - start
  return [end - span * 0.12, end]
}
