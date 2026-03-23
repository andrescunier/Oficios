/**
 * Página de contacto - Centro de Ayuda
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, Clock, ArrowLeft, HelpCircle } from 'lucide-react';
import { CONTACT, BRANDING } from '@/config/branding';

const WHATSAPP_NUMBER = CONTACT.WHATSAPP;
const WHATSAPP_LINK = CONTACT.WHATSAPP_LINK;

export const ContactPage: React.FC = () => {
  const handleWhatsAppClick = (message: string) => {
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
            <HelpCircle className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Centro de Ayuda
            </h1>
          </div>
          <p className="text-primary-foreground/90 mt-2">
            Estamos aquí para asistirte en lo que necesites
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Canal Oficial WhatsApp */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-xl p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Canal Oficial de Atención
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Nuestro medio oficial de contacto es WhatsApp. Respuesta inmediata de nuestro equipo.
            </p>
            <button
              onClick={() => handleWhatsAppClick('Hola, necesito ayuda con...')}
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-colors inline-flex items-center space-x-2 shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
              <span>Chatear por WhatsApp</span>
            </button>
            <p className="mt-4 text-sm opacity-75">
              {CONTACT.PHONE}
            </p>
          </div>
        </div>

        {/* ¿Cómo podemos ayudarte? */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">¿Cómo podemos ayudarte?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Consultas de Productos</h3>
              <p className="text-muted-foreground text-sm mb-4">
                ¿Necesitas información sobre stock, especificaciones o disponibilidad?
              </p>
              <button
                onClick={() => handleWhatsAppClick('Hola, necesito información sobre un producto...')}
                className="text-primary hover:underline text-sm font-semibold"
              >
                Consultar por WhatsApp →
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Seguimiento de Pedido</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Consulta el estado de tu pedido y tiempos de entrega.
              </p>
              <button
                onClick={() => handleWhatsAppClick('Hola, quiero consultar el estado de mi pedido...')}
                className="text-primary hover:underline text-sm font-semibold"
              >
                Consultar seguimiento →
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Cotizaciones B2B</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Solicita cotizaciones personalizadas para empresas.
              </p>
              <button
                onClick={() => handleWhatsAppClick('Hola, necesito una cotización para...')}
                className="text-primary hover:underline text-sm font-semibold"
              >
                Solicitar cotización →
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Soporte Técnico</h3>
              <p className="text-muted-foreground text-sm mb-4">
                ¿Problemas técnicos? Nuestro equipo te asesora.
              </p>
              <button
                onClick={() => handleWhatsAppClick('Hola, necesito soporte técnico con...')}
                className="text-primary hover:underline text-sm font-semibold"
              >
                Obtener soporte →
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Devoluciones</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Gestiona cambios, devoluciones y garantías.
              </p>
              <button
                onClick={() => handleWhatsAppClick('Hola, necesito gestionar una devolución...')}
                className="text-primary hover:underline text-sm font-semibold"
              >
                Gestionar devolución →
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Otros Temas</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Cualquier otra consulta que necesites resolver.
              </p>
              <button
                onClick={() => handleWhatsAppClick('Hola, necesito ayuda con...')}
                className="text-primary hover:underline text-sm font-semibold"
              >
                Contactar ahora →
              </button>
            </div>

          </div>
        </div>

        {/* Información adicional */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex items-start space-x-3">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${CONTACT.SALES_EMAIL}`} className="text-muted-foreground hover:text-primary">
                    {CONTACT.SALES_EMAIL}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Teléfono / WhatsApp</p>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    {CONTACT.PHONE}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Dirección</p>
                  <p className="text-muted-foreground">
                    {CONTACT.ADDRESS}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Horario de Atención</p>
                  <p className="text-muted-foreground">
                    Lunes a Viernes: 9:00 - 18:00hs
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Sábados: 9:00 - 13:00hs
                  </p>
                </div>
              </div>
              
            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Para una atención más rápida y eficiente, te recomendamos 
                utilizar nuestro canal oficial de WhatsApp. Nuestro equipo está disponible para 
                responder todas tus consultas de manera inmediata.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};