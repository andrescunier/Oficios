/**
 * Página de checkout/finalización de compra
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, User, Mail, Phone, Lock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { orderService } from '@/services/orderService';
import type { CreateSalesOrderRequest, CreatePaymentRequest } from '@/services/orderService';

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

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart, addNotification } = useStore();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Argentina'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    paymentMethod: 'credit'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
    return true;
  };

  const validatePayment = () => {
    if (paymentInfo.paymentMethod === 'credit' || paymentInfo.paymentMethod === 'debit') {
      if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.cardName) {
        addNotification({
          type: 'error',
          title: 'Datos de tarjeta incompletos',
          message: 'Por favor completa todos los datos de la tarjeta',
        });
        return false;
      }
    }
    return true;
  };

  const handleFinalizeOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Generar números únicos
      const orderNumber = orderService.generateOrderNumber();
      const paymentNumber = orderService.generatePaymentNumber(orderNumber);
      
      // ID de cliente temporal (en producción esto vendría del usuario autenticado)
      const customerId = "d8f5287d-a430-4ec7-8f4c-5d64482358e3";
      
      // Preparar datos de la orden
      const orderData: CreateSalesOrderRequest = {
        order_number: orderNumber,
        customer_id: customerId,
        currency: "ARS", // Cambiado a ARS ya que los precios están en pesos argentinos
        status: "pending",
        items: cart.items.map(item => ({
          product_id: item.product.id,
          description: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.unit_price,
          tax_rate: item.product.tax_rate || 21.0
        })),
        notes: `Entrega a: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}. Tel: ${shippingInfo.phone}`,
        metadata: {
          channel: "online",
          shipping_info: shippingInfo,
          payment_method: paymentInfo.paymentMethod
        }
      };

      // Preparar datos del pago
      const paymentData: Omit<CreatePaymentRequest, 'partner_id'> = {
        payment_number: paymentNumber,
        source_type: "customer",
        currency: "ARS",
        amount: cart.total_amount,
        method: orderService.mapPaymentMethod(paymentInfo.paymentMethod),
        reference: `TRX${orderNumber.replace('SO-', '')}`,
        status: "received", // En producción, esto dependería del método de pago
        metadata: {
          payment_method_details: paymentInfo.paymentMethod,
          card_last_four: paymentInfo.cardNumber ? paymentInfo.cardNumber.slice(-4) : null,
          customer_info: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email
          }
        }
      };

      console.log('🚀 Iniciando proceso de checkout...');
      console.log('📄 Datos de orden:', orderData);
      console.log('💳 Datos de pago:', paymentData);

      // Procesar checkout (orden + pago)
      const result = await orderService.processCheckout(orderData, paymentData);
      
      console.log('✅ Checkout completado:', result);

      // Verificar que ambas operaciones fueron exitosas
      if (result.success && result.salesOrder && result.payment) {
        // Pago exitoso
        addNotification({
          type: 'success',
          title: '¡Pago procesado exitosamente! 🎉',
          message: `Tu orden ${orderNumber} ha sido creada y tu pago ${paymentNumber} fue procesado correctamente. Te contactaremos pronto con novedades de tu pedido.`,
        });

        // Limpiar carrito
        clearCart();
        
        // Redirigir con información de éxito
        setTimeout(() => {
          navigate('/', { 
            state: { 
              orderSuccess: true, 
              orderNumber,
              paymentNumber,
              customerEmail: shippingInfo.email,
              totalAmount: cart.total_amount
            } 
          });
        }, 3000); // Dar más tiempo para que el usuario lea el mensaje
        
      } else {
        // Error en el procesamiento
        throw new Error('El pago no pudo ser procesado completamente');
      }
      
    } catch (error: any) {
      console.error('❌ Error en checkout:', error);
      
      let errorTitle = 'Error al procesar el pago';
      let errorMessage = 'Hubo un problema procesando tu pago. Por favor intenta nuevamente.';
      
      // Personalizar mensaje según el tipo de error
      if (error.response?.status === 400) {
        errorTitle = 'Datos inválidos';
        errorMessage = 'Por favor revisa la información ingresada e intenta nuevamente.';
      } else if (error.response?.status === 401) {
        errorTitle = 'Error de autenticación';
        errorMessage = 'Problema de autenticación con el sistema de pagos. Intenta nuevamente.';
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
      
      // Log detallado para debugging
      console.log('💡 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
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
            <h1 className="text-2xl font-bold">Finalizar Compra</h1>
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
                
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
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
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit"
                          checked={paymentInfo.paymentMethod === 'credit'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value as any})}
                          className="mr-2"
                        />
                        <span>Tarjeta de Crédito</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="debit"
                          checked={paymentInfo.paymentMethod === 'debit'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value as any})}
                          className="mr-2"
                        />
                        <span>Tarjeta de Débito</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mercadopago"
                          checked={paymentInfo.paymentMethod === 'mercadopago'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value as any})}
                          className="mr-2"
                        />
                        <span>MercadoPago</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transferencia"
                          checked={paymentInfo.paymentMethod === 'transferencia'}
                          onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value as any})}
                          className="mr-2"
                        />
                        <span>Transferencia</span>
                      </label>
                    </div>
                  </div>
                  
                  {(paymentInfo.paymentMethod === 'credit' || paymentInfo.paymentMethod === 'debit') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta *</label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento *</label>
                          <input
                            type="text"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                            placeholder="MM/AA"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la Tarjeta *</label>
                        <input
                          type="text"
                          value={paymentInfo.cardName}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </>
                  )}
                  
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
                  <p>{paymentInfo.paymentMethod === 'credit' ? 'Tarjeta de Crédito' : 
                      paymentInfo.paymentMethod === 'debit' ? 'Tarjeta de Débito' :
                      paymentInfo.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia'}</p>
                  {(paymentInfo.paymentMethod === 'credit' || paymentInfo.paymentMethod === 'debit') && (
                    <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                  )}
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
                          <p className="font-medium">{formatPrice(item.product.unit_price * item.quantity)}</p>
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
                    <p className="text-sm font-medium">{formatPrice(item.product.unit_price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-6 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(cart.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-4 mb-2">
                  <span>🔒 Pago seguro</span>
                  <span>🚚 Envío gratis</span>
                </div>
                <p>Compra protegida por SSL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};