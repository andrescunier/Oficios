/**
 * Placeholder visible cuando una página configurable (pages.<key>) no trae
 * contenido desde el ecommerce-config. Expone los nombres de las variables
 * que deben definirse para esta página.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface MissingPageContentProps {
  /** Clave dentro de `pages` (ej: "contact", "terms", "privacy"...) */
  pageKey: string;
  /** Nombre legible de la página (ej: "Contacto") */
  label?: string;
}

const FIELDS: { name: string; type: string; description: string }[] = [
  { name: 'enabled',           type: 'boolean',     description: 'Activa o desactiva la página (default true).' },
  { name: 'title',             type: 'string',      description: 'Título principal del hero.' },
  { name: 'subtitle',          type: 'string',      description: 'Subtítulo del hero.' },
  { name: 'heroVariant',       type: '"gradient" | "plain"', description: 'Estilo del hero.' },
  { name: 'heroImage',         type: 'string (url)', description: 'Imagen de fondo opcional.' },
  { name: 'blocks',            type: 'PageBlock[]', description: 'Bloques de contenido (paragraph | heading | section | cards | list | html).' },
  { name: 'ctaTitle',          type: 'string',      description: 'Título del bloque CTA al pie.' },
  { name: 'ctaSubtitle',       type: 'string',      description: 'Subtítulo del bloque CTA.' },
  { name: 'ctaPrimaryLabel',   type: 'string',      description: 'Texto del botón primario del CTA.' },
  { name: 'ctaPrimaryHref',    type: 'string',      description: 'Link del botón primario del CTA.' },
  { name: 'ctaSecondaryLabel', type: 'string',      description: 'Texto del botón secundario del CTA.' },
  { name: 'ctaSecondaryHref',  type: 'string',      description: 'Link del botón secundario del CTA.' },
  { name: 'lastUpdated',       type: 'string (ISO date)', description: 'Fecha de última actualización.' },
];

export const MissingPageContent: React.FC<MissingPageContentProps> = ({ pageKey, label }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/40 border-b py-10">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-7 w-7 text-amber-500" />
            <h1 className="text-2xl md:text-3xl font-bold">
              {label || pageKey} <span className="text-muted-foreground font-normal">— sin contenido configurado</span>
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Esta página se renderiza desde el ecommerce-config bajo la clave
            {' '}<code className="rounded bg-foreground/10 px-1.5 py-0.5 text-sm font-mono">pages.{pageKey}</code>.
            Definí los siguientes campos para personalizarla.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Variable</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((field) => (
                  <tr key={field.name} className="border-t">
                    <td className="px-4 py-3 align-top">
                      <code className="font-mono text-[13px] text-foreground">
                        pages.{pageKey}.{field.name}
                      </code>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <code className="font-mono text-[12px] text-muted-foreground">{field.type}</code>
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {field.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-lg border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">
              Ejemplo mínimo de configuración
            </p>
            <pre className="overflow-x-auto rounded bg-foreground text-background p-4 text-xs leading-relaxed">
{`"pages": {
  "${pageKey}": {
    "enabled": true,
    "title": "${label || pageKey}",
    "subtitle": "Subtítulo opcional",
    "heroVariant": "plain",
    "blocks": [
      { "type": "paragraph", "body": "Tu contenido aquí." }
    ]
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissingPageContent;
