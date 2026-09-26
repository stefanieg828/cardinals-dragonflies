type LandingProps = {
  onEnter: () => void
}

export function Landing({ onEnter }: LandingProps) {
  return (
    <div className="landing">
      <div className="landing__card">
        <img
          className="landing__logo"
          src="./logo-infinity.jpg"
          alt="Cardinals & Dragonflies logo"
          width={120}
          height={120}
        />
        <h1 className="landing__title">Cardinals & Dragonflies</h1>
        <p className="landing__tagline">
          A gentle garden of memories — walk the path, sit with a story, and let
          the light remember with you.
        </p>
        <button type="button" className="landing__enter" onClick={onEnter}>
          Enter garden
        </button>
        <p className="landing__hint">
          Desktop: WASD / arrows + click to look · Mobile: stick to walk, drag to look
        </p>
      </div>
    </div>
  )
}
