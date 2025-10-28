/**
 * Página de Garantías
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, MessageCircle, FileCheck, AlertTriangle, Clock } from 'lucide-react';

const WHATSAPP_NUMBER = '5491126310884';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const WarrantyPage: React.FC = () => {
  const handleWhatsAppWarranty = () => {
    const message = 'Hola, necesito hacer uso de la garantía. Mi número de orden es: ';
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
            <Shield className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Garantías
            </h1>
          </div>
          <p className="text-primary-foreground/90 mt-2">
            Protección y respaldo para tus productos
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
              Activa tu Garantía por WhatsApp
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Nuestro equipo te guiará en el proceso de garantía de forma rápida
            </p>
            <button
              onClick={handleWhatsAppWarranty}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors inline-flex items-center space-x-2 shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
              <span>Activar por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Cobertura de Garantía */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Cobertura de Garantía</h2>
            
            <p className="text-muted-foreground mb-6">
              Todos nuestros productos cuentan con garantía oficial del fabricante. Cubrimos 
              defectos de fábrica y fallas en el funcionamiento normal del producto.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">SSDs</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong>Garantía:</strong> 3 a 5 años según modelo
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Cobertura:</strong> Defectos de fábrica, sectores dañados, fallas de lectura/escritura
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Marcas:</strong> Kingston, Samsung, Crucial, Western Digital
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <h3 className="font-semibold text-lg">Memorias RAM</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong>Garantía:</strong> 3 años (garantía de por vida en algunos modelos)
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Cobertura:</strong> Defectos de fábrica, incompatibilidad, fallas de rendimiento
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Marcas:</strong> Kingston, Corsair, G.Skill, Crucial
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ Garantía Total:</strong> En DIAP nos hacemos cargo de gestionar tu 
                garantía directamente con el fabricante. No necesitas contactar al proveedor 
                original, nosotros lo hacemos por ti.
              </p>
            </div>
          </div>
        </div>

        {/* Proceso de Garantía */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">¿Cómo hacer uso de la garantía?</h2>
            
            <div className="space-y-6">
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contacta por WhatsApp</h3>
                  <p className="text-muted-foreground">
                    Envía un mensaje a nuestro WhatsApp (+54 9 11 2631-0884) con:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 ml-4 space-y-1">
                    <li>Número de pedido o factura</li>
                    <li>Modelo del producto</li>
                    <li>Número de serie</li>
                    <li>Descripción detallada del problema</li>
                    <li>Fotos o videos del defecto (si es posible)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Diagnóstico Inicial</h3>
                  <p className="text-muted-foreground">
                    Nuestro equipo técnico evaluará el problema y te indicará si corresponde 
                    garantía. En algunos casos, podemos resolver el problema de forma remota 
                    con instrucciones técnicas.
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
                    Si es necesario enviar el producto para revisión, te proporcionaremos un 
                    código RMA y coordinaremos la logística de retiro sin costo adicional.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-orange-600 font-bold text-lg">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Reparación o Reemplazo</h3>
                  <p className="text-muted-foreground">
                    Dependiendo del caso, repararemos o reemplazaremos el producto. Si no hay 
                    stock del mismo modelo, te ofreceremos uno de características iguales o superiores.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-teal-100 rounded-full p-3 flex-shrink-0">
                  <span className="text-teal-600 font-bold text-lg">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Devolución del Producto</h3>
                  <p className="text-muted-foreground">
                    Una vez solucionado el problema, te enviaremos el producto reparado o el 
                    reemplazo. Te mantendremos informado durante todo el proceso por WhatsApp.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tiempos de Garantía */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex items-start space-x-3 mb-4">
              <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold">Tiempos de Procesamiento</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="font-semibold">Diagnóstico inicial</span>
                <span className="text-primary font-bold">24-48 horas</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="font-semibold">Reparación en servicio técnico</span>
                <span className="text-primary font-bold">5-15 días hábiles</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <span className="font-semibold">Reemplazo directo (stock disponible)</span>
                <span className="text-primary font-bold">2-5 días hábiles</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              * Los tiempos son estimados y pueden variar según disponibilidad y complejidad del caso.
            </p>
          </div>
        </div>

        {/* Exclusiones */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold">Exclusiones de Garantía</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              La garantía NO cubre los siguientes casos:
            </p>

            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-xl">×</span>
                <span className="text-muted-foreground">
                  Daños físicos causados por mal uso, caídas, golpes o líquidos
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-xl">×</span>
                <span className="text-muted-foreground">
                  Instalación incorrecta o uso inadecuado del producto
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-xl">×</span>
                <span className="text-muted-foreground">
                  Modificaciones o reparaciones realizadas por terceros no autorizados
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-xl">×</span>
                <span className="text-muted-foreground">
                  Desgaste normal por uso prolongado
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-xl">×</span>
                <span className="text-muted-foreground">
                  Productos con sellos de garantía violados o números de serie alterados
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-500 font-bold text-xl">×</span>
                <span className="text-muted-foreground">
                  Daños causados por sobretensión, cortes de energía o descargas eléctricas
                </span>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Para maximizar la vida útil de tus productos, sigue 
                las instrucciones del fabricante y mantén tus componentes en ambientes 
                adecuados (temperatura, humedad, etc.).
              </p>
            </div>
          </div>
        </div>

        {/* Documentación Requerida */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex items-start space-x-3 mb-4">
              <FileCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <h2 className="text-2xl font-bold">Documentación Requerida</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Para hacer uso de la garantía, necesitarás tener a mano:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-semibold">Factura de Compra</p>
                  <p className="text-sm text-muted-foreground">
                    Comprobante de compra original con fecha
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                <span className="text-2xl">🔢</span>
                <div>
                  <p className="font-semibold">Número de Serie</p>
                  <p className="text-sm text-muted-foreground">
                    Serial del producto (ubicado en la etiqueta)
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-semibold">Embalaje Original</p>
                  <p className="text-sm text-muted-foreground">
                    De ser posible, caja y accesorios originales
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                <span className="text-2xl">📸</span>
                <div>
                  <p className="font-semibold">Evidencia del Problema</p>
                  <p className="text-sm text-muted-foreground">
                    Fotos o videos que muestren la falla
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-muted/30 rounded-lg p-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">¿Necesitas activar tu garantía?</h3>
            <p className="text-muted-foreground mb-6">
              Estamos aquí para ayudarte. Contacta por WhatsApp y resolveremos tu problema.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleWhatsAppWarranty}
                className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Activar Garantía
              </button>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Centro de Ayuda
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
