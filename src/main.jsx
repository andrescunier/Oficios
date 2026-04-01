import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from '@/components/ErrorBoundary';
import { bootstrapApplication } from '@/app/bootstrap';

const rootElement = document.getElementById('root');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderBootstrapScreen(status) {
  if (!rootElement) {
    return;
  }

  const retryHint = status.nextRetryInMs
    ? `<p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Proximo intento en ${Math.ceil(status.nextRetryInMs / 1000)}s</p>`
    : '';
  const attemptHint = status.attempt
    ? `<p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">Intento ${status.attempt}</p>`
    : '';
  const errorHint = status.error
    ? `<p style="margin:16px 0 0;color:#fca5a5;font-size:13px;max-width:640px;">${escapeHtml(status.error)}</p>`
    : '';

  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px;background:#020617;color:#f8fafc;font-family:Inter,system-ui,sans-serif;">
      <div style="width:min(720px,100%);border:1px solid rgba(148,163,184,.24);border-radius:24px;padding:32px;background:rgba(15,23,42,.92);box-shadow:0 24px 80px rgba(2,6,23,.45);">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(30,41,59,.92);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd;">
          Bootstrap storefront
        </div>
        <h1 style="margin:20px 0 8px;font-size:32px;line-height:1.1;">Esperando ecommerce-config</h1>
        <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.6;">${escapeHtml(status.message)}</p>
        ${attemptHint}
        ${retryHint}
        ${errorHint}
        <div style="margin-top:24px;height:8px;border-radius:999px;background:rgba(51,65,85,.9);overflow:hidden;">
          <div style="width:36%;height:100%;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#3b82f6,#2563eb);animation:bootPulse 1.4s ease-in-out infinite;"></div>
        </div>
      </div>
    </div>
    <style>
      @keyframes bootPulse {
        0% { transform: translateX(-12%); opacity: .65; }
        50% { transform: translateX(120%); opacity: 1; }
        100% { transform: translateX(250%); opacity: .65; }
      }
    </style>
  `;
}

async function bootstrap() {
  if (!rootElement) {
    throw new Error('No se encontro el nodo #root');
  }

  renderBootstrapScreen({
    phase: 'tenant_config',
    message: 'Resolviendo configuracion del tenant...',
  });

  await bootstrapApplication({
    onStatusChange: (status) => {
      if (status.phase !== 'ready') {
        renderBootstrapScreen(status);
      }
    },
  });

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

bootstrap().catch((error) => {
  renderBootstrapScreen({
    phase: 'retrying_tenant_config',
    message: 'No se pudo completar el bootstrap del storefront.',
    error: error instanceof Error ? error.message : String(error),
  });
});
