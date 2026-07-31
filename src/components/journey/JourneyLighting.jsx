import React from 'react'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

// Trimmed version of StudioEnvironment's lighting rig with the physical
// studio floor/walls dropped entirely — the AI-generated photo behind the
// transparent canvas IS the environment here, so only the reflection map,
// 3-point lighting and a soft contact-shadow blob are needed to ground the
// car on it.
export default function JourneyLighting() {
  return (
    <>
      <Environment resolution={512} frames={1}>
        <group position={[0, 10, 0]}>
          <Lightformer form="rect" intensity={2.2} color="#eaf2ff" position={[0, 0, 0]} scale={[6, 20, 1]} rotation={[Math.PI / 2, 0, 0]} />
          <Lightformer form="rect" intensity={1.3} color="#dbeafe" position={[-13, -2, 0]} scale={[4, 18, 1]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={1.3} color="#dbeafe" position={[13, -2, 0]} scale={[4, 18, 1]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
        <Lightformer form="rect" intensity={3} color="#eaf4ff" position={[-4, 2, -10]} scale={[2, 6, 1]} rotation={[0, Math.PI / 6, 0]} />
        <Lightformer form="rect" intensity={3} color="#eaf4ff" position={[4, 2, -10]} scale={[2, 6, 1]} rotation={[0, -Math.PI / 6, 0]} />
      </Environment>

      <hemisphereLight args={['#dbe9ff', '#0a0c10', 0.4]} />
      <directionalLight position={[6, 12, 7]} intensity={1.1} color="#fff2e0" />
      <directionalLight position={[-7, 6, 4]} intensity={0.35} color="#cfe3ff" />
      <directionalLight position={[-5, 7, -9]} intensity={0.9} color="#eaf4ff" />
      <directionalLight position={[5, 7, -9]} intensity={0.9} color="#eaf4ff" />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.55} scale={12} blur={2.4} far={6} resolution={512} color="#000000" />
    </>
  )
}
