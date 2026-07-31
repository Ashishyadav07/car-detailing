// Before/after comparison of the keyframe interpolator.
// Reimplements the previous getScrollDrivenTransform exactly as it was, and
// measures both against the same dense scan.
import { evalPose, createPose } from './src/utils/heroCameraPath.js'
import { CAMERA_PRESETS } from './src/constants/configuratorOptions.js'

// ---- OLD implementation, verbatim ----------------------------------------
function oldTransform(p) {
  const preset34 = CAMERA_PRESETS.find((preset) => preset.id === 'hero-34') || CAMERA_PRESETS[0]
  const presetSide = CAMERA_PRESETS.find((preset) => preset.id === 'side') || CAMERA_PRESETS[1]
  const presetWheels = CAMERA_PRESETS.find((preset) => preset.id === 'wheels') || CAMERA_PRESETS[2]
  const presetFront = CAMERA_PRESETS.find((preset) => preset.id === 'front') || CAMERA_PRESETS[3]
  const S = {
    hero34: { rotY: preset34.targetYRotation, pos: preset34.position, target: preset34.target, name: '3/4 STUDIO' },
    side: { rotY: presetSide.targetYRotation, pos: presetSide.position, target: presetSide.target, name: 'SIDE PROFILE' },
    wheels: { rotY: presetWheels.targetYRotation, pos: presetWheels.position, target: presetWheels.target, name: 'RIMS & BRAKES' },
    pullback: { rotY: 1.10, pos: [1.8, 1.4, 4.5], target: [0.15, 0.58, 0.1], name: 'TRANSITION' },
    front: { rotY: presetFront.targetYRotation, pos: presetFront.position, target: presetFront.target, name: 'FRONT GRILLE' },
  }
  const keyframes = [
    { p: 0.00, ...S.hero34 }, { p: 0.22, ...S.side }, { p: 0.48, ...S.wheels },
    { p: 0.58, ...S.pullback }, { p: 0.70, ...S.front }, { p: 0.88, ...S.hero34 }, { p: 1.00, ...S.hero34 },
  ]
  const clampedP = Math.max(0, Math.min(1, p))
  let i = 0
  while (i < keyframes.length - 1 && keyframes[i + 1].p < clampedP) i++
  if (i >= keyframes.length - 1) {
    const last = keyframes[keyframes.length - 1]
    return { rotY: last.rotY, pos: [...last.pos], target: [...last.target], stageName: last.name }
  }
  const k1 = keyframes[i], k2 = keyframes[i + 1]
  const range = k2.p - k1.p
  const t = range > 0 ? (clampedP - k1.p) / range : 0
  const smoothT = t * t * (3 - 2 * t)
  let diff = (k2.rotY - k1.rotY) % (Math.PI * 2)
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += Math.PI * 2
  return {
    rotY: k1.rotY + diff * smoothT,
    pos: [k1.pos[0] + (k2.pos[0] - k1.pos[0]) * smoothT, k1.pos[1] + (k2.pos[1] - k1.pos[1]) * smoothT, k1.pos[2] + (k2.pos[2] - k1.pos[2]) * smoothT],
    target: [0, 0, 0],
    stageName: k1.name,
  }
}

const out = createPose()
const newSample = (p) => { evalPose(p, out); return [out.pos.x, out.pos.y, out.pos.z] }
const oldSample = (p) => oldTransform(p).pos

function scan(sample, label) {
  const N = 200000, h = 1 / N
  let maxAccel = 0, at = 0
  let prev = sample(0), prevVel = null
  const accelAtJoints = []
  for (let i = 1; i <= N; i++) {
    const p = i * h
    const cur = sample(p)
    const vel = [(cur[0] - prev[0]) / h, (cur[1] - prev[1]) / h, (cur[2] - prev[2]) / h]
    if (prevVel) {
      const a = Math.hypot(vel[0] - prevVel[0], vel[1] - prevVel[1], vel[2] - prevVel[2]) / h
      if (a > maxAccel) { maxAccel = a; at = p }
      accelAtJoints.push([p, a])
    }
    prevVel = vel; prev = cur
  }
  // Peak acceleration in a small window around each keyframe boundary.
  const joints = [0.22, 0.48, 0.58, 0.70, 0.88]
  const perJoint = joints.map((j) => {
    let m = 0
    for (const [p, a] of accelAtJoints) if (Math.abs(p - j) < 0.002 && a > m) m = a
    return m
  })
  console.log(`${label}`)
  console.log(`   peak |d2pos/dp2| overall : ${maxAccel.toFixed(0).padStart(6)} (at p=${at.toFixed(4)})`)
  joints.forEach((j, i) => console.log(`   joint p=${String(j).padEnd(5)} peak accel: ${perJoint[i].toFixed(0).padStart(6)}`))
  return { maxAccel, perJoint }
}

console.log('Acceleration spikes at keyframe joints (lower = less jerk = smoother)\n')
const o = scan(oldSample, 'OLD  smoothstep per segment')
console.log('')
const n = scan(newSample, 'NEW  smootherstep beats + Hermite via point')

console.log('\nJoint-by-joint change:')
;[0.22, 0.48, 0.58, 0.70, 0.88].forEach((j, i) => {
  const pct = o.perJoint[i] === 0 ? 0 : (1 - n.perJoint[i] / o.perJoint[i]) * 100
  console.log(`   p=${String(j).padEnd(5)}  ${o.perJoint[i].toFixed(0).padStart(6)} -> ${n.perJoint[i].toFixed(0).padStart(6)}   ${pct >= 0 ? '-' : '+'}${Math.abs(pct).toFixed(1)}%`)
})
console.log(`\n   overall peak ${o.maxAccel.toFixed(0)} -> ${n.maxAccel.toFixed(0)}  (${((1 - n.maxAccel / o.maxAccel) * 100).toFixed(1)}% lower)`)

// Speed through the TRANSITION via point.
const speedAt = (sample, p) => {
  const a = sample(p - 1e-5), b = sample(p + 1e-5)
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2e-5
}
console.log(`\nCamera speed at the p=0.58 TRANSITION via point:`)
console.log(`   OLD ${speedAt(oldSample, 0.58).toFixed(3)}  (dead stop)`)
console.log(`   NEW ${speedAt(newSample, 0.58).toFixed(3)}  (flows through)`)

// Allocation count per evaluation.
console.log('\nPer-frame allocations in the keyframe evaluation:')
console.log('   OLD  1 state object + 7 keyframe objects + 2 arrays + 1 result = 11+')
console.log('   NEW  0 (writes into a preallocated pose)')
