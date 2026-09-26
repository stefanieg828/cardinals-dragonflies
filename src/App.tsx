import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GardenScene } from './components/GardenScene'
import { Landing } from './components/Landing'
import { MemoryCard } from './components/MemoryCard'
import { MobileControls, type MoveInput } from './components/MobileControls'
import { Player } from './components/Player'
import { SAMPLE_MEMORY } from './data/sampleMemory'

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(pointer: coarse)').matches
      : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setCoarse(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return coarse
}

function GardenApp() {
  const [nearLandmark, setNearLandmark] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [pointerLocked, setPointerLocked] = useState(false)
  const isMobile = useIsCoarsePointer()

  const moveRef = useRef<MoveInput>({ x: 0, z: 0 })
  const lookDeltaRef = useRef({ dx: 0, dy: 0 })

  const onNearLandmark = useCallback((near: boolean) => {
    setNearLandmark(near)
    if (!near) setMemoryOpen(false)
  }, [])

  useEffect(() => {
    const onLockChange = () => {
      setPointerLocked(document.pointerLockElement !== null)
    }
    const onLockError = () => {
      // Pointer lock is optional — walking/looking still work via drag.
      setPointerLocked(false)
    }
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('pointerlockerror', onLockError)
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('pointerlockerror', onLockError)
    }
  }, [])

  useEffect(() => {
    if (isMobile || memoryOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearLandmark) {
        setMemoryOpen(true)
        try {
          document.exitPointerLock?.()
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobile, memoryOpen, nearLandmark])

  const requestLock = useCallback(() => {
    if (isMobile || memoryOpen) return
    const canvas = document.querySelector('canvas')
    if (!canvas?.requestPointerLock) return
    try {
      const result = canvas.requestPointerLock() as void | Promise<void>
      if (result && typeof result.then === 'function') {
        result.catch(() => {
          /* best-effort only */
        })
      }
    } catch {
      /* pointer lock optional */
    }
  }, [isMobile, memoryOpen])

  const dpr = useMemo(
    () => (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.75) : 1),
    [],
  )

  return (
    <>
      <Canvas
        shadows
        dpr={dpr}
        camera={{ fov: 60, near: 0.1, far: 80, position: [0, 1.55, 4] }}
        onPointerDown={requestLock}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('[garden] WebGL context lost')
          })
        }}
        style={{ width: '100%', height: '100%', display: 'block', background: '#cfe0ef' }}
      >
        <Suspense fallback={null}>
          <GardenScene nearLandmark={nearLandmark} />
          <Player
            moveRef={moveRef}
            lookDeltaRef={lookDeltaRef}
            pointerLocked={pointerLocked}
            memoryOpen={memoryOpen}
            onNearLandmark={onNearLandmark}
            landmarkPos={SAMPLE_MEMORY.position}
          />
        </Suspense>
      </Canvas>

      <div className="hud">
        {!memoryOpen && (
          <p className="hud__hint">
            {isMobile
              ? 'Walk toward the glowing bench'
              : pointerLocked
                ? 'WASD to walk · E near the bench · Esc to unlock look'
                : 'WASD to walk · drag or click to look · E near the bench'}
          </p>
        )}
        {nearLandmark && !memoryOpen && (
          <button
            type="button"
            className="hud__prompt"
            onClick={() => {
              setMemoryOpen(true)
              try {
                document.exitPointerLock?.()
              } catch {
                /* ignore */
              }
            }}
          >
            {isMobile ? 'Open memory' : 'Press E · Open memory'}
          </button>
        )}
      </div>

      <MobileControls
        moveRef={moveRef}
        lookDeltaRef={lookDeltaRef}
        enabled={isMobile && !memoryOpen}
      />

      {memoryOpen && (
        <MemoryCard memory={SAMPLE_MEMORY} onClose={() => setMemoryOpen(false)} />
      )}
    </>
  )
}

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <ErrorBoundary onReset={() => setEntered(false)}>
      {!entered ? (
        <Landing onEnter={() => setEntered(true)} />
      ) : (
        <GardenApp />
      )}
    </ErrorBoundary>
  )
}
