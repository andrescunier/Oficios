/**
 * Página de Política de Privacidad
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
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
              Política de Privacidad
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
          
          <p className="text-muted-foreground leading-relaxed mb-8">
            DIAP INGENIERÍA S.A. se compromete a proteger la privacidad de sus clientes y usuarios. 
            Esta política describe cómo recopilamos, usamos y protegemos la información personal en 
            nuestro sitio web.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Información recopilada</h2>
            <p className="text-muted-foreground leading-relaxed">
              Recopilamos datos como razón social, CUIT, domicilio fiscal, correo electrónico y teléfono 
              de contacto al momento del registro o compra.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Uso de la información</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              La información se utiliza exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Procesar pedidos y emitir facturas.</li>
              <li>Coordinar envíos y atención postventa.</li>
              <li>Enviar comunicaciones comerciales relacionadas con nuestros productos.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Protección de datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger los datos contra 
              accesos no autorizados, pérdida o alteración.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Compartir información</h2>
            <p className="text-muted-foreground leading-relaxed">
              No compartimos datos personales con terceros, salvo que sea necesario para cumplir con 
              obligaciones legales o logísticas (por ejemplo, empresas de transporte).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Derechos del usuario</h2>
            <p className="text-muted-foreground leading-relaxed">
              El titular de los datos puede acceder, rectificar o solicitar la eliminación de su 
              información enviando un correo a{' '}
              <a href="mailto:ventas@diapstore.com" className="text-primary hover:underline">
                ventas@diapstore.com
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nuestro sitio puede utilizar cookies para mejorar la experiencia de navegación. El usuario 
              puede configurar su navegador para rechazar o eliminar cookies.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground">
              Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos a través 
              de nuestros canales de atención al cliente.
            </p>
            <div className="text-center mt-6">
              <Link 
                to="/" 
                className="inline-flex items-center text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
