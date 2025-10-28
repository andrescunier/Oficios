/**
 * Página Sobre Nosotros - Historia de la marca
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Award, TrendingUp } from 'lucide-react';
import { BRANDING } from '@/config/branding';

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Nacidos para combatir la mediocridad sobrevalorada
            </h1>
            <p className="text-2xl md:text-3xl font-semibold mb-8">
              Defiende tu billetera
            </p>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          </div>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                En el bullicioso corazón de Silicon Valley, entre imponentes rascacielos de acero y vidrio, 
                nació una fuerza poderosa. Impulsado por las frustraciones de los estadounidenses comunes 
                que luchan contra dispositivos sobrevalorados y tecnología de bajo rendimiento, un grupo de 
                ingenieros brillantes se unió bajo una misión única: <strong>proteger a los ciudadanos de 
                la tiranía de los precios altos y el rendimiento deficiente</strong>.
              </p>

              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Su innovación, coraje y espíritu inquebrantable dieron origen a un héroe sin igual: 
                <strong className="text-blue-600"> {BRANDING.APP_NAME}</strong>. Forjado con tecnología 
                estadounidense de vanguardia e ingenio implacable, {BRANDING.APP_NAME} encarnó el poder, 
                la velocidad y la confiabilidad que la gente anhelaba.
              </p>

              <p className="text-xl text-gray-700 leading-relaxed mb-12">
                Con un emblema que exhibe orgullosamente las barras y estrellas, este nuevo campeón dio 
                un paso audaz hacia un mundo desesperado por el cambio.
              </p>
            </div>

            {/* Valores */}
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Protección</h3>
                </div>
                <p className="text-gray-600">
                  Defendemos tu inversión ofreciendo productos de calidad superior a precios justos, 
                  sin las marcas infladas de las grandes corporaciones.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-600">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Rendimiento</h3>
                </div>
                <p className="text-gray-600">
                  Tecnología de vanguardia que rivaliza o supera a las marcas premium, 
                  sin comprometer tu presupuesto.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-purple-600">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Calidad</h3>
                </div>
                <p className="text-gray-600">
                  Cada componente es seleccionado y probado rigurosamente para garantizar 
                  durabilidad y confiabilidad excepcionales.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-orange-600">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Innovación</h3>
                </div>
                <p className="text-gray-600">
                  Constantemente buscamos nuevas formas de ofrecer más valor, 
                  más rendimiento y más ahorro a nuestros clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Únete a la revolución de la tecnología accesible
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Descubre cómo {BRANDING.APP_NAME} está cambiando el juego con componentes 
            de alta calidad a precios que realmente tienen sentido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/productos"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Ver Productos
            </Link>
            <Link
              to="/contacto"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
