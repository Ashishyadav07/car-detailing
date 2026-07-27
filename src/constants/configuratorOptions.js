export const PAINT_OPTIONS = [
  {
    id: 'obsidian-black',
    name: 'Obsidian Black',
    color: '#0a0a0c',
    roughness: 0.15,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    description: 'Deep glossy metallic black with crystal flake highlights',
  },
  {
    id: 'pearl-white',
    name: 'Pearl White',
    color: '#f1f5f9',
    roughness: 0.12,
    metalness: 0.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    description: 'Triple-coat satin white with iridescent pearlescent sheen',
  },
  {
    id: 'racing-red',
    name: 'Apex Racing Red',
    color: '#b91c1c',
    roughness: 0.14,
    metalness: 0.75,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    description: 'High-octane metallic scarlet engineered for track presence',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Cobalt',
    color: '#1e3a8a',
    roughness: 0.12,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    description: 'Ultra-deep metallic blue with intense reflections',
  },
  {
    id: 'liquid-silver',
    name: 'Liquid Platinum',
    color: '#94a3b8',
    roughness: 0.10,
    metalness: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    description: 'Hyper-reflective polished metallic silver',
  },
  {
    id: 'emerald-green',
    name: 'British Emerald',
    color: '#064e3b',
    roughness: 0.15,
    metalness: 0.80,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    description: 'Rich dark metallic forest green with gold undertones',
  },
]

export const RIM_OPTIONS = [
  {
    id: 'silver-chrome',
    name: 'Chrome Silver',
    color: '#cbd5e1',
    roughness: 0.08,
    metalness: 0.95,
    description: 'Forged lightweight aluminum in brilliant mirror silver',
  },
  {
    id: 'satin-black',
    name: 'Satin Carbon Black',
    color: '#1e293b',
    roughness: 0.35,
    metalness: 0.75,
    description: 'Matte stealth finish with heat-resistant ceramic coating',
  },
  {
    id: 'gold-bronze',
    name: 'Monaco Gold Bronze',
    color: '#b45309',
    roughness: 0.22,
    metalness: 0.90,
    description: 'Anodized race bronze engineered for maximum contrast',
  },
]

export const TIRE_OPTIONS = [
  {
    id: 'performance-matte',
    name: 'Matte Sport Spec',
    color: '#111827',
    roughness: 0.85,
    metalness: 0.05,
    description: 'Track-ready high-friction compounds with aggressive tread',
  },
  {
    id: 'detail-wet',
    name: 'Wet Detail Gloss',
    color: '#0f172a',
    roughness: 0.25,
    metalness: 0.10,
    description: 'Showroom glossy tire dressing finish',
  },
]

export const BRAKE_OPTIONS = [
  {
    id: 'brembo-red',
    name: 'Brembo Red',
    color: '#dc2626',
    roughness: 0.2,
    metalness: 0.6,
    description: 'Iconic 6-piston high-performance red calipers',
  },
  {
    id: 'speed-yellow',
    name: 'Speed Yellow',
    color: '#eab308',
    roughness: 0.2,
    metalness: 0.6,
    description: 'Ceramic composite yellow caliper specification',
  },
  {
    id: 'stealth-black',
    name: 'Stealth Black',
    color: '#1f2937',
    roughness: 0.3,
    metalness: 0.8,
    description: 'Anodized dark grey ceramic calipers',
  },
  {
    id: 'acid-green',
    name: 'Acid Green',
    color: '#84cc16',
    roughness: 0.2,
    metalness: 0.6,
    description: 'Vibrant hybrid performance lime accent',
  },
]

export const INTERIOR_OPTIONS = [
  {
    id: 'black-leather',
    name: 'Nappa Black',
    color: '#18181b',
    roughness: 0.70,
    metalness: 0.10,
    description: 'Hand-stitched full-grain perforated Nappa leather',
  },
  {
    id: 'cognac-tan',
    name: 'Cognac Tan',
    color: '#92400e',
    roughness: 0.65,
    metalness: 0.05,
    description: 'Tuscan saddle tan leather with contrast stitching',
  },
  {
    id: 'crimson-red',
    name: 'Crimson Sport',
    color: '#881337',
    roughness: 0.60,
    metalness: 0.10,
    description: 'Race-inspired deep burgundy red leather interior',
  },
  {
    id: 'alcantara-grey',
    name: 'Alcantara Slate',
    color: '#374151',
    roughness: 0.90,
    metalness: 0.02,
    description: 'Ultra-suede motorsport interior package',
  },
]

// Central Feature Focus Presets with Exact Target Turntable Y-Rotations
export const CAMERA_PRESETS = [
  {
    id: 'hero-34',
    label: '3/4 Studio',
    position: [4.8, 1.8, 4.8],
    target: [0, 0.7, 0],
    targetYRotation: 0.65, // 37° 3/4 front view
  },
  {
    id: 'side',
    label: 'Side Profile',
    position: [0, 1.5, 5.8],
    target: [0, 0.6, 0],
    targetYRotation: 1.57, // 90° Side profile silhouette
  },
  {
    id: 'wheels',
    label: 'Rims & Brakes',
    position: [3.2, 1.2, 3.8],
    target: [0, 0.5, 0],
    targetYRotation: 2.25, // 129° Close-up angle showing rim & Brembo caliper
  },
  {
    id: 'front',
    label: 'Front Grille',
    position: [0, 1.5, 5.0],
    target: [0, 0.6, 0],
    targetYRotation: 0.0, // 0° Dead-center front grille view
  },
]
