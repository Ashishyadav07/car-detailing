import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_PRESETS } from '../constants/configuratorOptions'

export default function CameraController({ cameraPresetId, controlsRef }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(4.8, 2.0, 4.8))
  const targetLook = useRef(new THREE.Vector3(0, 0.7, 0))
  const isTransitioning = useRef(false)

  useEffect(() => {
    const preset = CAMERA_PRESETS.find((p) => p.id === cameraPresetId) || CAMERA_PRESETS[0]
    targetPos.current.set(...preset.position)
    targetLook.current.set(...preset.target)
    isTransitioning.current = true
  }, [cameraPresetId])

  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current) return

    // Smoothly lerp camera position and controls target
    camera.position.lerp(targetPos.current, delta * 4)
    controlsRef.current.target.lerp(targetLook.current, delta * 4)
    controlsRef.current.update()

    if (
      camera.position.distanceTo(targetPos.current) < 0.05 &&
      controlsRef.current.target.distanceTo(targetLook.current) < 0.05
    ) {
      isTransitioning.current = false
    }
  })

  return null
}
