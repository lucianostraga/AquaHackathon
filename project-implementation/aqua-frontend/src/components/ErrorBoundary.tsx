import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-xl font-bold text-red-600 mb-4">
                Something went wrong
              </h1>
              <div className="bg-red-100 rounded p-4 mb-4 overflow-auto max-h-96">
                <p className="text-sm font-mono text-red-800 whitespace-pre-wrap">
                  {this.state.error?.message}
                </p>
                <p className="text-xs font-mono text-red-600 mt-2 whitespace-pre-wrap">
                  {this.state.error?.stack}
                </p>
              </div>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/login'
                }}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Return to Login
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
