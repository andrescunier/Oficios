/**
 * Página de checkout/finalización de compra
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, User, Mail, Phone, Lock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderService } from '@/services/orderService';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  paymentMethod: 'credit' | 'debit' | 'mercadopago' | 'transferencia';
}

// Función para obtener datos del usuario desde múltiples fuentes
const getUserData = () => {
  // Intentar obtener de registration_data (datos del registro)
  const registrationData = localStorage.getItem('registration_data');
  if (registrationData) {
    try {
      return JSON.parse(registrationData);
    } catch (e) {
      console.error('Error parsing registration data:', e);
    }
  }
  return null;
};

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart, addNotification, auth } = useStore();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener datos guardados del registro
  const savedUserData = getUserData();

  // Pre-llenar datos del usuario logueado (prioridad: person > savedUserData > vacío)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: auth.user?.person?.first_name || savedUserData?.first_name || '',
    lastName: auth.user?.person?.last_name || savedUserData?.last_name || '',
    email: auth.user?.email || '',
    phone: auth.user?.person?.phone || savedUserData?.phone || '',
    address: savedUserData?.address || '',
    city: savedUserData?.city || '',
    state: savedUserData?.state || '',
    zipCode: savedUserData?.zipCode || '',
    country: 'Argentina'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    paymentMethod: 'transferencia'
  });

  const formatPrice = (price: number, currency?: string) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return 'Precio no disponible';
    }
    const currencyCode = currency || 'USD';
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Redirigir al login si no está autenticado
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Iniciar Sesión Requerido</h2>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para realizar una compra</p>
          <div className="space-x-4">
            <Link 
              to="/login" 
              state={{ from: '/checkout' }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/registro" 
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors inline-block"
            >
              Registrarse
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
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo]) {
        addNotification({
          type: 'error',
          title: 'Campo requerido',
          message: `Por favor completa el campo ${field}`,
        });
        return false;
      }
    }
    
    // Guardar datos del usuario para próximas compras
    const userData = {
      first_name: shippingInfo.firstName,
      last_name: shippingInfo.lastName,
      phone: shippingInfo.phone,
      // También guardar dirección para próximas compras
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode
    };
    localStorage.setItem('registration_data', JSON.stringify(userData));
    
    return true;
  };

  const validatePayment = () => {
    // Solo transferencia bancaria disponible, siempre válido
    return true;
  };

  const handleFinalizeOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Preparar datos del checkout con la nueva estructura
      // El servicio se encarga de:
      // 1. Crear el BusinessPartner
      // 2. Crear la orden con el ID del BusinessPartner
      // 3. Crear el pago
      const checkoutData = {
        shippingInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        items: cart.items.map(item => ({
          product_id: item.product.id,
          description: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.unit_price,
          tax_rate: item.product.tax_rate || 21.0
        })),
        currency: "USD",
        totalAmount: cart.total_amount,
        paymentMethod: paymentInfo.paymentMethod,
        notes: `Pedido web - ${shippingInfo.firstName} ${shippingInfo.lastName}`
      };

      const result = await orderService.processCheckout(checkoutData);
      
      // Verificar que todas las operaciones fueron exitosas
      if (result.success && result.salesOrder && result.payment) {
        // Pago exitoso
        addNotification({
          type: 'success',
          title: '¡Pedido procesado exitosamente! 🎉',
          message: `Tu orden ${result.orderNumber} ha sido creada. Te contactaremos pronto con novedades de tu pedido.`,
        });

        // Limpiar carrito
        clearCart();
        
        // Redirigir con información de éxito
        setTimeout(() => {
          navigate('/', { 
            state: { 
              orderSuccess: true, 
              orderNumber: result.orderNumber,
              paymentNumber: result.paymentNumber,
              customerEmail: shippingInfo.email,
              totalAmount: cart.total_amount
            } 
          });
        }, 3000);
        
      } else {
        // Error en el procesamiento
        const errorStep = result.error?.step || 'unknown';
        let errorMessage = result.message || 'Error al procesar el pedido';
        
        if (errorStep === 'business_partner') {
          errorMessage = 'No pudimos crear tu cuenta de cliente. Por favor intenta nuevamente.';
        } else if (errorStep === 'order') {
          errorMessage = 'No pudimos crear tu orden. Por favor intenta nuevamente.';
        } else if (errorStep === 'payment') {
          errorMessage = 'Tu orden fue creada pero hubo un problema con el pago. Te contactaremos pronto.';
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error: any) {
      let errorTitle = 'Error al procesar el pedido';
      let errorMessage = error.message || 'Hubo un problema procesando tu pedido. Por favor intenta nuevamente.';
      
      // Personalizar mensaje según el tipo de error
      if (error.response?.status === 400) {
        errorTitle = 'Datos inválidos';
        errorMessage = 'Por favor revisa la información ingresada e intenta nuevamente.';
      } else if (error.response?.status === 401) {
        errorTitle = 'Error de autenticación';
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      } else if (error.response?.status === 402) {
        errorTitle = 'Pago rechazado';
        errorMessage = 'El pago fue rechazado. Verifica los datos de tu tarjeta o prueba con otro método de pago.';
      } else if (error.response?.status === 409) {
        errorTitle = 'Orden duplicada';
        errorMessage = 'Esta orden ya fue procesada. Revisa tu email para confirmar.';
      } else if (error.response?.status >= 500) {
        errorTitle = 'Error del servidor';
        errorMessage = 'El servidor de pagos no está disponible. Intenta más tarde o contacta a soporte.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No hay conexión con el servidor. Verifica tu internet e intenta nuevamente.';
      } else if (error.message?.includes('timeout')) {
        errorTitle = 'Tiempo agotado';
        errorMessage = 'La operación tardó demasiado. Tu pago puede estar siendo procesado, revisa tu email.';
      }
      
      addNotification({
        type: 'error',
        title: errorTitle,
        message: `${errorMessage} Si el problema persiste, contacta a nuestro soporte con el código de error: ${error.response?.status || 'UNKNOWN'}`,
      });
      
    } finally {
      setIsProcessing(false);
    }
  };

  // Si el carrito está vacío, redirigir
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carrito vacío</h2>
          <p className="text-gray-600 mb-6">No tienes productos en tu carrito para procesar</p>
          <Link 
            to="/productos" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Productos
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
              <h1 className="text-2xl font-bold">Finalizar Compra</h1>
              {/* Indicador de usuario logueado */}
              {auth.user && (
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <User className="w-4 h-4 mr-1" />
                  <span>Sesión iniciada como: <strong>{auth.user.username}</strong></span>
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
                <span className="ml-2 font-medium">Envío</span>
              </div>
              
              <div className={`w-16 h-1 ${currentStep === 'payment' || currentStep === 'review' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : currentStep === 'review' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-blue-600 text-white' : currentStep === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Pago</span>
              </div>
              
              <div className={`w-16 h-1 ${currentStep === 'review' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Revisar</span>
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
                  <h2 className="text-lg font-semibold">Información de Envío</h2>
                </div>

                {/* Mostrar datos del usuario registrado */}
                {auth.user && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-blue-600 mr-2" />
                      <h3 className="font-medium text-blue-800">Datos de tu cuenta</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
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
                    <h3 className="font-medium text-gray-800 mb-4">📦 Dirección de Entrega</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        placeholder="Ej: CABA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
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
                    Continuar al Pago
                  </button>
                </form>
              </div>
            )}

            {/* Payment Information */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold">Información de Pago</h2>
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                    <div className="w-full">
                      <div className="flex items-center p-4 border-2 border-blue-500 bg-blue-50 rounded-lg">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transferencia"
                          checked={true}
                          readOnly
                          className="mr-3 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-blue-800">Transferencia Bancaria</span>
                          <p className="text-sm text-blue-600 mt-1">
                            💳 Método de pago seguro y directo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información de transferencia */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">📋 Datos para la Transferencia</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-700">Banco:</span>
                          <p className="text-gray-600">Banco Galicia</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Titular:</span>
                          <p className="text-gray-600">DIAP INGENIERÍA S.A.</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">CBU:</span>
                          <p className="text-gray-600 font-mono">0070999930004567891234</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Alias:</span>
                          <p className="text-gray-600">DIAPSTORE.PAGOS</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>📝 Importante:</strong> Una vez realizada la transferencia, envía el comprobante por WhatsApp al +54 9 11 1234-5678 con tu número de orden para acelerar la confirmación.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('shipping')}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Revisar Pedido
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Order Review */}
            {currentStep === 'review' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-6">Revisar tu Pedido</h2>
                
                {/* Shipping Info Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Información de Envío</h3>
                  <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                  <p>{shippingInfo.email}</p>
                  <p>{shippingInfo.phone}</p>
                </div>
                
                {/* Payment Info Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Método de Pago</h3>
                  <div className="flex items-center">
                    <span className="text-blue-600 font-medium">💳 Transferencia Bancaria</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Se te proporcionarán los datos bancarios para realizar la transferencia.
                  </p>
                </div>
                
                {/* Products Review */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Productos</h3>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <img
                          src={item.product.image_url || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.product.unit_price * item.quantity, item.product.currency)}</p>
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
                    Volver
                  </button>
                  <button
                    onClick={handleFinalizeOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Procesando pago y creando orden...
                      </div>
                    ) : (
                      '🛒 Finalizar Compra'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image_url || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.product.unit_price * item.quantity, item.product.currency)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-6 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal, cart.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (21%)</span>
                  <span>{formatPrice(cart.tax_amount, cart.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(cart.total_amount, cart.currency)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <span>🔒 Pago seguro</span>
                  <span>🚚 Envío gratis</span>
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