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
  onLoginClick
}: {
  price: number;
  originalPrice?: number;
  currency?: string;
  className?: string;
  showLoginButton?: boolean;
  onLoginClick?: () => void;
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

  // Si el precio no es un número válido, mostrar mensaje de login o "no disponible"
  if (typeof price !== 'number' || isNaN(price) || price === null || price === undefined) {
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
