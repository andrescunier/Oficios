/**
 * Hook para controlar la visibilidad de precios según autenticación
 * Específico para DIAP - B2B Platform
 */

import React, { useMemo } from 'react';
import { FEATURES } from '@/config/branding';
import { useStore } from '@/store/useStore';

// Hook para autenticación - conectado al store real
const useAuth = () => {
  const auth = useStore((state) => state.auth);
  
  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    role: auth.user?.role || null
  };
};

/**
 * Hook para determinar si el usuario puede ver precios
 */
export const usePriceVisibility = () => {
  const { isAuthenticated } = useAuth();

  const priceVisibility = useMemo(() => {
    console.log('🔍 usePriceVisibility - Checking visibility:', {
      featureEnabled: FEATURES.HIDE_PRICES_FOR_GUESTS,
      isAuthenticated,
      FEATURES
    });

    // Si la funcionalidad está deshabilitada, siempre mostrar precios
    if (!FEATURES.HIDE_PRICES_FOR_GUESTS) {
      console.log('❌ Feature disabled - showing prices');
      return {
        canViewPrices: true,
        shouldHidePrices: false,
        loginMessage: '',
        loginCTA: '',
        reason: 'feature_disabled'
      };
    }

    // Si el usuario está autenticado, puede ver precios
    if (isAuthenticated) {
      console.log('✅ User authenticated - showing prices');
      return {
        canViewPrices: true,
        shouldHidePrices: false,
        loginMessage: '',
        loginCTA: '',
        reason: 'authenticated'
      };
    }

    // Usuario no autenticado - ocultar precios
    console.log('🚫 User NOT authenticated - hiding prices');
    return {
      canViewPrices: false,
      shouldHidePrices: true,
      loginMessage: FEATURES.LOGIN_TO_VIEW_PRICES_MESSAGE,
      loginCTA: FEATURES.LOGIN_FOR_PRICES_CTA,
      reason: 'not_authenticated'
    };
  }, [isAuthenticated]);

  return priceVisibility;
};

/**
 * Componente para mostrar precio con lógica de ocultación
 */
export const PriceDisplay = ({ 
  price, 
  originalPrice, 
  className = '',
  showLoginButton = true,
  onLoginClick
}: {
  price: number;
  originalPrice?: number;
  className?: string;
  showLoginButton?: boolean;
  onLoginClick?: () => void;
}) => {
  const { canViewPrices, loginMessage, loginCTA } = usePriceVisibility();

  // Función por defecto para redirigir a login
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      window.location.href = '/login';
    }
  };

  if (!canViewPrices) {
    return (
      <div className={`${className} space-y-2`}>
        <p className="text-muted-foreground italic text-sm">
          {loginMessage}
        </p>
        {showLoginButton && (
          <button
            onClick={handleLoginClick}
            className="text-primary hover:text-primary/80 text-sm font-medium underline"
          >
            {loginCTA}
          </button>
        )}
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const formattedOriginalPrice = originalPrice ? new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(originalPrice) : null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-primary">
          {formattedPrice}
        </span>
        {formattedOriginalPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formattedOriginalPrice}
          </span>
        )}
      </div>
    </div>
  );
};

export default usePriceVisibility;
