import React, { useMemo, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  PAINT_OPTIONS,
  RIM_OPTIONS,
  TIRE_OPTIONS,
  BRAKE_OPTIONS,
  INTERIOR_OPTIONS,
} from '../constants/configuratorOptions'

export default function CarModel({ url, config }) {
  const { scene } = useGLTF(url)
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const groupRef = useRef()

  // Target Color Refs for Smooth Lerping
  const targetPaintColor = useRef(new THREE.Color())
  const targetRimColor = useRef(new THREE.Color())
  const targetTireColor = useRef(new THREE.Color())
  const targetBrakeColor = useRef(new THREE.Color())
  const targetInteriorColor = useRef(new THREE.Color())

  // Material references
  const materialsRef = useRef({
    paint: [],
    rim: [],
    tire: [],
    brake: [],
    interior: [],
    glass: [],
  })

  // Find active options
  const activePaint = useMemo(
    () => PAINT_OPTIONS.find((p) => p.id === config.paint) || PAINT_OPTIONS[0],
    [config.paint]
  )
  const activeRim = useMemo(
    () => RIM_OPTIONS.find((r) => r.id === config.rim) || RIM_OPTIONS[0],
    [config.rim]
  )
  const activeTire = useMemo(
    () => TIRE_OPTIONS.find((t) => t.id === config.tire) || TIRE_OPTIONS[0],
    [config.tire]
  )
  const activeBrake = useMemo(
    () => BRAKE_OPTIONS.find((b) => b.id === config.brake) || BRAKE_OPTIONS[0],
    [config.brake]
  )
  const activeInterior = useMemo(
    () => INTERIOR_OPTIONS.find((i) => i.id === config.interior) || INTERIOR_OPTIONS[0],
    [config.interior]
  )

  // Update target colors when config changes
  useEffect(() => {
    targetPaintColor.current.set(activePaint.color)
    targetRimColor.current.set(activeRim.color)
    targetTireColor.current.set(activeTire.color)
    targetBrakeColor.current.set(activeBrake.color)
    targetInteriorColor.current.set(activeInterior.color)
  }, [activePaint, activeRim, activeTire, activeBrake, activeInterior])

  // Setup Initial Positioning (PRESERVED: rotation=[0,0,0]) & Categorize Materials
  useEffect(() => {
    if (!clonedScene) return

    clonedScene.rotation.set(0, 0, 0)
    clonedScene.position.set(0, 0, 0)
    clonedScene.scale.set(1, 1, 1)

    // Calculate unrotated bounding box for natural wheel placement at Y = 0
    const box = new THREE.Box3().setFromObject(clonedScene)
    const center = new THREE.Vector3()
    box.getCenter(center)

    clonedScene.position.x = -center.x
    clonedScene.position.z = -center.z
    clonedScene.position.y = -box.min.y

    // Reset categorization refs
    materialsRef.current = { paint: [], rim: [], tire: [], brake: [], interior: [], glass: [] }

    clonedScene.traverse((child) => {
      if (!child.isMesh || !child.material) return

      child.castShadow = true
      child.receiveShadow = true

      const matName = (child.material.name || '').toLowerCase()
      const meshName = (child.name || '').toLowerCase()

      // 1. Body Paint
      if (matName === 'carpaint' || meshName.includes('_carpaint_')) {
        if (!(child.material instanceof THREE.MeshPhysicalMaterial)) {
          child.material = new THREE.MeshPhysicalMaterial({
            name: child.material.name,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            reflectivity: 0.9,
          })
        }
        child.material.envMapIntensity = 1.9
        materialsRef.current.paint.push(child.material)
      }

      // 2. Rims
      else if (matName === 'lambert1' || meshName.includes('_lambert1_')) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 2.4
        materialsRef.current.rim.push(child.material)
      }

      // 3. Tires
      else if (matName === 'tire' || meshName.includes('_tire_')) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 0.8
        materialsRef.current.tire.push(child.material)
      }

      // 4. Brake Calipers
      else if (matName === 'brake' || meshName.includes('_brake_')) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 1.5
        materialsRef.current.brake.push(child.material)
      }

      // 5. Interior
      else if (
        matName === 'leather' ||
        matName === 'seat' ||
        meshName.includes('_seat_') ||
        meshName.includes('_leather_')
      ) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({ name: child.material.name })
        }
        child.material.envMapIntensity = 1.0
        materialsRef.current.interior.push(child.material)
      }

      // 6. Glass
      else if (matName === 'tinted_glass' || meshName.includes('_tinted_glass_')) {
        child.material.transparent = true
        child.material.opacity = 0.42
        child.material.roughness = 0.05
        child.material.metalness = 0.95
        child.material.envMapIntensity = 2.8
      }
    })
  }, [clonedScene])

  // Smooth Material Lerping in Frame Loop (300ms smooth transition)
  useFrame((_, delta) => {
    const lerpFactor = Math.min(delta * 8, 1.0)

    // Lerp Paint
    materialsRef.current.paint.forEach((mat) => {
      mat.color.lerp(targetPaintColor.current, lerpFactor)
      mat.roughness = THREE.MathUtils.lerp(mat.roughness, activePaint.roughness, lerpFactor)
      mat.metalness = THREE.MathUtils.lerp(mat.metalness, activePaint.metalness, lerpFactor)
    })

    // Lerp Rims
    materialsRef.current.rim.forEach((mat) => {
      mat.color.lerp(targetRimColor.current, lerpFactor)
      mat.roughness = THREE.MathUtils.lerp(mat.roughness, activeRim.roughness, lerpFactor)
      mat.metalness = THREE.MathUtils.lerp(mat.metalness, activeRim.metalness, lerpFactor)
    })

    // Lerp Tires
    materialsRef.current.tire.forEach((mat) => {
      mat.color.lerp(targetTireColor.current, lerpFactor)
      mat.roughness = THREE.MathUtils.lerp(mat.roughness, activeTire.roughness, lerpFactor)
      mat.metalness = THREE.MathUtils.lerp(mat.metalness, activeTire.metalness, lerpFactor)
    })

    // Lerp Brakes
    materialsRef.current.brake.forEach((mat) => {
      mat.color.lerp(targetBrakeColor.current, lerpFactor)
      mat.roughness = THREE.MathUtils.lerp(mat.roughness, activeBrake.roughness, lerpFactor)
      mat.metalness = THREE.MathUtils.lerp(mat.metalness, activeBrake.metalness, lerpFactor)
    })

    // Lerp Interior
    materialsRef.current.interior.forEach((mat) => {
      mat.color.lerp(targetInteriorColor.current, lerpFactor)
      mat.roughness = THREE.MathUtils.lerp(mat.roughness, activeInterior.roughness, lerpFactor)
      mat.metalness = THREE.MathUtils.lerp(mat.metalness, activeInterior.metalness, lerpFactor)
    })
  })

  return (
    // PRESERVED: rotation={[0, 0, 0]}
    <group ref={groupRef} rotation={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  )
}
