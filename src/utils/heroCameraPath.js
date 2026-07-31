// The hero's scroll story: the same keyframe poses at the same scroll
// positions the sequence has always used, precomputed once at module load.
//
// The frame loop calls `evalPose(p, out)` and nothing else — no searching, no
// table rebuilding and no allocation happens per frame.

import * as THREE from 'three'
import { CAMERA_PRESETS } from '../constants/configuratorOptions'
import { clamp01, shortestAngle, smootherstep } from './animation'

function preset(id, fallbackIndex) {
  return CAMERA_PRESETS.find((p) => p.id === id) || CAMERA_PRESETS[fallbackIndex]
}

const P_34 = preset('hero-34', 0)
const P_SIDE = preset('side', 1)
const P_WHEELS = preset('wheels', 2)
const P_FRONT = preset('front', 3)

// `hold: true`  -> a story beat the camera settles into (eases to a stop).
// `hold: false` -> a pass-through via point the camera flows through without
//                  stopping. Only the pullback is a via point: it is named
//                  TRANSITION, and coming to a dead stop there is exactly what
//                  made the wheels -> front move read as robotic.
const RAW_KEYFRAMES = [
  { p: 0.00, rotY: P_34.targetYRotation,     pos: P_34.position,       target: P_34.target,       name: '3/4 STUDIO',    hold: true },
  { p: 0.22, rotY: P_SIDE.targetYRotation,   pos: P_SIDE.position,     target: P_SIDE.target,     name: 'SIDE PROFILE',  hold: true },
  { p: 0.48, rotY: P_WHEELS.targetYRotation, pos: P_WHEELS.position,   target: P_WHEELS.target,   name: 'RIMS & BRAKES', hold: true },
  { p: 0.58, rotY: 1.10,                     pos: [1.8, 1.4, 4.5],     target: [0.15, 0.58, 0.1], name: 'TRANSITION',    hold: false },
  { p: 0.70, rotY: P_FRONT.targetYRotation,  pos: P_FRONT.position,    target: P_FRONT.target,    name: 'FRONT GRILLE',  hold: true },
  { p: 0.88, rotY: P_34.targetYRotation,     pos: P_34.position,       target: P_34.target,       name: '3/4 STUDIO',    hold: true },
  { p: 1.00, rotY: P_34.targetYRotation,     pos: P_34.position,       target: P_34.target,       name: '3/4 STUDIO',    hold: true },
]

const KEYFRAMES = RAW_KEYFRAMES.map((k) => ({
  p: k.p,
  name: k.name,
  hold: k.hold,
  pos: new THREE.Vector3(k.pos[0], k.pos[1], k.pos[2]),
  target: new THREE.Vector3(k.target[0], k.target[1], k.target[2]),
  rotY: 0, // unwrapped below
}))

// Unwrap the turntable angles once into a continuous chain. Every segment then
// travels the shortest way round by construction, and tangents that reach
// across a keyframe stay meaningful instead of wrapping mid-curve.
KEYFRAMES[0].rotY = RAW_KEYFRAMES[0].rotY
for (let i = 1; i < KEYFRAMES.length; i++) {
  KEYFRAMES[i].rotY =
    KEYFRAMES[i - 1].rotY + shortestAngle(KEYFRAMES[i - 1].rotY, RAW_KEYFRAMES[i].rotY)
}

// Catmull-Rom tangents at via points, zero tangents at story beats. A Hermite
// segment with a zero tangent at both ends is identical to the original
// smoothstep, so every settled beat keeps precisely the path it had.
const POS_TANGENTS = []
const TARGET_TANGENTS = []
const ROT_TANGENTS = []
for (let i = 0; i < KEYFRAMES.length; i++) {
  const posT = new THREE.Vector3()
  const tgtT = new THREE.Vector3()
  let rotT = 0
  if (!KEYFRAMES[i].hold && i > 0 && i < KEYFRAMES.length - 1) {
    const span = KEYFRAMES[i + 1].p - KEYFRAMES[i - 1].p
    posT.subVectors(KEYFRAMES[i + 1].pos, KEYFRAMES[i - 1].pos).divideScalar(span)
    tgtT.subVectors(KEYFRAMES[i + 1].target, KEYFRAMES[i - 1].target).divideScalar(span)
    rotT = (KEYFRAMES[i + 1].rotY - KEYFRAMES[i - 1].rotY) / span
  }
  POS_TANGENTS.push(posT)
  TARGET_TANGENTS.push(tgtT)
  ROT_TANGENTS.push(rotT)
}

// Segment interpolation modes.
const MODE_EASE = 0 // hold -> hold : quintic smootherstep
const MODE_HOLD_START = 1 // hold -> via  : quintic, pinned at the start
const MODE_HOLD_END = 2 // via  -> hold : quintic, pinned at the end
const MODE_HERMITE = 3 // via  -> via  : plain cubic Hermite

// A resting beat leaves with zero velocity *and* zero acceleration (that is
// what smootherstep gives us), so a segment adjoining one has to enter the
// same way or there is an acceleration step at the join — a small but real
// jerk exactly where the eye is most sensitive to it: the instant the camera
// starts moving again.
//
// So the via-adjoining segments are quintics pinned at both ends:
//
//   hold end : x = p_hold,  x' = 0,  x'' = 0
//   via end  : x = p_via,   x' = m,  x'' = 0
//
// Zero acceleration at the via as well means the two segments meeting there
// also agree to second order, which makes the whole path C2 — there is no
// acceleration step left anywhere in the sequence. Both ends still land on
// their keyframe exactly and still honour the via point's Catmull-Rom
// tangent, so the poses and the story are untouched.
//
// Solving x(w) = p_hold + a3*w^3 + a4*w^4 + a5*w^5, with w running 0 -> 1 from
// the hold end to the via end, against those six constraints gives:
function quinticHoldCoeffs(d, m) {
  return [10 * d - 4 * m, 7 * m - 15 * d, 6 * d - 3 * m]
}

function quinticHoldCoeffsVec3(base, other, tangent, holdAtStart) {
  const c3 = new THREE.Vector3()
  const c4 = new THREE.Vector3()
  const c5 = new THREE.Vector3()
  for (const axis of ['x', 'y', 'z']) {
    // Displacement always points hold -> via. The mirrored case only flips the
    // tangent, because w = 1 - t reverses the direction of differentiation.
    const d = other[axis] - base[axis]
    const m = holdAtStart ? tangent[axis] : -tangent[axis]
    const [a3, a4, a5] = quinticHoldCoeffs(d, m)
    c3[axis] = a3
    c4[axis] = a4
    c5[axis] = a5
  }
  return { c3, c4, c5 }
}

const SEGMENTS = []
for (let i = 0; i < KEYFRAMES.length - 1; i++) {
  const a = KEYFRAMES[i]
  const b = KEYFRAMES[i + 1]
  const range = b.p - a.p

  let mode
  if (a.hold && b.hold) mode = MODE_EASE
  else if (a.hold) mode = MODE_HOLD_START
  else if (b.hold) mode = MODE_HOLD_END
  else mode = MODE_HERMITE

  const posM0 = POS_TANGENTS[i].clone().multiplyScalar(range)
  const posM1 = POS_TANGENTS[i + 1].clone().multiplyScalar(range)
  const tgtM0 = TARGET_TANGENTS[i].clone().multiplyScalar(range)
  const tgtM1 = TARGET_TANGENTS[i + 1].clone().multiplyScalar(range)
  const rotM0 = ROT_TANGENTS[i] * range
  const rotM1 = ROT_TANGENTS[i + 1] * range

  const seg = {
    p0: a.p,
    p1: b.p,
    invRange: range > 0 ? 1 / range : 0,
    name: a.name,
    mode,
    pos0: a.pos,
    pos1: b.pos,
    tgt0: a.target,
    tgt1: b.target,
    rot0: a.rotY,
    rot1: b.rotY,
    posM0,
    posM1,
    tgtM0,
    tgtM1,
    rotM0,
    rotM1,
  }

  if (mode === MODE_HOLD_START || mode === MODE_HOLD_END) {
    const holdAtStart = mode === MODE_HOLD_START
    // `base` is the hold end (the polynomial is written about it).
    const posBase = holdAtStart ? a.pos : b.pos
    const posOther = holdAtStart ? b.pos : a.pos
    const tgtBase = holdAtStart ? a.target : b.target
    const tgtOther = holdAtStart ? b.target : a.target
    const rotBase = holdAtStart ? a.rotY : b.rotY
    const rotOther = holdAtStart ? b.rotY : a.rotY
    const posTan = holdAtStart ? posM1 : posM0
    const tgtTan = holdAtStart ? tgtM1 : tgtM0
    const rotTan = holdAtStart ? rotM1 : rotM0

    seg.posBase = posBase
    seg.tgtBase = tgtBase
    seg.rotBase = rotBase

    const pc = quinticHoldCoeffsVec3(posBase, posOther, posTan, holdAtStart)
    const tc = quinticHoldCoeffsVec3(tgtBase, tgtOther, tgtTan, holdAtStart)
    seg.posC3 = pc.c3
    seg.posC4 = pc.c4
    seg.posC5 = pc.c5
    seg.tgtC3 = tc.c3
    seg.tgtC4 = tc.c4
    seg.tgtC5 = tc.c5
    ;[seg.rotC3, seg.rotC4, seg.rotC5] = quinticHoldCoeffs(
      rotOther - rotBase,
      holdAtStart ? rotTan : -rotTan
    )
  }

  SEGMENTS.push(seg)
}

function hermiteVec3(out, p0, m0, p1, m1, h00, h10, h01, h11) {
  out.x = h00 * p0.x + h10 * m0.x + h01 * p1.x + h11 * m1.x
  out.y = h00 * p0.y + h10 * m0.y + h01 * p1.y + h11 * m1.y
  out.z = h00 * p0.z + h10 * m0.z + h01 * p1.z + h11 * m1.z
}

function quinticHoldVec3(out, base, c3, c4, c5, u3, u4, u5) {
  out.x = base.x + c3.x * u3 + c4.x * u4 + c5.x * u5
  out.y = base.y + c3.y * u3 + c4.y * u4 + c5.y * u5
  out.z = base.z + c3.z * u3 + c4.z * u4 + c5.z * u5
}

export function createPose() {
  return {
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    rotY: 0,
    stage: '',
  }
}

// Writes the camera pose and turntable angle for scroll progress `p` into
// `out`. Allocation free.
export function evalPose(p, out) {
  const cp = clamp01(p)

  let s = 0
  while (s < SEGMENTS.length - 1 && cp > SEGMENTS[s].p1) s++
  const seg = SEGMENTS[s]

  const t = clamp01((cp - seg.p0) * seg.invRange)

  if (seg.mode === MODE_EASE) {
    const e = smootherstep(t)
    out.pos.lerpVectors(seg.pos0, seg.pos1, e)
    out.target.lerpVectors(seg.tgt0, seg.tgt1, e)
    out.rotY = seg.rot0 + (seg.rot1 - seg.rot0) * e
  } else if (seg.mode === MODE_HERMITE) {
    const t2 = t * t
    const t3 = t2 * t
    const h00 = 2 * t3 - 3 * t2 + 1
    const h10 = t3 - 2 * t2 + t
    const h01 = -2 * t3 + 3 * t2
    const h11 = t3 - t2
    hermiteVec3(out.pos, seg.pos0, seg.posM0, seg.pos1, seg.posM1, h00, h10, h01, h11)
    hermiteVec3(out.target, seg.tgt0, seg.tgtM0, seg.tgt1, seg.tgtM1, h00, h10, h01, h11)
    out.rotY = h00 * seg.rot0 + h10 * seg.rotM0 + h01 * seg.rot1 + h11 * seg.rotM1
  } else {
    // Quintic written about the hold end: w = t when the hold is at the start,
    // w = 1 - t when it is at the end.
    const w = seg.mode === MODE_HOLD_START ? t : 1 - t
    const w2 = w * w
    const w3 = w2 * w
    const w4 = w3 * w
    const w5 = w4 * w
    quinticHoldVec3(out.pos, seg.posBase, seg.posC3, seg.posC4, seg.posC5, w3, w4, w5)
    quinticHoldVec3(out.target, seg.tgtBase, seg.tgtC3, seg.tgtC4, seg.tgtC5, w3, w4, w5)
    out.rotY = seg.rotBase + seg.rotC3 * w3 + seg.rotC4 * w4 + seg.rotC5 * w5
  }

  out.stage = seg.name
  return out
}

export { KEYFRAMES }
