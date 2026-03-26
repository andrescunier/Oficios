import React from 'react';
import { clearClientSession } from '@/lib/session';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in component tree:', error, info);
  }

  handleClear = () => {
    clearClientSession({ clearAllLocalStorage: true });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white border rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
            <p className="text-sm text-muted-foreground mb-4">Ha ocurrido un error inesperado. Podés limpiar sesión y recargar.</p>
            <div className="flex gap-2">
              <button onClick={this.handleClear} className="px-4 py-2 bg-red-600 text-white rounded">Limpiar y recargar</button>
              <button onClick={() => window.location.reload()} className="px-4 py-2 border rounded">Recargar</button>
            </div>
            <details className="mt-4 text-xs text-muted-foreground">
              <summary>Detalles del error</summary>
              <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
