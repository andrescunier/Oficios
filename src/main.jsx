import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeAuth } from './store/useStore'
import { initializeTheme } from './config/theme'
import ErrorBoundary from '@/components/ErrorBoundary'

// Inicializar tema runtime (colores, favicon, metadata)
try {
  initializeTheme();
} catch (e) {
  // Evitar que errores en la inicialización del theme impidan render
  // (se loguea en consola para diagnosticar en development)
  console.error('Error initializing theme:', e);
}

// Inicializar autenticación al cargar la aplicación (con protección)
try {
  initializeAuth();
} catch (e) {
  console.error('Error initializing auth:', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
