/**
 * Página de Política de Cookies
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

export const CookiesPolicy: React.FC = () => {
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
            <Cookie className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Política de Cookies
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
          
          <p className="text-muted-foreground leading-relaxed mb-8">
            DIAP INGENIERÍA S.A. utiliza cookies y tecnologías similares para mejorar la experiencia 
            de navegación, analizar el tráfico del sitio y personalizar el contenido. Esta política 
            explica qué son las cookies, cómo las utilizamos y cómo puedes gestionarlas.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">1. ¿Qué son las cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando 
              visitas un sitio web. Permiten que el sitio recuerde tus acciones y preferencias 
              (como idioma, tamaño de fuente, etc.) durante un período de tiempo, para que no tengas 
              que volver a configurarlas cada vez que regreses al sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Tipos de cookies que utilizamos</h2>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Cookies Esenciales</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Son necesarias para el funcionamiento básico del sitio. Incluyen cookies de sesión 
                  que permiten mantener tu carrito de compras, tu estado de autenticación y tus 
                  preferencias durante la navegación. Estas cookies no se pueden desactivar sin 
                  afectar el funcionamiento del sitio.
                </p>
                <p className="text-sm text-primary mt-2">
                  <strong>Duración:</strong> Sesión o hasta 30 días
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Cookies de Preferencias</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Almacenan tus preferencias de navegación, como el tema visual seleccionado 
                  (claro/oscuro), configuración regional y preferencias de visualización de precios. 
                  Esto nos permite ofrecerte una experiencia personalizada.
                </p>
                <p className="text-sm text-primary mt-2">
                  <strong>Duración:</strong> Hasta 1 año
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Cookies de Análisis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Nos ayudan a entender cómo interactúas con nuestro sitio mediante la recopilación 
                  de información anónima sobre las páginas visitadas, el tiempo de permanencia y los 
                  enlaces en los que haces clic. Utilizamos esta información para mejorar la estructura 
                  y el contenido del sitio.
                </p>
                <p className="text-sm text-primary mt-2">
                  <strong>Duración:</strong> Hasta 2 años
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Cookies de Funcionalidad</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Permiten recordar tus productos favoritos, artículos vistos recientemente y otras 
                  funcionalidades que mejoran tu experiencia de compra. También se utilizan para 
                  personalizar recomendaciones de productos.
                </p>
                <p className="text-sm text-primary mt-2">
                  <strong>Duración:</strong> Hasta 90 días
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Almacenamiento Local (LocalStorage)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Utilizamos localStorage para guardar información de tu carrito de compras, 
                  productos favoritos y configuración de la aplicación. A diferencia de las cookies, 
                  estos datos permanecen en tu dispositivo hasta que los elimines manualmente.
                </p>
                <p className="text-sm text-primary mt-2">
                  <strong>Duración:</strong> Permanente hasta eliminación manual
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Cookies de terceros</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nuestro sitio puede utilizar cookies de terceros para funcionalidades específicas:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                <strong>WhatsApp Business:</strong> Para habilitar el chat directo desde nuestro sitio web.
              </li>
              <li>
                <strong>Proveedores de análisis:</strong> Para estadísticas de tráfico y comportamiento 
                de usuarios (datos anónimos).
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">4. ¿Cómo gestionar las cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Puedes controlar y/o eliminar las cookies según desees. Tienes varias opciones:
            </p>
            
            <div className="space-y-3 ml-4">
              <div>
                <h4 className="font-semibold mb-1">Configuración del navegador</h4>
                <p className="text-muted-foreground text-sm">
                  La mayoría de los navegadores permiten gestionar las cookies desde su configuración. 
                  Puedes configurar tu navegador para rechazar todas las cookies o para recibir un 
                  aviso cada vez que se envíe una cookie.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Eliminar cookies existentes</h4>
                <p className="text-muted-foreground text-sm">
                  Puedes eliminar todas las cookies almacenadas en tu dispositivo accediendo a la 
                  configuración de privacidad de tu navegador.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Modo de navegación privada</h4>
                <p className="text-muted-foreground text-sm">
                  Utilizar el modo incógnito o privado de tu navegador evita que se guarden cookies 
                  permanentes, aunque las cookies de sesión seguirán funcionando durante la navegación.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Nota importante:</strong> Si decides bloquear o eliminar cookies, algunas 
                funcionalidades del sitio pueden dejar de funcionar correctamente, como mantener tu 
                sesión iniciada o recordar los productos en tu carrito.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Consentimiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al continuar navegando en nuestro sitio web, aceptas el uso de cookies según se describe 
              en esta política. Si no estás de acuerdo con el uso de cookies, te recomendamos que 
              configures tu navegador para bloquearlas o que abandones el sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Actualizaciones de esta política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en 
              nuestras prácticas o por razones legales. Te recomendamos revisar esta página 
              regularmente para estar informado sobre cómo utilizamos las cookies.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Última actualización:</strong> 28 de octubre de 2025
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground">
              Si tienes alguna pregunta sobre nuestra Política de Cookies, por favor contáctenos a 
              través de{' '}
              <a href="mailto:ventas@diapstore.com" className="text-primary hover:underline">
                ventas@diapstore.com
              </a>
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
