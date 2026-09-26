import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type LandmarkProps = {
  position: [number, number, number]
  highlight: boolean
}

/** Soft wooden bench + lily stone — the one memory landmark. */
export function Landmark({ position, highlight }: LandmarkProps) {
  const glow = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!glow.current) return
    const mat = glow.current.material as THREE.MeshBasicMaterial
    const pulse = 0.12 + Math.sin(clock.elapsedTime * 1.6) * 0.05
    mat.opacity = highlight ? 0.35 + pulse : pulse * 0.6
  })

  return (
    <group position={position}>
      {/* Soft ground glow */}
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial color="#f0d9a8" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* Stone plinth */}
      <mesh position={[0, 0.18, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.36, 0.55]} />
        <meshStandardMaterial color="#b8b0a0" roughness={0.9} />
      </mesh>

      {/* Bench seat */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.12, 0.7]} />
        <meshStandardMaterial color="#8b6a45" roughness={0.75} />
      </mesh>
      {/* Bench back */}
      <mesh position={[0, 0.85, -0.28]} castShadow>
        <boxGeometry args={[2.2, 0.7, 0.1]} />
        <meshStandardMaterial color="#7a5c3c" roughness={0.75} />
      </mesh>
      {/* Legs */}
      {[
        [-0.9, 0.2, 0.25],
        [0.9, 0.2, 0.25],
        [-0.9, 0.2, -0.25],
        [0.9, 0.2, -0.25],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#6a4e32" roughness={0.8} />
        </mesh>
      ))}

      {/* White lily on the stone */}
      <group position={[0, 0.42, 0.55]}>
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#fff8ef" roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.12, 0.18, Math.sin(a) * 0.12]}
              rotation={[0.6, a, 0]}
            >
              <coneGeometry args={[0.07, 0.18, 5]} />
              <meshStandardMaterial color="#fffaf3" roughness={0.45} />
            </mesh>
          )
        })}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.015, 0.02, 0.2, 6]} />
          <meshStandardMaterial color="#5a7a4a" />
        </mesh>
      </group>
    </group>
  )
}
