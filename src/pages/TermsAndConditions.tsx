/**
 * Página de Términos y Condiciones
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsAndConditions: React.FC = () => {
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
            <FileText className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Términos y Condiciones de Venta B2B
            </h1>
          </div>
          <p className="mt-2 text-primary-foreground/80">
            Última actualización: 28 de octubre de 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">1. Información del proveedor</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este sitio web es operado por <strong>DIAP INGENIERÍA S.A.</strong>, CUIT N.º <strong>30-71036886-0</strong>, 
              con domicilio en Mitre 4146, Mar del Plata Sur, Mar del Plata, Buenos Aires, Argentina. 
              Nos especializamos en la comercialización mayorista de unidades de estado sólido (SSD) y memorias RAM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">2. Ámbito de aplicación</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las presentes condiciones regulan las operaciones de compraventa realizadas entre DIAP INGENIERÍA S.A. 
              y empresas, profesionales o revendedores debidamente registrados en AFIP. No se realizan ventas a 
              consumidores finales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">3. Registro y validación</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para realizar compras, el cliente debe registrarse con datos válidos: razón social, CUIT, condición 
              frente al IVA, domicilio fiscal y contacto comercial. DIAP INGENIERÍA S.A. se reserva el derecho de 
              validar la información antes de aceptar cualquier pedido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">4. Productos y precios</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos los productos ofrecidos están sujetos a disponibilidad de stock. Los precios están expresados en 
              dólares estadounidenses, no incluyen IVA, y pueden modificarse sin previo aviso. Las imágenes son 
              ilustrativas y no contractuales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">5. Formas de pago</h2>
            <p className="text-muted-foreground leading-relaxed">
              Se aceptan pagos mediante transferencia bancaria, efectivo o medios acordados previamente. El pedido 
              será procesado una vez acreditado el pago. En caso de mora, se aplicarán intereses compensatorios 
              conforme a la legislación vigente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">6. Facturación</h2>
            <p className="text-muted-foreground leading-relaxed">
              DIAP INGENIERÍA S.A. emite factura tipo A o B según la condición fiscal del comprador. La factura se 
              genera automáticamente al confirmar el pedido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">7. Envíos y entregas</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los envíos se realizan a todo el país mediante transporte propio o empresas logísticas. El costo de 
              envío corre por cuenta del comprador, salvo promociones específicas. El plazo de entrega estimado será 
              informado al momento de la compra. El cliente debe verificar el estado del paquete al recibirlo y dejar 
              constancia de cualquier anomalía.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">8. Garantía</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos los productos cuentan con garantía limitada del fabricante, generalmente de 1, 2 años o de por 
              vida. Para hacer uso de la garantía, el cliente debe presentar el producto y la factura correspondiente. 
              La garantía no cubre daños por mal uso, instalación incorrecta o manipulación indebida.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">9. Devoluciones y reclamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Solo se aceptan devoluciones por productos defectuosos o errores en el envío. El reclamo debe realizarse 
              dentro de los 7 días hábiles posteriores a la recepción. No se aceptan devoluciones por incompatibilidad 
              técnica, cambio de decisión o productos abiertos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">10. Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              DIAP INGENIERÍA S.A. no se responsabiliza por pérdidas indirectas, lucro cesante, o daños derivados del 
              uso de los productos. Nuestra responsabilidad se limita al valor del producto adquirido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">11. Propiedad intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las marcas, logos, nombres comerciales y descripciones de productos son propiedad de sus respectivos 
              fabricantes. Su uso en este sitio es únicamente informativo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">12. Jurisdicción y ley aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este contrato se rige por las leyes de la República Argentina. Cualquier controversia será sometida a 
              los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground">
              Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos a través de 
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
