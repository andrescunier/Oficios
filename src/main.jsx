import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeAuth } from './store/useStore'
import { initializeTheme } from './config/theme'

// Inicializar tema runtime (colores, favicon, metadata)
initializeTheme();

// Inicializar autenticación al cargar la aplicación
initializeAuth();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
