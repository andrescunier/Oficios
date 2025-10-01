/**
 * Página principal simplificada para debugging
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testAccountId } from '@/services/test';

export const Home: React.FC = () => {
  useEffect(() => {
    // Ejecutar test al cargar la página
    console.log('🏠 Home component loaded');
    testAccountId();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section Simplificado */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              DEFEND YOUR WALLET. UPGRADE YOUR POWER!
            </h1>
            <h2 className="text-xl md:text-2xl mb-4 text-blue-100">
              Tecnología de vanguardia a precios justos
            </h2>
            <p className="text-lg mb-8 text-blue-50">
              SSDs, memoria RAM y componentes de alta calidad para potenciar tu equipo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/productos" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Explorar Productos
              </Link>
              <Link to="/categoria/ssd-m2" className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-400">
                Ver SSDs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600">Tecnología de vanguardia con envío gratuito</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Devolución Gratis</h3>
              <p className="text-gray-600">Hasta 30 días para devolver tu compra</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Compra Segura</h3>
              <p className="text-gray-600">Protegemos tus datos con la mejor tecnología</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Múltiples Pagos</h3>
              <p className="text-gray-600">Tarjetas, transferencia, efectivo y más</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explora por Categorías</h2>
            <p className="text-lg text-gray-600">
              Encuentra exactamente lo que necesitas para tu setup
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'SSDs M.2', link: '/categoria/ssd-m2' },
              { name: 'SSDs 2.5"', link: '/categoria/ssd-sata' },
              { name: 'DDR4', link: '/categoria/ddr4' },
              { name: 'DDR5', link: '/categoria/ddr5' },
              { name: 'Componentes', link: '/categoria/componentes' },
              { name: 'Gaming', link: '/categoria/gaming' },
            ].map((category, index) => (
              <Link key={index} to={category.link} className="group">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-200 flex items-center justify-center">
                        <span className="text-2xl">{category.name.charAt(0)}</span>
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¡No te pierdas nuestras ofertas!</h2>
          <p className="text-lg mb-8 opacity-90">
            Suscríbete a nuestro newsletter y recibe descuentos exclusivos
          </p>
          <div className="max-w-md mx-auto flex space-x-2 mb-8">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Suscribirse
            </button>
          </div>
          
          {/* Enlaces de autenticación */}
          <div className="flex justify-center space-x-4">
            <Link to="/carrito" className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Ver Carrito
            </Link>
            <Link to="/login" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/registro" className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-400">
              Registrarse
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};