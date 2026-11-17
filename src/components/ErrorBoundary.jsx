import React from 'react'

const RELOAD_KEY = 'ag-shop-chunk-reload'

// Captura errores de render y de carga de páginas (lazy).
// Si el error es de un archivo de una versión anterior (tras un despliegue),
// recarga la página una sola vez para pedir la versión nueva.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('AG Shop error:', error, info)
    const isChunkError = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i
      .test(error?.message || '')
    if (isChunkError && !sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, '1')
      window.location.reload()
    }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="card max-w-md text-center">
          <img src="/logo.jpeg" alt="" className="h-14 w-14 object-contain mx-auto mb-4" />
          <h1 className="text-lg font-black text-gray-900">Algo no salió bien</h1>
          <p className="text-sm text-gray-500 mt-2">
            La página no pudo cargarse. Puede ser una conexión lenta o una actualización reciente.
          </p>
          <button
            onClick={() => { sessionStorage.removeItem(RELOAD_KEY); window.location.reload() }}
            className="btn-primary mx-auto mt-5"
          >
            Recargar
          </button>
        </div>
      </div>
    )
  }
}
