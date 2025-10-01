/**
 * Página de contacto
 */

import React from 'react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contacto
          </h1>
          <p className="text-xl opacity-90">
            Estamos aquí para ayudarte
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">info@aimerican.pro</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold">Teléfono</p>
                    <p className="text-gray-600">+1 (786) 813-3980</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">Ubicación</p>
                    <p className="text-gray-600">Miami, USA</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🕒</span>
                  <div>
                    <p className="font-semibold">Horarios</p>
                    <p className="text-gray-600">Lun-Vie 9am - 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Envíanos un Mensaje</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu teléfono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mensaje</label>
                  <textarea 
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="¿En qué podemos ayudarte?"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};