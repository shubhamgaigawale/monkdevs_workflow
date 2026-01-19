import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">Something went wrong</h2>
            <p className="text-red-700 mb-4">
              {this.state.error?.toString()}
            </p>
            {this.state.errorInfo && (
              <details className="text-sm text-red-600">
                <summary className="cursor-pointer font-medium mb-2">Error details</summary>
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null })
                window.location.reload()
              }}
              className="mt-4"
            >
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
