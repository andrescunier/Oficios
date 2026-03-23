/**
 * Página de Aviso Legal
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { getLegalConfig } from '@/config/runtime';

export const LegalNotice: React.FC = () => {
  const legal = getLegalConfig();

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
            <Scale className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Aviso Legal
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
          
          <p className="text-muted-foreground leading-relaxed mb-8">
            El contenido de este sitio web, incluyendo textos, imágenes, logos, marcas y descripciones 
            de productos, es propiedad de {legal.companyName} o de sus respectivos titulares. Está 
            prohibida su reproducción total o parcial sin autorización previa.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Responsabilidad del contenido</h2>
            <p className="text-muted-foreground leading-relaxed">
              {legal.companyName} no garantiza que la información publicada sea exacta, completa o 
              actualizada en todo momento. Nos reservamos el derecho de modificar precios, productos o 
              condiciones sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Enlaces externos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este sitio puede contener enlaces a sitios de terceros. {legal.companyName} no se 
              responsabiliza por el contenido ni por las políticas de privacidad de dichos sitios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Uso del sitio</h2>
            <p className="text-muted-foreground leading-relaxed">
              El uso del sitio implica la aceptación de los Términos y Condiciones y de esta Política 
              de Privacidad. El usuario se compromete a utilizar el sitio de manera lícita y respetuosa.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground">
              Si tiene alguna pregunta sobre este Aviso Legal, por favor contáctenos a través de 
              nuestros canales de atención al cliente.
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
