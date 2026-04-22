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

  // Sitio no disponible — bootstrap agotó los reintentos
  if (status.phase === 'failed') {
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px;background:radial-gradient(circle at top, rgba(37,99,235,.22), transparent 28%),linear-gradient(180deg,#020617 0%,#0f172a 52%,#111827 100%);color:#f8fafc;font-family:Inter,system-ui,sans-serif;">
        <div style="position:relative;overflow:hidden;width:min(760px,100%);border:1px solid rgba(248,113,113,.2);border-radius:32px;padding:44px;background:linear-gradient(180deg,rgba(15,23,42,.94) 0%,rgba(15,23,42,.88) 100%);box-shadow:0 30px 90px rgba(2,6,23,.55);">
          <div style="position:absolute;inset:auto -90px -90px auto;width:220px;height:220px;border-radius:999px;background:radial-gradient(circle, rgba(248,113,113,.18), transparent 70%);"></div>
          <div style="position:relative;display:grid;gap:26px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
              <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(127,29,29,.18);border:1px solid rgba(248,113,113,.2);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#fecaca;">
                Estado del storefront
              </div>
              <div style="display:flex;align-items:center;justify-content:center;width:66px;height:66px;border-radius:20px;background:linear-gradient(180deg,rgba(127,29,29,.42),rgba(69,10,10,.55));border:1px solid rgba(248,113,113,.28);box-shadow:inset 0 1px 0 rgba(255,255,255,.04);font-size:30px;">
                !
              </div>
            </div>

            <div style="display:grid;gap:12px;max-width:560px;">
              <h1 style="margin:0;font-size:40px;line-height:1.02;letter-spacing:-.03em;">No pudimos abrir la tienda</h1>
              <p style="margin:0;color:#cbd5e1;font-size:17px;line-height:1.75;">
                La configuración inicial del storefront no respondió correctamente.
                Cuando el servicio vuelva a estar disponible, podés reintentar la carga desde esta misma pantalla.
              </p>
            </div>

            <div style="display:grid;grid-template-columns:1.15fr .85fr;gap:18px;align-items:stretch;">
              <div style="border:1px solid rgba(148,163,184,.14);border-radius:22px;padding:22px;background:rgba(15,23,42,.56);">
                <p style="margin:0 0 8px;color:#f8fafc;font-size:15px;font-weight:600;">Qué pasó</p>
                <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7;">
                  El bootstrap agotó los intentos de carga y no recibió un
                  <span style="color:#f8fafc;"> ecommerce-config </span>
                  válido para este tenant.
                </p>
              </div>
              <div style="border:1px solid rgba(59,130,246,.18);border-radius:22px;padding:22px;background:linear-gradient(180deg,rgba(30,41,59,.78),rgba(15,23,42,.82));">
                <p style="margin:0 0 8px;color:#bfdbfe;font-size:15px;font-weight:600;">Acción recomendada</p>
                <p style="margin:0;color:#dbeafe;font-size:14px;line-height:1.7;">
                  Recargá la página cuando el backend o la configuración del tenant vuelvan a estar accesibles.
                </p>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
              <button onclick="location.reload()" style="padding:14px 22px;border:none;border-radius:16px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-size:15px;font-weight:700;letter-spacing:.01em;cursor:pointer;box-shadow:0 12px 30px rgba(37,99,235,.28);transition:transform .18s ease,box-shadow .18s ease;">
                Reintentar ahora
              </button>
              <span style="color:#94a3b8;font-size:13px;line-height:1.6;">
                Si el problema persiste, verificá conectividad, CORS o disponibilidad del tenant configurado.
              </span>
            </div>

            ${status.error ? `
              <div style="border:1px solid rgba(248,113,113,.16);border-radius:20px;padding:18px 20px;background:rgba(28,25,23,.46);">
                <p style="margin:0 0 8px;color:#fca5a5;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Detalle técnico</p>
                <p style="margin:0;color:#fecaca;font-size:13px;line-height:1.7;word-break:break-word;">${escapeHtml(status.error)}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
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
    phase: 'failed',
    message: 'No se pudo completar el bootstrap del storefront.',
    error: error instanceof Error ? error.message : String(error),
  });
});
