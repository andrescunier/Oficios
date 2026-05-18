/**
 * Página de detalles del producto
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calculator,
  Heart,
  Landmark,
  ShoppingCart,
  Plus,
  Minus,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import type { Product, ProductVariant, ProductVariantOption } from '@/types/api';
import { PriceDisplay } from '@/hooks/usePriceVisibility';
import { handleImgError } from '@/utils/imageHelpers';
import { getBusinessConfig, getLoanConfig, getPaymentMethodsConfig, getUIConfig, getShippingConfig } from '@/config/runtime';
import { getFeatureBenefitIcon } from '@/components/ui/featureBenefitIcons';
import { productDetailQueryOptions } from '@/features/catalog/queries';
import { buildLoanPaymentPlans, getPrimaryLoanPaymentPlan } from '@/features/checkout/loan';
import { recordAppEvent } from '@/lib/observability';
import { setProductJsonLd, clearProductJsonLd } from '@/lib/seo';
import { trackEcommerceEvent } from '@/lib/analytics';

const sortVariantOptions = (options: ProductVariantOption[]) =>
  options
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((option) => ({
      ...option,
      values: option.values.slice().sort((a, b) => a.position - b.position),
    }));

const isVariantAvailable = (variant: ProductVariant) =>
  variant.status === 'active' && (variant.stock_quantity > 0 || variant.allow_backorders);

const matchesSelection = (variant: ProductVariant, selection: Record<string, string>) =>
  Object.entries(selection).every(([key, value]) => !value || variant.option_values?.[key] === value);

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const uiConfig = getUIConfig();
  const shippingCfg = getShippingConfig();
  const loanCfg = getLoanConfig();
  const paymentMethodsCfg = getPaymentMethodsConfig();

  const {
    addToCart,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addNotification,
    auth,
  } = useStore();

  const isAuthenticated = auth.isAuthenticated;
  const productQuery = useQuery(productDetailQueryOptions(id || ''));
  const product = productQuery.data?.product || null;
  const variants = productQuery.data?.variants || [];
  const variantOptions = productQuery.data?.variantOptions || [];
  const loading = productQuery.isLoading;
  const error = productQuery.isError ? 'No se pudo cargar el producto' : null;

  useEffect(() => {
    if (!product) return;
    const businessCfg = getBusinessConfig();
    setProductJsonLd({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      image: product.image_url || product.gallery_urls?.[0],
      price: product.unit_price,
      currency: businessCfg.defaultCurrency,
      availability:
        variants.some(isVariantAvailable) || (product.stock_quantity ?? 0) > 0
          ? 'in_stock'
          : 'out_of_stock',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
    trackEcommerceEvent('view_item', {
      item_id: product.id,
      item_name: product.name,
      price: product.unit_price,
      currency: getBusinessConfig().defaultCurrency,
    });
    return () => clearProductJsonLd();
  }, [product, variants]);

  const buildDefaultSelection = (options: ProductVariantOption[], availableVariants: ProductVariant[]) => {
    const defaults: Record<string, string> = {};
    const preferredVariant =
      availableVariants.find((variant) => isVariantAvailable(variant)) ||
      availableVariants.find((variant) => variant.status === 'active') ||
      availableVariants[0];

    options.forEach((option) => {
      defaults[option.name] =
        preferredVariant?.option_values?.[option.name] ||
        option.values[0]?.value ||
        '';
    });

    return defaults;
  };

  useEffect(() => {
    if (productQuery.isError) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: uiConfig.productNotFoundBody,
      });
    }
  }, [addNotification, productQuery.isError, uiConfig.productNotFoundBody]);

  useEffect(() => {
    if (product?.id) {
      recordAppEvent('product_view', {
        productId: product.id,
        source: 'product_detail',
      });
    }
  }, [product?.id]);

  useEffect(() => {
    if (!productQuery.data) {
      return;
    }

    const sortedOptions = sortVariantOptions(productQuery.data.variantOptions);
    setSelectedOptions(buildDefaultSelection(sortedOptions, productQuery.data.variants));
  }, [productQuery.data]);

  const selectedVariant = useMemo(() => {
    if (!product?.has_variants || variants.length === 0) {
      return null;
    }

    return (
      variants.find((variant) => variantOptions.every((option) => variant.option_values?.[option.name] === selectedOptions[option.name])) ||
      null
    );
  }, [product?.has_variants, selectedOptions, variantOptions, variants]);

  const getAvailableValues = useMemo(
    () => (optionName: string) => {
      const otherSelections = { ...selectedOptions };
      delete otherSelections[optionName];

      return new Set(
        variants
          .filter((variant) => isVariantAvailable(variant) && matchesSelection(variant, otherSelections))
          .map((variant) => variant.option_values?.[optionName])
          .filter(Boolean)
      );
    },
    [selectedOptions, variants]
  );

  useEffect(() => {
    if (!product?.has_variants || variantOptions.length === 0) {
      return;
    }

    const nextSelection: Record<string, string> = {};

    variantOptions.forEach((option) => {
      const availableValues = getAvailableValues(option.name);
      const currentValue = selectedOptions[option.name];

      if (currentValue && availableValues.has(currentValue)) {
        nextSelection[option.name] = currentValue;
        return;
      }

      nextSelection[option.name] =
        option.values.find((value) => availableValues.has(value.value))?.value ||
        option.values[0]?.value ||
        '';
    });

    const changed =
      variantOptions.some((option) => selectedOptions[option.name] !== nextSelection[option.name]) ||
      Object.keys(selectedOptions).length !== variantOptions.length;

    if (changed) {
      setSelectedOptions(nextSelection);
    }
  }, [getAvailableValues, product?.has_variants, selectedOptions, variantOptions]);

  const effectivePrice = selectedVariant?.effective_price ?? product?.unit_price ?? 0;
  const effectiveImage = selectedVariant?.image_url || product?.image_url || '/placeholder-product.svg';
  const effectiveSku = selectedVariant?.sku || product?.sku;
  const effectiveStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0;
  const canBackorder = selectedVariant?.allow_backorders ?? product?.allow_backorders ?? false;
  const isOutOfStock = !canBackorder && effectiveStock <= 0;
  const maxQuantity = Math.max(
    1,
    Math.min(
      effectiveStock > 0 ? effectiveStock : getBusinessConfig().maxQuantityPerProduct,
      getBusinessConfig().maxQuantityPerProduct
    )
  );
  const isProductFavorite = product ? isFavorite(product.id) : false;
  const variantSelectionIncomplete = Boolean(product?.has_variants) && !selectedVariant;
  const loanPaymentEnabled = paymentMethodsCfg.prestamo && loanCfg.enabled;
  const loanAmount = effectivePrice * quantity;
  const primaryLoanPlan = getPrimaryLoanPaymentPlan(loanAmount, loanCfg);
  const loanPlans = useMemo(() => buildLoanPaymentPlans(loanAmount, loanCfg), [loanAmount, loanCfg]);
  const loanCreditLimit = Math.max(loanCfg.maxAmount, loanAmount);
  const loanCreditBalance = Math.max(loanCreditLimit - loanAmount, 0);
  const loanCreditUsagePct = loanCreditLimit > 0 ? Math.min((loanAmount / loanCreditLimit) * 100, 100) : 0;

  useEffect(() => {
    setQuantity((current) => Math.min(current, maxQuantity));
  }, [maxQuantity]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/productos/${id}` } });
      return;
    }

    if (variantSelectionIncomplete) {
      addNotification({
        type: 'warning',
        title: uiConfig.productVariantRequiredTitle,
        message: uiConfig.productVariantRequiredMessage,
      });
      return;
    }

    if (isOutOfStock) {
      addNotification({
        type: 'error',
        title: uiConfig.productOutOfStockNotifTitle,
        message: uiConfig.productVariantOutOfStockMessage,
      });
      return;
    }

    addToCart(product, quantity, selectedVariant || undefined);
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: uiConfig.productLoginForFavoritesTitle,
        message: uiConfig.productLoginForFavoritesMessage,
      });
      navigate('/login', { state: { from: `/productos/${id}` } });
      return;
    }

    if (isProductFavorite) {
      removeFromFavorites(product.id);
      addNotification({
        type: 'info',
        title: uiConfig.productRemovedFromFavoritesTitle,
        message: `${product.name} ${uiConfig.productRemovedFromFavoritesMessage}`,
      });
    } else {
      addToFavorites(product.id);
      addNotification({
        type: 'success',
        title: uiConfig.productAddedToFavoritesTitle,
        message: `${product.name} ${uiConfig.productAddedToFavoritesMessage}`,
      });
    }
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return 'Precio no disponible';
    }
    const business = getBusinessConfig();
    return new Intl.NumberFormat(business.locale, {
      style: 'currency',
      currency: product?.currency || business.defaultCurrency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatOptionValue = (option: ProductVariantOption, rawValue?: string) => {
    if (!rawValue) {
      return '';
    }
    const match = option.values.find((value) => value.value === rawValue || value.label === rawValue);
    return match?.label || rawValue;
  };

  const isColorOption = (optionName: string) => optionName.trim().toLowerCase() === 'color';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    const uiConfig = getUIConfig();
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{uiConfig.productNotFoundTitle}</h1>
          <p className="text-gray-600 mb-8">{error || uiConfig.productNotFoundBody}</p>
          <Link
            to="/productos"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {uiConfig.productViewAllLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600">{uiConfig.productBreadcrumbHome}</Link>
          <span>/</span>
          <Link to="/productos" className="hover:text-blue-600">{uiConfig.productBreadcrumbProducts}</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {uiConfig.productBackLabel}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={effectiveImage}
                alt={selectedVariant?.name || product.name}
                className="w-full h-full object-cover"
                onError={(event) => handleImgError(event)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  {product.has_variants && (
                    <p className="text-sm text-blue-600 mt-1">{uiConfig.productWithVariantsLabel}</p>
                  )}
                </div>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isProductFavorite
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`w-6 h-6 ${isProductFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {effectiveSku && (
                <p className="text-sm text-gray-500 mb-2">SKU: {effectiveSku}</p>
              )}

              {product.category && (
                <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <PriceDisplay
                price={effectivePrice}
                showLoginButton={true}
                className="text-3xl font-bold text-blue-600"
              />
              {selectedVariant && selectedVariant.unit_price !== null && selectedVariant.unit_price !== undefined && (
                <p className="text-sm text-gray-500">{uiConfig.productSubtotalLabel}</p>
              )}
            </div>

            {product.description && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">{uiConfig.productDescriptionLabel}</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {loanPaymentEnabled && primaryLoanPlan && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 shadow-sm">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{loanCfg.badgeLabel}</p>
                    <h3 className="text-lg font-semibold text-gray-900">Crédito Prestameya</h3>
                    <p className="text-sm text-gray-600">Simulación para {quantity} unidad{quantity === 1 ? '' : 'es'} de este producto.</p>
                  </div>
                </div>
                <div className="mb-4 rounded-lg bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Crédito disponible</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatPrice(loanCreditLimit)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Saldo luego de comprar</p>
                      <p className="text-lg font-semibold text-primary">{formatPrice(loanCreditBalance)}</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${loanCreditUsagePct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Monto usado: {formatPrice(loanAmount)}</span>
                    <span>{loanCreditUsagePct.toFixed(0)}% del crédito</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Calculator className="h-4 w-4 text-primary" />
                    {loanCfg.termsTitle}
                  </div>
                  {loanPlans.map((plan) => (
                    <div key={plan.months} className="grid grid-cols-3 gap-2 rounded-md border border-primary/10 bg-white px-3 py-2 text-sm">
                      <span className="font-medium text-gray-800">{plan.label}</span>
                      <span className="text-right text-gray-600">
                        Cuota: <strong className="text-primary">{formatPrice(plan.monthlyPayment)}</strong>
                      </span>
                      <span className="text-right text-gray-600">
                        Total: <strong>{formatPrice(plan.totalFinanced)}</strong>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">{loanCfg.legalText}</p>
              </div>
            )}

            {product.has_variants && variantOptions.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <h3 className="font-semibold">{uiConfig.productVariantLabel}</h3>
                {variantOptions.map((option) => {
                  const availableValues = getAvailableValues(option.name);
                  return (
                    <div key={option.id}>
                      <p className="text-sm font-medium text-gray-700 mb-2">{option.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const selected = selectedOptions[option.name] === value.value;
                          const available = availableValues.has(value.value);
                          return (
                            <button
                              key={`${option.id}-${value.value}`}
                              type="button"
                              disabled={!available}
                              onClick={() =>
                                setSelectedOptions((current) => ({
                                  ...current,
                                  [option.name]: value.value,
                                }))
                              }
                              className={`px-3 py-2 rounded-lg border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                selected
                                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                              }`}
                              title={!available ? 'Sin stock para esta combinación' : value.label}
                            >
                              {isColorOption(option.name) ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-3 w-3 rounded-full border border-gray-300 bg-gray-200" />
                                  {value.label}
                                </span>
                              ) : (
                                value.label
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {selectedVariant ? (
                  <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <p className="font-medium text-gray-900">{selectedVariant.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {variantOptions
                        .map((option) => {
                          const rawValue = selectedVariant.option_values?.[option.name];
                          return rawValue ? `${option.name}: ${formatOptionValue(option, rawValue)}` : null;
                        })
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {uiConfig.productNoVariantMessage}
                  </div>
                )}
              </div>
            )}

            {product.has_variants && variantOptions.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {uiConfig.productNoVariantMessage}
              </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{uiConfig.productAvailabilityLabel}</span>
                <span className={isOutOfStock ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                  {isOutOfStock ? uiConfig.productOutOfStockLabel : `${effectiveStock} ${uiConfig.productAvailableUnitsLabel}`}
                </span>
              </div>

              {product.unit_price != null && !isOutOfStock && (
              <>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                  disabled={quantity >= maxQuantity}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={variantSelectionIncomplete}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {variantSelectionIncomplete ? uiConfig.productSelectVariantLabel : uiConfig.productAddToCartLabel}
              </button>
              </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const ShippingIcon = getFeatureBenefitIcon(uiConfig.productShippingBadgeIcon);
                const SecureIcon = getFeatureBenefitIcon(uiConfig.productBuySecureIcon);
                const PaymentsIcon = getFeatureBenefitIcon(uiConfig.productMultiplePaymentsIcon);
                return (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <ShippingIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">{shippingCfg.productBadgeTitle}</h4>
                      <p className="text-sm text-gray-600">{shippingCfg.productBadgeDescription}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <SecureIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">{uiConfig.productBuySecureTitle}</h4>
                      <p className="text-sm text-gray-600">{uiConfig.productBuySecureDesc}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <PaymentsIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">
                        {loanPaymentEnabled ? loanCfg.badgeLabel : uiConfig.productMultiplePaymentsTitle}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {loanPaymentEnabled && primaryLoanPlan
                          ? `${primaryLoanPlan.label} de ${formatPrice(primaryLoanPlan.monthlyPayment)}`
                          : uiConfig.productMultiplePaymentsDesc}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {selectedVariant && (
              <div className="text-sm text-gray-500">
                {uiConfig.productSubtotalLabel} {formatPrice(effectivePrice * quantity)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
