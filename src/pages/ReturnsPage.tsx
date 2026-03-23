/**
 * Página de Devoluciones y Cambios
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, MessageCircle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { getContactConfig } from '@/config/runtime';

const contact = getContactConfig();
const WHATSAPP_LINK = contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : '';

export const ReturnsPage: React.FC = () => {
  const handleWhatsAppReturn = () => {
    const message = 'Hola, necesito gestionar una devolución/cambio. Mi número de orden es: ';
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
            <RefreshCw className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Devoluciones y Cambios
            </h1>
          </div>
          <p className="text-primary-foreground/90 mt-2">
            Gestiona devoluciones, cambios y garantías de manera simple
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
              Inicia tu Devolución por WhatsApp
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Nuestro equipo te guiará en todo el proceso de manera rápida y sencilla
            </p>
            <button
              onClick={handleWhatsAppReturn}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors inline-flex items-center space-x-2 shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
              <span>Gestionar por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Política de Devoluciones */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Política de Devoluciones</h2>
            
            <div className="space-y-6">
              
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Plazo de Devolución</h3>
                  <p className="text-muted-foreground">
                    Tienes <strong>10 días corridos</strong> desde la recepción del producto para 
                    solicitar un cambio o devolución, según la Ley de Defensa del Consumidor (Ley 24.240).
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Condiciones del Producto</h3>
                  <p className="text-muted-foreground">
                    El producto debe estar en su embalaje original, sin uso, con todos sus 
                    accesorios, manuales y elementos incluidos. No debe presentar daños físicos 
                    ni señales de instalación.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Reembolso</h3>
                  <p className="text-muted-foreground">
                    Una vez recibido y verificado el producto, procesaremos el reembolso en un 
                    plazo de 5 a 10 días hábiles. El reembolso se realizará por el mismo medio 
                    de pago utilizado en la compra.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Cambios</h3>
                  <p className="text-muted-foreground">
                    Si prefieres un cambio por otro producto, coordinaremos el envío del nuevo 
                    artículo una vez recibido el producto original. Sujeto a disponibilidad de stock.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Proceso de Devolución */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">¿Cómo realizar una devolución?</h2>
            
            <div className="space-y-6">
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contacta por WhatsApp</h3>
                  <p className="text-muted-foreground">
                    Envía un mensaje a nuestro WhatsApp ({getContactConfig().phone}) indicando:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 ml-4 space-y-1">
                    <li>Número de pedido</li>
                    <li>Producto a devolver</li>
                    <li>Motivo de la devolución</li>
                    <li>Si prefieres cambio o reembolso</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Autorización</h3>
                  <p className="text-muted-foreground">
                    Nuestro equipo evaluará tu solicitud y te proporcionará un código de 
                    autorización de devolución (RMA) junto con las instrucciones de envío.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Envío del Producto</h3>
                  <p className="text-muted-foreground">
                    Empaca el producto de forma segura e incluye el código RMA en el paquete. 
                    Coordinaremos la logística de retiro o te indicaremos la dirección de envío.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-orange-600 font-bold text-lg">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Verificación y Proceso</h3>
                  <p className="text-muted-foreground">
                    Una vez recibido, verificaremos el estado del producto y procesaremos el 
                    cambio o reembolso según lo acordado. Te mantendremos informado por WhatsApp.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Productos No Retornables */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex items-start space-x-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold">Productos No Retornables</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Por razones de higiene, seguridad o naturaleza del producto, los siguientes 
              artículos no pueden ser devueltos:
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Productos con embalaje abierto o precinto de seguridad violado</li>
              <li>Productos con señales de uso o instalación</li>
              <li>Productos personalizados o fabricados bajo pedido</li>
              <li>Software con licencia activada</li>
              <li>Productos con daños causados por mal uso del cliente</li>
            </ul>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Si el producto presenta defectos de fábrica o 
                  daños durante el envío, está cubierto por nuestra garantía sin importar 
                  estas restricciones. Contacta inmediatamente por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Garantía */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Garantía de Productos</h2>
            
            <p className="text-muted-foreground mb-4">
              Todos nuestros productos cuentan con garantía oficial del fabricante. Los plazos 
              varían según el producto:
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span><strong>SSDs y Memorias RAM:</strong> 3 a 5 años (según fabricante)</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span><strong>Componentes en general:</strong> 1 a 3 años</span>
              </div>
            </div>

            <p className="text-muted-foreground mt-4">
              Para hacer uso de la garantía, contacta por WhatsApp con:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 ml-4 space-y-1">
              <li>Factura de compra</li>
              <li>Número de serie del producto</li>
              <li>Descripción del problema</li>
            </ul>
          </div>
        </div>

        {/* CTA Final */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-muted/30 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-3">¿Tienes dudas sobre devoluciones?</h3>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo está disponible para ayudarte con cualquier consulta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Centro de Ayuda
              </Link>
              <button
                onClick={handleWhatsAppReturn}
                className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
