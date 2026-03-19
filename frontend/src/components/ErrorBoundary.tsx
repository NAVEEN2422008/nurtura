import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: Error, retry: () => void) => React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.handleRetry) || (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="max-w-md w-full bg-white rounded-rounded shadow-elevated p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-6">{this.state.error.message}</p>
              <button
                onClick={this.handleRetry}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
              >
                Try again
              </button>
              <p className="text-xs text-gray-500 mt-4">
                If the problem persists, please refresh the page or contact support.
              </p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
