import { useEffect } from 'react'
import type { Memory } from '../data/sampleMemory'

type MemoryCardProps = {
  memory: Memory
  onClose: () => void
}

export function MemoryCard({ memory, onClose }: MemoryCardProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="memory-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="memory-card__panel">
        <p className="memory-card__eyebrow">A memory</p>
        <h2 id="memory-title" className="memory-card__title">
          {memory.title}
        </h2>
        <p className="memory-card__body">{memory.body}</p>
        <button type="button" className="memory-card__close" onClick={onClose}>
          Close · Esc
        </button>
      </div>
    </div>
  )
}
