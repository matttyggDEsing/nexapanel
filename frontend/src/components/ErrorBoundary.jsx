import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
          <div className="text-center space-y-4 p-8">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5' }}>!</div>
            <h1 className="font-display font-bold text-xl">Algo salió mal</h1>
            <p className="text-sm" style={{ color: 'var(--txt2)' }}>Ocurrió un error inesperado. Recargá la página para continuar.</p>
            <button onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold font-display transition-all"
              style={{ background: 'var(--em)', color: '#000' }}>
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}