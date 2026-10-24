import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack)
  }

  private reload = (): void => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="fatal">
        <div className="fatal-card">
          <div className="fatal-icon" aria-hidden="true">
            ⚠️
          </div>
          <h1>Something broke on this screen</h1>
          <p>
            Your file was never uploaded anywhere, so nothing was shared. Reload to start again.
          </p>
          <div className="fatal-actions">
            <button type="button" className="btn btn-primary" onClick={this.reload}>
              Reload
            </button>
            <Link to="/" className="btn btn-secondary">
              Back to home
            </Link>
          </div>
          <p className="fatal-signature">A Varun C Creation</p>
        </div>
      </div>
    )
  }
}
