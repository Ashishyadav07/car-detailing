// Allocation-free animation math shared by the hero's 3D motion system.
// Everything here is frame-rate independent: the same input produces the same
// motion at 30, 60, 120 or 144 Hz, which is what keeps the camera from feeling
// different (or stuttering) when frame times jitter.

export const TAU = Math.PI * 2

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}

export function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

// Quintic smootherstep. Unlike the cubic 3t²-2t³, both the first AND second
// derivative are zero at each end, so keyframes are entered and left without a
// jerk step — the difference between "eased" and "cinematic".
export function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

// Frame-rate correct exponential approach. `lambda` is a rate in 1/s, so the
// result only depends on elapsed time, never on how many frames it took.
export function damp(current, target, lambda, dt) {
  return target + (current - target) * Math.exp(-lambda * dt)
}

// Shortest signed angular delta from `from` to `to`, in (-PI, PI].
export function shortestAngle(from, to) {
  let d = (to - from) % TAU
  if (d > Math.PI) d -= TAU
  else if (d < -Math.PI) d += TAU
  return d
}

// Critically damped spring, integrated with the exact closed-form solution
// rather than a numeric step:
//
//   x(t) = (x0 + c·t)·e^(-ω·t)      where c = v0 + ω·x0
//   ẋ(t) = (v0 - ω·c·t)·e^(-ω·t)
//
// Because it is analytic it can never blow up on a long frame, and velocity
// stays continuous — motion accelerates and decelerates instead of snapping to
// speed the way a plain lerp does. Critically damped means no overshoot/wobble.
export class CriticallyDampedSpring {
  constructor(value = 0) {
    this.value = value
    this.velocity = 0
  }

  step(target, omega, dt) {
    if (omega <= 0) {
      this.value += this.velocity * dt
      return this.value
    }
    const x = this.value - target
    const c = this.velocity + omega * x
    const e = Math.exp(-omega * dt)
    this.value = target + (x + c * dt) * e
    this.velocity = (this.velocity - c * omega * dt) * e
    return this.value
  }

  reset(value = 0) {
    this.value = value
    this.velocity = 0
  }
}
