/**
 * Hook para controlar la visibilidad de precios según autenticación
 * B2B Platform - Configurable via runtime config
 */

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FEATURES, BUSINESS } from '@/config/branding';
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
    // Si la funcionalidad está deshabilitada, siempre mostrar precios
    if (!FEATURES.HIDE_PRICES_FOR_GUESTS) {
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
      return {
        canViewPrices: true,
        shouldHidePrices: false,
        loginMessage: '',
        loginCTA: '',
        reason: 'authenticated'
      };
    }

    // Usuario no autenticado - ocultar precios
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
  currency = BUSINESS.DEFAULT_CURRENCY,
  className = '',
  showLoginButton = true,
  onLoginClick,
  pricingMode = 'fixed',
}: {
  price: number | null | undefined;
  originalPrice?: number;
  currency?: string;
  className?: string;
  showLoginButton?: boolean;
  onLoginClick?: () => void;
  /** fixed = monto; a_convenir = presupuesto (servicios variables) */
  pricingMode?: 'fixed' | 'a_convenir';
}) => {
  const { canViewPrices, loginMessage, loginCTA } = usePriceVisibility();
  const navigate = useNavigate();
  const location = useLocation();

  // Función por defecto para redirigir a login
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
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

  if (pricingMode === 'a_convenir') {
    const hasReference = typeof price === 'number' && !isNaN(price) && price > 0;
    const formattedReference = hasReference
      ? new Intl.NumberFormat(BUSINESS.LOCALE, {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price)
      : null;
    return (
      <div className={className}>
        <span className="text-lg font-bold text-primary">A convenir</span>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formattedReference
            ? `Presupuesto según el trabajo · referencia desde ${formattedReference}`
            : 'Presupuesto según el trabajo (se acuerda por OficiosHub)'}
        </p>
      </div>
    );
  }

  // Si el precio no es un número válido, mostrar "no disponible"
  if (typeof price !== 'number' || isNaN(price) || price === null || price === undefined) {
    return (
      <div className={className}>
        <span className="text-sm text-muted-foreground italic">
          Precio no disponible
        </span>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat(BUSINESS.LOCALE, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  const formattedOriginalPrice = originalPrice ? new Intl.NumberFormat(BUSINESS.LOCALE, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
