import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import type { MoveInput } from './MobileControls'

const SPEED = 4.2
const LOOK_SENS = 0.0022
const DRAG_LOOK = 0.0035
const MOBILE_LOOK = 0.0045
const BOUNDS = { minX: -7, maxX: 7, minZ: -14, maxZ: 6 }
const EYE = 1.55

type PlayerProps = {
  moveRef: MutableRefObject<MoveInput>
  lookDeltaRef: MutableRefObject<{ dx: number; dy: number }>
  pointerLocked: boolean
  memoryOpen: boolean
  onNearLandmark: (near: boolean) => void
  landmarkPos: [number, number, number]
}

export function Player({
  moveRef,
  lookDeltaRef,
  pointerLocked,
  memoryOpen,
  onNearLandmark,
  landmarkPos,
}: PlayerProps) {
  const { camera } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const yaw = useRef(0)
  const pitch = useRef(-0.12)
  const pos = useRef(new THREE.Vector3(0, EYE, 4))
  const nearRef = useRef(false)
  const dragging = useRef(false)
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const landmark = useRef(new THREE.Vector3(landmarkPos[0], EYE, landmarkPos[2]))

  useEffect(() => {
    landmark.current.set(landmarkPos[0], EYE, landmarkPos[2])
  }, [landmarkPos])

  useEffect(() => {
    camera.position.copy(pos.current)
  }, [camera])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (memoryOpen) return
      if (pointerLocked) {
        yaw.current -= e.movementX * LOOK_SENS
        pitch.current -= e.movementY * LOOK_SENS
        pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current))
        return
      }
      if (dragging.current && (e.buttons & 1)) {
        yaw.current -= e.movementX * DRAG_LOOK
        pitch.current -= e.movementY * DRAG_LOOK
        pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current))
      }
    }
    const onDown = (e: MouseEvent) => {
      if (e.button === 0 && !pointerLocked && !memoryOpen) dragging.current = true
    }
    const onUp = () => {
      dragging.current = false
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [pointerLocked, memoryOpen])

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05)

    if (!memoryOpen) {
      const ld = lookDeltaRef.current
      if (ld.dx || ld.dy) {
        yaw.current -= ld.dx * MOBILE_LOOK
        pitch.current -= ld.dy * MOBILE_LOOK
        pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current))
        ld.dx = 0
        ld.dy = 0
      }
    }

    forward.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current))

    let mx = 0
    let mz = 0
    if (!memoryOpen) {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) mz -= 1
      if (keys.current['KeyS'] || keys.current['ArrowDown']) mz += 1
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) mx -= 1
      if (keys.current['KeyD'] || keys.current['ArrowRight']) mx += 1

      const stick = moveRef.current
      mx += stick.x
      mz += stick.z
    }

    const len = Math.hypot(mx, mz)
    if (len > 1e-3) {
      mx /= len
      mz /= len
      pos.current.addScaledVector(forward.current, -mz * SPEED * clampedDt)
      pos.current.addScaledVector(right.current, mx * SPEED * clampedDt)
    }

    pos.current.x = THREE.MathUtils.clamp(pos.current.x, BOUNDS.minX, BOUNDS.maxX)
    pos.current.z = THREE.MathUtils.clamp(pos.current.z, BOUNDS.minZ, BOUNDS.maxZ)
    pos.current.y = EYE

    if (
      Number.isFinite(pos.current.x) &&
      Number.isFinite(pos.current.z) &&
      Number.isFinite(yaw.current) &&
      Number.isFinite(pitch.current)
    ) {
      camera.position.copy(pos.current)
      camera.rotation.order = 'YXZ'
      camera.rotation.y = yaw.current
      camera.rotation.x = pitch.current
    }

    const dist = pos.current.distanceTo(landmark.current)
    const near = dist < 3.2
    if (near !== nearRef.current) {
      nearRef.current = near
      // Defer React state updates out of the render/frame path
      queueMicrotask(() => onNearLandmark(near))
    }
  })

  return null
}
