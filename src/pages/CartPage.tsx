/**
 * Página del carrito de compras
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getBusinessConfig, getUIConfig, getShippingConfig } from '@/config/runtime';
import { SHIPPING } from '@/config/branding';
import { getCheckoutShippingCharge } from '@/features/checkout/model';
import { calculateIncludedTax } from '@/features/cart/tax';

export const CartPage: React.FC = () => {
  const {
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    addNotification,
    auth,
  } = useStore();
  const navigate = useNavigate();
  const shippingAmount = getCheckoutShippingCharge(cart.subtotal);
  const totalWithShipping = cart.total_amount + shippingAmount;
  const includedTaxAmount = calculateIncludedTax(cart.items);



  const handleQuantityChange = (lineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(lineId);
    } else {
      updateCartQuantity(lineId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    try {
      // Verificar autenticación
      if (!auth.isAuthenticated) {
        addNotification({
          type: 'warning',
          title: 'Autenticación requerida',
          message: 'Debes iniciar sesión para realizar el checkout',
        });
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      // Redirigir a la página de checkout directamente
      navigate('/checkout');
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al procesar checkout',
      });
    }
  };



  const formatPrice = (price: number, currency?: string) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    const currencyCode = currency || getBusinessConfig().defaultCurrency;
    
    return new Intl.NumberFormat(getBusinessConfig().locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const uiCfg = getUIConfig();
  const shippingCfg = getShippingConfig();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{uiCfg.cartPageTitle}</h1>
              <Link 
                to="/" 
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {uiCfg.cartPageContinueShopping}
              </Link>
            </div>
          </div>
        </section>

        {/* Empty Cart */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{uiCfg.cartEmptyTitle}</h2>
              <p className="text-gray-600 mb-8">
                {uiCfg.cartEmptyBody}
              </p>
              <Link 
                to="/productos" 
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {uiCfg.cartEmptyExploreLabel}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {uiCfg.cartPageTitle} ({cart.items.length} {cart.items.length === 1 ? uiCfg.cartPageProductSingular : uiCfg.cartPageProductPlural})
            </h1>
            <Link 
              to="/" 
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {uiCfg.cartPageContinueShopping}
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{uiCfg.cartPageItemsLabel}</h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm transition-colors"
                  >
                    {uiCfg.cartPageClearCartLabel}
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.line_id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={item.product.image_url || '/placeholder-product.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.variant?.name || item.product.name}
                        </h3>
                        <p className="text-xs text-gray-400">SKU: {item.variant?.sku || item.product.sku}</p>
                        {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {Object.entries(item.selected_options).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">
                          {formatPrice(item.unit_price, item.product.currency)} c/u
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(item.unit_price * item.quantity, item.product.currency)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.line_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.line_id, item.quantity + 1)}
                          disabled={item.quantity >= 5}
                          className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-colors ${
                            item.quantity >= 5 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'hover:bg-gray-50'
                          }`}
                          title={item.quantity >= 5 ? 'Máximo 5 unidades por producto' : ''}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {item.quantity >= 5 && (
                        <span className="text-xs text-orange-600 ml-2">Máx. 5 uds.</span>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.line_id)}
                        className="text-red-600 hover:text-red-700 p-2 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">{uiCfg.checkoutOrderTitle}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>{uiCfg.cartPageSubtotalLabel}</span>
                  <span>{formatPrice(cart.subtotal, cart.currency)}</span>
                </div>
                {includedTaxAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IVA incluido</span>
                    <span>{formatPrice(includedTaxAmount, cart.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>{shippingCfg.label}</span>
                  <span className={shippingAmount > 0 ? 'text-foreground' : 'text-green-600'}>
                    {shippingAmount > 0 ? formatPrice(shippingAmount, cart.currency) : shippingCfg.freeLabel}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{uiCfg.cartPageTotalLabel}</span>
                    <span className="text-blue-600">{formatPrice(totalWithShipping, cart.currency)}</span>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
              >
                {uiCfg.cartPageCheckoutLabel}
              </button>
              


              {/* Security Features */}
              <div className="mt-6 pt-6 border-t">
                <div className="text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-4 mb-2">
                    <span>🔒 {uiCfg.cartPageSSLBadge}</span>
                    <span>🚚 {uiCfg.cartPageShippingBadge}</span>
                  </div>
                  <p>{uiCfg.cartPageSSLDesc}</p>
                  <p className="mt-2 text-xs">
                    Al continuar aceptas nuestros{' '}
                    <Link to="/terminos" className="text-blue-600 hover:underline">
                      Términos y Condiciones
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
