import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  onReset?: () => void
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Cardinals & Dragonflies]', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-screen">
          <div className="error-screen__card">
            <h1 className="error-screen__title">The garden needs a moment</h1>
            <p className="error-screen__body">
              Something stumbled while loading the walk. You can try again — no
              progress was lost.
            </p>
            <p className="error-screen__detail">{this.state.error.message}</p>
            <button type="button" className="landing__enter" onClick={this.reset}>
              Return to gate
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
