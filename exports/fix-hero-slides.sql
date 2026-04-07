-- Fix heroSlides: cambiar de URLs planas a objetos con title/subtitle/cta/link
UPDATE simple_ecommerce_configs
SET config = jsonb_set(
  config,
  '{images,heroSlides}',
  '[
    {
      "image": "https://www.cumar.com.ar/CDN/diapstore/slide-1.jpg",
      "title": "Tecnología Profesional para Empresas",
      "subtitle": "Soluciones B2B en componentes de alta gama",
      "cta": "Ver Catálogo",
      "link": "/productos"
    },
    {
      "image": "https://www.cumar.com.ar/CDN/diapstore/slide-2.jpg",
      "title": "SSDs de Alto Rendimiento",
      "subtitle": "Almacenamiento profesional para tu negocio",
      "cta": "Explorar SSDs",
      "link": "/productos"
    },
    {
      "image": "https://www.cumar.com.ar/CDN/diapstore/slide-3.jpg",
      "title": "Memorias RAM DDR4 & DDR5",
      "subtitle": "Maximiza el rendimiento de tus equipos",
      "cta": "Ver Memorias",
      "link": "/productos"
    }
  ]'::jsonb
),
updated_at = NOW()
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';
