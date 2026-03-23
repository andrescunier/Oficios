/**
 * Página de Seguimiento de Pedido
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { getContactConfig } from '@/config/runtime';

const contact = getContactConfig();
const WHATSAPP_LINK = contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : '';

export const OrderTracking: React.FC = () => {
  const handleWhatsAppTracking = () => {
    const message = 'Hola, quiero consultar el estado de mi pedido. Mi número de orden es: ';
    window.open(`${WHATSAPP_LINK}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Seguimiento de Pedido
            </h1>
          </div>
          <p className="text-primary-foreground/90 mt-2">
            Consulta el estado de tu pedido en tiempo real
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        
        {/* WhatsApp CTA */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-xl p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">
              Consulta tu Pedido por WhatsApp
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Nuestro equipo te brindará información actualizada sobre el estado de tu pedido
            </p>
            <button
              onClick={handleWhatsAppTracking}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors inline-flex items-center space-x-2 shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
              <span>Consultar por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Información del proceso */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">¿Cómo funciona el seguimiento?</h2>
            
            <div className="space-y-6">
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Número de Pedido</h3>
                  <p className="text-muted-foreground">
                    Una vez confirmada tu compra, recibirás un número de pedido único por email 
                    y WhatsApp. Guarda este número para futuras consultas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contacta por WhatsApp</h3>
                  <p className="text-muted-foreground">
                    Envía un mensaje a nuestro WhatsApp oficial ({getContactConfig().phone}) con tu 
                    número de pedido. Nuestro equipo te responderá de inmediato.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Estado en Tiempo Real</h3>
                  <p className="text-muted-foreground">
                    Te informaremos el estado actual de tu pedido: procesando, en preparación, 
                    despachado o en camino.
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Estados del Pedido
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span><strong>Procesando:</strong> Tu pedido está siendo verificado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>En Preparación:</strong> Estamos preparando tu pedido</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span><strong>Despachado:</strong> Tu pedido fue enviado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>Entregado:</strong> Tu pedido fue entregado exitosamente</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h2>
            
            <div className="space-y-4">
              
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold mb-2">¿Cuánto tarda en llegar mi pedido?</h3>
                <p className="text-muted-foreground text-sm">
                  Los tiempos de entrega varían según tu ubicación. Para CABA y GBA: 24-48hs. 
                  Interior del país: 3-7 días hábiles. Consulta tu caso específico por WhatsApp.
                </p>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="font-semibold mb-2">¿Puedo modificar mi pedido?</h3>
                <p className="text-muted-foreground text-sm">
                  Si tu pedido aún no fue despachado, podemos realizar modificaciones. 
                  Contáctanos inmediatamente por WhatsApp con tu número de pedido.
                </p>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="font-semibold mb-2">No recibí el número de pedido</h3>
                <p className="text-muted-foreground text-sm">
                  Revisa tu carpeta de spam/correo no deseado. Si no lo encuentras, 
                  contáctanos por WhatsApp con los datos de tu compra.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">¿Puedo retirar mi pedido en persona?</h3>
                <p className="text-muted-foreground text-sm">
                  Sí, ofrecemos retiro en nuestras oficinas. Consulta disponibilidad y 
                  horarios por WhatsApp al momento de realizar tu pedido.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <div className="bg-muted/30 rounded-lg p-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">¿Necesitas ayuda adicional?</h3>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo está disponible para resolver todas tus dudas
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ir a Centro de Ayuda
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
