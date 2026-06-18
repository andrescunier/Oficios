/**
 * Página de checkout/finalización de compra
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, CreditCard, Landmark, MapPin, User, Mail, Phone, Lock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PAYMENT_INFO, LEGAL, BUSINESS, SHIPPING } from '@/config/branding';
import { getBusinessConfig, getLoanConfig, getPaymentMethodsConfig, getUIConfig, getShippingConfig, getValidationConfig } from '@/config/runtime';
import { checkoutFieldRequiredMessage } from '@/lib/validationMessages';
import log from '@/lib/logger';
import {
  buildCheckoutPayload,
  buildInitialShippingInfo,
  getDefaultPaymentMethod,
  getCheckoutShippingCharge,
  type PaymentInfo,
  type ShippingInfo,
  validateShippingInfo,
} from '@/features/checkout/model';
import { buildLoanPaymentPlans, getPrimaryLoanPaymentPlan } from '@/features/checkout/loan';
import { calculateCartTaxSummary } from '@/features/cart/tax';
import { useCheckoutMutation } from '@/features/checkout/mutations';
import { isCheckoutSuccess, normalizeCheckoutFailure } from '@/features/checkout/result';
import { clearAuthSession, getBusinessPartnerId, getPersistedRegistrationDraft, saveRegistrationDraft } from '@/features/auth/session';
import { createCorrelationId, recordAppEvent } from '@/lib/observability';

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart, addNotification, auth } = useStore();
  const navigate = useNavigate();
  const checkoutMutation = useCheckoutMutation();
  
  const defaultPaymentMethod = useMemo(() => getDefaultPaymentMethod(), []);
  const paymentMethodsConfig = useMemo(() => getPaymentMethodsConfig(), []);
  const loanCfg = useMemo(() => getLoanConfig(), []);
  const shippingAmount = useMemo(() => getCheckoutShippingCharge(cart.subtotal), [cart.subtotal]);
  const totalWithShipping = cart.total_amount + shippingAmount;
  const taxSummary = useMemo(() => calculateCartTaxSummary(cart.items, getBusinessConfig().defaultTaxRate, false), [cart.items]);
  const loanPlans = useMemo(() => buildLoanPaymentPlans(totalWithShipping, loanCfg), [totalWithShipping, loanCfg]);
  const primaryLoanPlan = useMemo(() => getPrimaryLoanPaymentPlan(totalWithShipping, loanCfg), [totalWithShipping, loanCfg]);
  const loanCreditLimit = Math.max(loanCfg.maxAmount, totalWithShipping);
  const loanCreditBalance = Math.max(loanCreditLimit - totalWithShipping, 0);
  const loanCreditUsagePct = loanCreditLimit > 0 ? Math.min((totalWithShipping / loanCreditLimit) * 100, 100) : 0;
  
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener datos guardados del registro
  const savedUserData = getPersistedRegistrationDraft();

  const businessPartnerId = getBusinessPartnerId();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(buildInitialShippingInfo({
    authUser: auth.user,
    registrationDraft: savedUserData,
  }));

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    paymentMethod: defaultPaymentMethod,
  });

  const formatPrice = (price: number, currency?: string) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    const currencyCode = currency || BUSINESS.DEFAULT_CURRENCY;
    
    return new Intl.NumberFormat(BUSINESS.LOCALE, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(price);
  };

  const uiCfg = getUIConfig();

  const loanPaymentEnabled = paymentMethodsConfig.prestamo && loanCfg.enabled;

  const getPaymentReview = () => {
    if (paymentInfo.paymentMethod === 'prestamo') {
      return {
        label: uiCfg.paymentMethodLoan,
        className: 'text-primary font-medium',
        description: loanCfg.legalText,
      };
    }

    if (paymentInfo.paymentMethod === 'transferencia') {
      return {
        label: uiCfg.checkoutTransferLabel,
        className: 'text-blue-600 font-medium',
        description: 'Se te proporcionarán los datos bancarios para realizar la transferencia.',
      };
    }

    return {
      label: uiCfg.checkoutEfectivoLabel,
      className: 'text-green-600 font-medium',
      description: 'El pago se realizará en efectivo al momento de la entrega o retiro.',
    };
  };

  // Redirigir al login si no está autenticado
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">{getUIConfig().authRequiredTitle}</h2>
          <p className="text-gray-600 mb-6">{getValidationConfig().messages.checkoutAuthRequiredMessage}</p>
          <div className="space-x-4">
            <Link 
              to="/login" 
              state={{ from: '/checkout' }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              {getUIConfig().authLoginButtonLabel}
            </Link>
            <Link 
              to="/registro" 
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors inline-block"
            >
              {getUIConfig().authRegisterButtonLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setCurrentStep('payment');
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePayment()) {
      setCurrentStep('review');
    }
  };

  const validateShipping = () => {
    const result = validateShippingInfo(shippingInfo);
    if (!result.valid) {
      const v = getValidationConfig().messages;
      addNotification({
        type: 'error',
        title: v.checkoutFieldRequiredTitle,
        message: checkoutFieldRequiredMessage(result.missingField || ''),
      });
      return false;
    }
    
    saveRegistrationDraft({
      first_name: shippingInfo.firstName,
      last_name: shippingInfo.lastName,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode,
    });
    
    return true;
  };

  const validatePayment = () => {
    // Solo transferencia bancaria disponible, siempre válido
    return true;
  };

  const handleCheckoutFailure = (failure: ReturnType<typeof normalizeCheckoutFailure>, checkoutId?: string | null) => {
    recordAppEvent('checkout_failed', {
      checkoutId: checkoutId || null,
      code: failure.code,
      status: failure.status || null,
      orderNumber: failure.orderNumber || null,
      supportCode: failure.supportCode,
    });

    addNotification({
      type: 'error',
      title: failure.title,
      message: `${failure.message} Código: ${failure.supportCode}`,
      duration: 7000,
    });

    if (failure.shouldInvalidateSession) {
      clearAuthSession({
        redirect: failure.redirectTo || '/login?session=expired',
        preserveCart: true,
      });
      return;
    }

    if (failure.redirectTo) {
      navigate(failure.redirectTo, { replace: true });
    }
  };

  const handleFinalizeOrder = async () => {
    log.checkout.info('Iniciando checkout...');
    log.checkout.debug('Business Partner ID:', businessPartnerId);
    log.checkout.debug('Auth:', { isAuthenticated: auth.isAuthenticated, user: auth.user?.username });
    log.checkout.debug('Cart:', { items: cart.items.length, total: totalWithShipping, shippingAmount, currency: cart.currency });
    setIsProcessing(true);
    const checkoutId = createCorrelationId('chk');
    
    try {
      const checkoutData = buildCheckoutPayload({
        shippingInfo,
        items: cart.items,
        currency: cart.currency || BUSINESS.DEFAULT_CURRENCY,
        totalAmount: totalWithShipping,
        paymentMethod: paymentInfo.paymentMethod,
      });
      recordAppEvent('checkout_started', {
        checkoutId,
        items: cart.items.length,
        totalAmount: totalWithShipping,
        paymentMethod: paymentInfo.paymentMethod,
      });

      log.checkout.group('CheckoutData', () => console.log(JSON.stringify(checkoutData, null, 2)));
      const result = await checkoutMutation.mutateAsync({
        payload: checkoutData,
        businessPartnerId: businessPartnerId || undefined,
      });
      
      log.checkout.group('Resultado checkout', () => console.log(JSON.stringify(result, null, 2)));
      
      if (isCheckoutSuccess(result)) {
        recordAppEvent('checkout_succeeded', {
          checkoutId,
          orderNumber: result.orderNumber,
          paymentMethod: result.paymentMethod || paymentInfo.paymentMethod,
          paymentStatus: 'pending_backend_validation',
        });
        addNotification({
          type: 'success',
          title: 'Pedido recibido',
          message: `Tu orden ${result.orderNumber} fue creada y quedó pendiente de validación de pago por el backend.`,
        });

        // Guardar el total antes de limpiar el carrito
        const totalAmount = totalWithShipping;
        
        // Limpiar carrito
        clearCart();
        
        // Redirigir a página de éxito inmediatamente
        navigate('/pedido-exitoso', { 
          replace: true,
          state: { 
            orderSuccess: true, 
            orderNumber: result.orderNumber,
            paymentMethod: result.paymentMethod || paymentInfo.paymentMethod,
            loan: result.loan || null,
            customerEmail: shippingInfo.email,
            totalAmount: totalAmount
          } 
        });
      } else {
        handleCheckoutFailure(normalizeCheckoutFailure(result), checkoutId);
      }
      
    } catch (error: any) {
      handleCheckoutFailure(normalizeCheckoutFailure(error), checkoutId);
    } finally {
      setIsProcessing(false);
    }
  };

  // Si el carrito está vacío, redirigir
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{uiCfg.checkoutCartEmptyTitle}</h2>
          <p className="text-gray-600 mb-6">{uiCfg.checkoutCartEmptyMsg}</p>
          <Link 
            to="/productos" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {uiCfg.checkoutViewProductsLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{uiCfg.checkoutTitle}</h1>
              {/* Indicador de usuario logueado */}
              {auth.user && (
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <User className="w-4 h-4 mr-1" />
                  <span>
                    Sesión iniciada como: <strong>{auth.user.username}</strong></span>
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✓ Autenticado</span>
                </div>
              )}
            </div>
            <Link 
              to="/carrito" 
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Carrito
            </Link>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${currentStep === 'shipping' ? 'text-blue-600' : currentStep === 'payment' || currentStep === 'review' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-blue-600 text-white' : currentStep === 'payment' || currentStep === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">{uiCfg.checkoutStepShipping}</span>
              </div>
              
              <div className={`w-16 h-1 ${currentStep === 'payment' || currentStep === 'review' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : currentStep === 'review' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-blue-600 text-white' : currentStep === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">{uiCfg.checkoutStepPayment}</span>
              </div>
              
              <div className={`w-16 h-1 ${currentStep === 'review' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">{uiCfg.checkoutStepReview}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            
            {/* Shipping Information */}
            {currentStep === 'shipping' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold">{uiCfg.checkoutShippingTitle}</h2>
                </div>

                {/* Mostrar datos del usuario registrado */}
                {auth.user && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-blue-600 mr-2" />
                      <h3 className="font-medium text-blue-800">{uiCfg.checkoutAccountDataTitle}</h3>
                    </div>
                    <div className="text-sm text-blue-700">
                      <p><strong>Usuario:</strong> {auth.user.username}</p>
                      <p><strong>Email:</strong> {auth.user.email}</p>
                      {(shippingInfo.firstName || shippingInfo.lastName) && (
                        <p><strong>Nombre:</strong> {shippingInfo.firstName} {shippingInfo.lastName}</p>
                      )}
                      {shippingInfo.phone && <p><strong>Teléfono:</strong> {shippingInfo.phone}</p>}
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldFirst} *</label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tu nombre"
                        required
                      />
                      {shippingInfo.firstName && (
                        <p className="text-xs text-gray-500 mt-1">✓ Datos de tu cuenta</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldLast} *</label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tu apellido"
                        required
                      />
                      {shippingInfo.lastName && (
                        <p className="text-xs text-gray-500 mt-1">✓ Datos de tu cuenta</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldEmail} *</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      disabled={!!auth.user?.email}
                      required
                    />
                    {auth.user?.email && (
                      <p className="text-xs text-gray-500 mt-1">✓ Email de tu cuenta (no editable)</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldPhone} *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: +54 9 11 1234-5678"
                      required
                    />
                    {shippingInfo.phone && (
                      <p className="text-xs text-gray-500 mt-1">✓ Datos de tu cuenta</p>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 mt-6">
                    <h3 className="font-medium text-gray-800 mb-4">📦 {uiCfg.checkoutAddressTitle}</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldAddress} *</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      placeholder="Ej: Av. Corrientes 1234, Piso 5, Depto B"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldCity} *</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        placeholder="Ej: Buenos Aires"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldState}</label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        placeholder="Ej: CABA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{uiCfg.checkoutFieldZip} *</label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        placeholder="Ej: 1001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {uiCfg.checkoutContinueToPayment}
                  </button>
                </form>
              </div>
            )}

            {/* Payment Information */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold">{uiCfg.checkoutPaymentTitle}</h2>
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{uiCfg.checkoutPaymentMethodLabel}</label>
                    <div className="space-y-3">
                      {/* Prestamo */}
                      {loanPaymentEnabled && (
                      <div 
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentInfo.paymentMethod === 'prestamo' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-primary/40'
                        }`}
                        onClick={() => setPaymentInfo({...paymentInfo, paymentMethod: 'prestamo'})}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="prestamo"
                          checked={paymentInfo.paymentMethod === 'prestamo'}
                          onChange={() => setPaymentInfo({...paymentInfo, paymentMethod: 'prestamo'})}
                          className="mr-3 text-primary"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-primary">{uiCfg.paymentMethodLoan}</span>
                          <p className="text-sm text-gray-600 mt-1">{loanCfg.subtitle}</p>
                        </div>
                      </div>
                      )}

                      {/* Transferencia Bancaria */}
                      {paymentMethodsConfig.transferencia && (
                      <div 
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentInfo.paymentMethod === 'transferencia' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setPaymentInfo({...paymentInfo, paymentMethod: 'transferencia'})}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transferencia"
                          checked={paymentInfo.paymentMethod === 'transferencia'}
                          onChange={() => setPaymentInfo({...paymentInfo, paymentMethod: 'transferencia'})}
                          className="mr-3 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-blue-800">{uiCfg.checkoutTransferLabel}</span>
                          <p className="text-sm text-gray-600 mt-1">
                            💳 {uiCfg.checkoutTransferDesc}
                          </p>
                        </div>
                      </div>
                      )}
                      
                      {/* Efectivo */}
                      {paymentMethodsConfig.efectivo && (
                      <div 
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentInfo.paymentMethod === 'efectivo' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setPaymentInfo({...paymentInfo, paymentMethod: 'efectivo'})}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="efectivo"
                          checked={paymentInfo.paymentMethod === 'efectivo'}
                          onChange={() => setPaymentInfo({...paymentInfo, paymentMethod: 'efectivo'})}
                          className="mr-3 text-green-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-green-800">{uiCfg.checkoutEfectivoLabel}</span>
                          <p className="text-sm text-gray-600 mt-1">
                            💵 {uiCfg.checkoutEfectivoDesc}
                          </p>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>

                  {/* Información de préstamo */}
                  {paymentInfo.paymentMethod === 'prestamo' && loanPaymentEnabled && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calculator className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{loanCfg.title}</h3>
                        <p className="text-sm text-gray-600">{loanCfg.subtitle}</p>
                      </div>
                    </div>
                    <div className="mb-4 rounded-lg border border-primary/10 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Crédito disponible</p>
                          <p className="text-2xl font-semibold text-gray-900">{formatPrice(loanCreditLimit, cart.currency)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-gray-500">Saldo luego de comprar</p>
                          <p className="text-lg font-semibold text-primary">{formatPrice(loanCreditBalance, cart.currency)}</p>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${loanCreditUsagePct}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Monto usado: {formatPrice(totalWithShipping, cart.currency)}</span>
                        <span>{loanCreditUsagePct.toFixed(0)}% del crédito</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">{loanCfg.termsTitle}</p>
                      {loanPlans.map((plan) => (
                        <div key={plan.months} className="grid grid-cols-3 gap-2 rounded-md border border-primary/10 bg-white px-3 py-2 text-sm">
                          <span className="font-medium text-gray-800">{plan.label}</span>
                          <span className="text-right text-gray-600">
                            {loanCfg.amountLabel}: <strong className="text-primary">{formatPrice(plan.monthlyPayment, cart.currency)}</strong>
                          </span>
                          <span className="text-right text-gray-600">
                            {loanCfg.totalLabel}: <strong>{formatPrice(plan.totalFinanced, cart.currency)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">{loanCfg.legalText}</p>
                  </div>
                  )}
                  
                  {/* Información de transferencia */}
                  {paymentInfo.paymentMethod === 'transferencia' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">📋 {uiCfg.checkoutTransferInfoTitle}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-700">{uiCfg.checkoutBankLabel}:</span>
                          <p className="text-gray-600">{PAYMENT_INFO.BANK_NAME}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{uiCfg.checkoutHolderLabel}:</span>
                          <p className="text-gray-600">{PAYMENT_INFO.ACCOUNT_HOLDER}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{uiCfg.checkoutCbuLabel}:</span>
                          <p className="text-gray-600 font-mono">{PAYMENT_INFO.CBU}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{uiCfg.checkoutAliasLabel}:</span>
                          <p className="text-gray-600">{PAYMENT_INFO.ALIAS}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>📝 Importante:</strong> {uiCfg.checkoutTransferImportantNote.replace('{wa}', PAYMENT_INFO.WA_VERIFICATION)} al {PAYMENT_INFO.WA_VERIFICATION}
                      </p>
                    </div>
                  </div>
                  )}
                  
                  {/* Información de efectivo */}
                  {paymentInfo.paymentMethod === 'efectivo' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">💵 {uiCfg.checkoutEfectivoInfoTitle}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• El pago se realizará al momento de recibir tu pedido</p>
                      <p>• Asegurate de tener el monto exacto disponible</p>
                      <p>• Nuestro equipo coordinará la entrega contigo</p>
                    </div>
                    <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                      <p className="text-sm text-green-800">
                        <strong>✅ Nota:</strong> {uiCfg.checkoutEfectivoNote}
                      </p>
                    </div>
                  </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('shipping')}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      {uiCfg.checkoutBackButton}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {uiCfg.checkoutReviewTitle}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Order Review */}
            {currentStep === 'review' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6">{uiCfg.checkoutReviewTitle}</h2>
                
                {/* Shipping Info Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">{uiCfg.checkoutShippingTitle}</h3>
                  <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                  <p>{shippingInfo.email}</p>
                  <p>{shippingInfo.phone}</p>
                </div>
                
                {/* Payment Info Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">{uiCfg.checkoutPaymentMethodLabel}</h3>
                  <div className="flex items-center">
                    <span className={getPaymentReview().className}>{getPaymentReview().label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{getPaymentReview().description}</p>
                  {paymentInfo.paymentMethod === 'prestamo' && loanPaymentEnabled && primaryLoanPlan && (
                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-gray-500">Crédito disponible</p>
                          <p className="font-semibold text-gray-900">{formatPrice(loanCreditLimit, cart.currency)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Monto a financiar</p>
                          <p className="font-semibold text-gray-900">{formatPrice(totalWithShipping, cart.currency)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Saldo restante</p>
                          <p className="font-semibold text-primary">{formatPrice(loanCreditBalance, cart.currency)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-700">
                        Plan elegido por defecto: <strong>{primaryLoanPlan.label}</strong> de <strong>{formatPrice(primaryLoanPlan.monthlyPayment, cart.currency)}</strong>. Total financiado: <strong>{formatPrice(primaryLoanPlan.totalFinanced, cart.currency)}</strong>.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Products Review */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Productos</h3>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.line_id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <img
                          src={item.product.image_url || '/placeholder-product.svg'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.variant?.name || item.product.name}</h4>
                          <p className="text-xs text-gray-400">SKU: {item.variant?.sku || item.product.sku}</p>
                          {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                            <p className="text-xs text-gray-500">
                              {Object.entries(item.selected_options).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.unit_price * item.quantity, item.product.currency)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('payment')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    {uiCfg.checkoutBackButton}
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {uiCfg.checkoutFinalizingLabel}
                      </div>
                    ) : (
                      `🛒 ${uiCfg.checkoutFinalizeLabel}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">{uiCfg.checkoutOrderTitle}</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.line_id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image_url || '/placeholder-product.svg'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.variant?.name || item.product.name}</p>
                      {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                        <p className="text-xs text-gray-500 truncate">
                          {Object.entries(item.selected_options).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.unit_price * item.quantity, item.product.currency)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-6 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>{uiCfg.checkoutSubtotalLabel}</span>
                  <span>{formatPrice(cart.subtotal, cart.currency)}</span>
                </div>
                {taxSummary.includedTaxAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IVA incluido</span>
                    <span>{formatPrice(taxSummary.includedTaxAmount, cart.currency)}</span>
                  </div>
                )}
                {taxSummary.addedTaxAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IVA</span>
                    <span>{formatPrice(taxSummary.addedTaxAmount, cart.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>{getShippingConfig().label}</span>
                  <span className={shippingAmount > 0 ? 'text-foreground' : 'text-green-600'}>
                    {shippingAmount > 0 ? formatPrice(shippingAmount, cart.currency) : getShippingConfig().freeLabel}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{uiCfg.checkoutTotalLabel}</span>
                    <span className="text-blue-600">{formatPrice(totalWithShipping, cart.currency)}</span>
                  </div>
                </div>
              </div>

              {loanPaymentEnabled && primaryLoanPlan && (
                <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{loanCfg.badgeLabel}</p>
                      <p className="text-sm text-gray-600">
                        {primaryLoanPlan.label} de <span className="font-semibold text-primary">{formatPrice(primaryLoanPlan.monthlyPayment, cart.currency)}</span>
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between gap-3">
                          <span>Crédito disponible</span>
                          <strong>{formatPrice(loanCreditLimit, cart.currency)}</strong>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>Monto usado</span>
                          <strong>{formatPrice(totalWithShipping, cart.currency)}</strong>
                        </div>
                        <div className="flex justify-between gap-3 text-primary">
                          <span>Saldo restante</span>
                          <strong>{formatPrice(loanCreditBalance, cart.currency)}</strong>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{loanCfg.legalText}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <span>🔒 Pago seguro</span>
                  <span>🚚 {shippingAmount > 0 ? SHIPPING.CHARGED_MESSAGE : SHIPPING.DRAWER_MESSAGE}</span>
                </div>
                <p>Compra protegida por SSL</p>
                <p className="mt-2 text-xs">
                  Al finalizar tu compra aceptas nuestros{' '}
                  <Link to="/terminos" className="text-primary hover:underline">
                    Términos y Condiciones
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
