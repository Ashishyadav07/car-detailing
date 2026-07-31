// Numerically verifies the hero camera path: keyframe fidelity, C0/C1
// continuity, and that no segment overshoots into an unreasonable pose.
import { evalPose, createPose, KEYFRAMES } from './src/utils/heroCameraPath.js'
import { CriticallyDampedSpring } from './src/utils/animation.js'

const out = createPose()
const sample = (p) => {
  evalPose(p, out)
  return { x: out.pos.x, y: out.pos.y, z: out.pos.z, tx: out.target.x, ty: out.target.y, tz: out.target.z, r: out.rotY, stage: out.stage }
}

let fail = 0
const check = (label, ok, detail = '') => {
  if (!ok) { fail++; console.log(`  FAIL ${label} ${detail}`) }
}

// 1. Every keyframe pose is hit exactly at its scroll position.
console.log('1. keyframe fidelity')
for (const k of KEYFRAMES) {
  const s = sample(k.p)
  const dp = Math.hypot(s.x - k.pos.x, s.y - k.pos.y, s.z - k.pos.z)
  const dt = Math.hypot(s.tx - k.target.x, s.ty - k.target.y, s.tz - k.target.z)
  const dr = Math.abs(s.r - k.rotY)
  check(`p=${k.p} pos`, dp < 1e-9, `err=${dp}`)
  check(`p=${k.p} target`, dt < 1e-9, `err=${dt}`)
  check(`p=${k.p} rotY`, dr < 1e-9, `err=${dr}`)
}
console.log(`   ${KEYFRAMES.length} keyframes reproduced exactly`)

// 2. C0 + C1 continuity: dense finite-difference scan of position and rotation.
console.log('2. continuity scan (10000 samples)')
const N = 10000
const h = 1 / N
let maxJump = 0, maxJumpAt = 0
let maxAccel = 0, maxAccelAt = 0
let prev = sample(0)
let prevVel = null
for (let i = 1; i <= N; i++) {
  const p = i * h
  const cur = sample(p)
  const vel = {
    x: (cur.x - prev.x) / h, y: (cur.y - prev.y) / h, z: (cur.z - prev.z) / h, r: (cur.r - prev.r) / h,
  }
  const jump = Math.hypot(cur.x - prev.x, cur.y - prev.y, cur.z - prev.z)
  if (jump > maxJump) { maxJump = jump; maxJumpAt = p }
  if (prevVel) {
    const acc = Math.hypot(vel.x - prevVel.x, vel.y - prevVel.y, vel.z - prevVel.z) / h
    if (acc > maxAccel) { maxAccel = acc; maxAccelAt = p }
  }
  prevVel = vel
  prev = cur
}
// A C1 curve has bounded acceleration; a corner would show a spike orders of
// magnitude above the smooth maximum.
console.log(`   max per-sample position step : ${maxJump.toExponential(3)} units (at p=${maxJumpAt.toFixed(4)})`)
console.log(`   max |d2pos/dp2|              : ${maxAccel.toFixed(1)} (at p=${maxAccelAt.toFixed(4)})`)
check('no positional discontinuity', maxJump < 0.01, `${maxJump}`)
check('bounded acceleration (C1)', maxAccel < 2000, `${maxAccel}`)

// 3. Velocity at each keyframe: story beats should rest, the via point should not.
console.log('3. keyframe velocities (hold beats rest, via flows through)')
for (const k of KEYFRAMES) {
  if (k.p <= 0 || k.p >= 1) continue
  const a = sample(k.p - 1e-4), b = sample(k.p + 1e-4)
  const speed = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / 2e-4
  const expected = k.hold ? 'rest' : 'flow'
  const actual = speed < 1.0 ? 'rest' : 'flow'
  console.log(`   p=${k.p} ${k.name.padEnd(14)} |v|=${speed.toFixed(3).padStart(8)}  ${expected} -> ${actual}`)
  check(`p=${k.p} ${expected}`, expected === actual, `speed=${speed}`)
}

// 4. Overshoot sanity: the via point may bow the curve slightly, but the whole
//    path must stay inside the bounding box of the keyframes plus a margin.
console.log('4. path stays near the keyframe envelope')
const bb = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
for (const k of KEYFRAMES) {
  bb.min[0] = Math.min(bb.min[0], k.pos.x); bb.max[0] = Math.max(bb.max[0], k.pos.x)
  bb.min[1] = Math.min(bb.min[1], k.pos.y); bb.max[1] = Math.max(bb.max[1], k.pos.y)
  bb.min[2] = Math.min(bb.min[2], k.pos.z); bb.max[2] = Math.max(bb.max[2], k.pos.z)
}
let worst = 0
for (let i = 0; i <= N; i++) {
  const s = sample(i * h)
  const v = [s.x, s.y, s.z]
  for (let a = 0; a < 3; a++) worst = Math.max(worst, bb.min[a] - v[a], v[a] - bb.max[a])
}
console.log(`   max excursion outside keyframe bounds: ${worst.toFixed(4)} units`)
check('overshoot is small', worst < 0.25, `${worst}`)

// 5. Rotation never takes the long way round between keyframes.
console.log('5. rotation shortest path')
let maxSeg = 0
for (let i = 1; i < KEYFRAMES.length; i++) {
  const d = Math.abs(KEYFRAMES[i].rotY - KEYFRAMES[i - 1].rotY)
  maxSeg = Math.max(maxSeg, d)
}
console.log(`   largest unwrapped inter-keyframe rotation: ${maxSeg.toFixed(4)} rad (limit ${Math.PI.toFixed(4)})`)
check('all segments <= PI', maxSeg <= Math.PI + 1e-9, `${maxSeg}`)

// 6. Frame-rate independence of the scroll follower: the same 1s of simulated
//    time at 30/60/144 Hz must land on the same value.
console.log('6. frame-rate independence of the scroll spring')
const simulate = (fps) => {
  const s = new CriticallyDampedSpring(0)
  const dt = 1 / fps
  for (let t = 0; t < 1 - 1e-9; t += dt) s.step(1, 12, dt)
  return s.value
}
const [a30, a60, a144] = [simulate(30), simulate(60), simulate(144)]
console.log(`   30Hz=${a30.toFixed(8)}  60Hz=${a60.toFixed(8)}  144Hz=${a144.toFixed(8)}`)
check('30 vs 144 Hz agree', Math.abs(a30 - a144) < 1e-6, `${Math.abs(a30 - a144)}`)

// 7. Spring stability on a pathological frame time.
const spike = new CriticallyDampedSpring(0)
spike.velocity = 50
spike.step(1, 12, 5.0)
console.log(`7. after a 5s frame with v=50: value=${spike.value.toFixed(6)} vel=${spike.velocity.toFixed(6)}`)
check('stable on huge dt', Number.isFinite(spike.value) && Math.abs(spike.value - 1) < 1e-6, `${spike.value}`)

console.log(fail === 0 ? '\nALL CHECKS PASSED' : `\n${fail} CHECK(S) FAILED`)
process.exit(fail === 0 ? 0 : 1)
