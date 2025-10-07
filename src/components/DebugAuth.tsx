/**
 * Componente de debug temporal para verificar autenticación
 */
import { useStore } from '@/store/useStore';
import { FEATURES } from '@/config/branding';
import { usePriceVisibility } from '@/hooks/usePriceVisibility';

export const DebugAuth = () => {
  const auth = useStore((state) => state.auth);
  const { canViewPrices, loginMessage, reason } = usePriceVisibility();

  if (import.meta.env.PROD) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>🔍 Debug Auth</strong></div>
      <div>isAuthenticated: {auth.isAuthenticated ? '✅ YES' : '❌ NO'}</div>
      <div>user: {auth.user ? auth.user.email : 'null'}</div>
      <div>canViewPrices: {canViewPrices ? '✅ YES' : '❌ NO'}</div>
      <div>reason: {reason}</div>
      <div>HIDE_PRICES_FOR_GUESTS: {String(FEATURES.HIDE_PRICES_FOR_GUESTS)}</div>
      <div>ENV Value: {import.meta.env.VITE_HIDE_PRICES_FOR_GUESTS}</div>
    </div>
  );
};
