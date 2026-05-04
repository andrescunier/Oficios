-- ============================================================================
-- DIAP Worldclass Ecommerce Config Update
-- Account: bed2df35-717f-4900-a4b1-7c3a7fb59b7c (diapstore)
-- DB: simpledb | Host: 100.105.218.66:5432 | Tabla: simple_ecommerce_configs
-- Adds: validation, seo, pages, analytics, consent, header, footer,
--       checkout, wishlist sections to ecommerce-config payload.
-- Ejecutar:
--   psql -h 100.105.218.66 -U simpleuser -d simpledb -f diap-update-worldclass-config.sql
-- ============================================================================

UPDATE simple_ecommerce_configs
SET config = config || jsonb_build_object(
  -- ----------------------------------------------------------------------
  -- VALIDATION: Mensajes localizados (Argentina) y reglas de password
  -- ----------------------------------------------------------------------
  'validation', jsonb_build_object(
    'passwordMinLength', 8,
    'passwordRequireUppercase', true,
    'passwordRequireLowercase', true,
    'passwordRequireNumber', true,
    'passwordRequireSymbol', false,
    'phoneRegex', '^[0-9+\\s()\\-]{8,20}$',
    'zipRegex', '^[A-Za-z0-9\\- ]{3,10}$',
    'messages', jsonb_build_object(
      'requiredField', 'Este campo es obligatorio',
      'fieldRequired', '{field} es obligatorio',
      'invalidEmail', 'Ingresá un email válido',
      'passwordTooShort', 'La contraseña debe tener al menos {min} caracteres',
      'passwordNeedsUppercase', 'Debe incluir al menos una letra mayúscula',
      'passwordNeedsLowercase', 'Debe incluir al menos una letra minúscula',
      'passwordNeedsNumber', 'Debe incluir al menos un número',
      'passwordNeedsSymbol', 'Debe incluir al menos un símbolo',
      'passwordsDontMatch', 'Las contraseñas no coinciden',
      'acceptTermsRequired', 'Debés aceptar los términos y condiciones',
      'invalidPhone', 'El teléfono no tiene un formato válido',
      'invalidZip', 'El código postal no es válido',
      'sessionCleanedTitle', 'Sesión limpia',
      'sessionCleanedMessage', 'La sesión local fue limpiada. Volvé a iniciar sesión.',
      'loginGreeting', '¡Bienvenido/a {name}!',
      'loginGenericError', 'Ocurrió un error al iniciar sesión. Reintentá.',
      'registerSuccessTitle', '¡Cuenta creada!',
      'registerSuccessMessage', 'Te enviamos un email a {email} para confirmar tu cuenta.',
      'registerGenericError', 'No pudimos crear tu cuenta. Reintentá más tarde.',
      'checkoutAuthRequiredTitle', 'Iniciá sesión',
      'checkoutAuthRequiredMessage', 'Para finalizar la compra necesitás iniciar sesión.',
      'checkoutFieldRequiredTitle', 'Falta completar datos',
      'checkoutFieldRequiredMessage', 'Completá el campo: {field}'
    )
  ),

  -- ----------------------------------------------------------------------
  -- SEO: Meta tags, Open Graph, Twitter, JSON-LD Organization
  -- ----------------------------------------------------------------------
  'seo', jsonb_build_object(
    'defaultTitle', 'DIAP Store · Tecnología Profesional',
    'titleTemplate', '{title} | DIAP',
    'defaultDescription', 'DIAP Store: tecnología profesional para empresas en Argentina. Envíos a todo el país, garantía oficial.',
    'defaultKeywords', 'tecnología, empresas, Argentina, profesional, DIAP',
    'defaultOgImage', 'https://diapstore.com/og-default.jpg',
    'twitterHandle', '@diapstore',
    'organization', jsonb_build_object(
      'name', 'DIAP INGENIERÍA S.A.',
      'url', 'https://diapstore.com',
      'logo', 'https://diapstore.com/logo.png',
      'sameAs', jsonb_build_array('https://www.linkedin.com/company/diap', 'https://www.instagram.com/diap')
    ),
    'enableJsonLd', true,
    'enableProductJsonLd', true,
    'routes', jsonb_build_object(
      '/', jsonb_build_object(
        'title', 'Inicio',
        'description', 'DIAP Store: tecnología profesional para empresas con envíos a todo el país.'
      ),
      '/productos', jsonb_build_object(
        'title', 'Catálogo de productos',
        'description', 'Explorá nuestro catálogo completo de productos tecnológicos.'
      ),
      '/contacto', jsonb_build_object(
        'title', 'Contacto',
        'description', 'Contactá al equipo de DIAP por WhatsApp, email o teléfono.'
      ),
      '/sobrenosotros', jsonb_build_object(
        'title', 'Sobre Nosotros',
        'description', 'Conocé la historia y los valores de DIAP.'
      )
    )
  ),

  -- ----------------------------------------------------------------------
  -- PAGES: Contenido CMS configurable por página
  -- ----------------------------------------------------------------------
  'pages', jsonb_build_object(
    'about', jsonb_build_object(
      'enabled', true,
      'title', 'Sobre Nosotros',
      'subtitle', 'Tecnología profesional al servicio de tu empresa',
      'heroVariant', 'gradient',
      'blocks', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'body', 'En DIAP nacimos para combatir la mediocridad sobrevalorada. Creemos que la tecnología debe ser una palanca real para que las empresas crezcan, no un dolor de cabeza.'
        ),
        jsonb_build_object(
          'type', 'cards',
          'items', jsonb_build_array(
            jsonb_build_object('icon', 'Shield', 'iconColor', 'blue', 'title', 'Protección', 'description', 'Cubrimos toda la cadena: desde la selección hasta la garantía oficial.'),
            jsonb_build_object('icon', 'Zap', 'iconColor', 'orange', 'title', 'Rendimiento', 'description', 'Productos seleccionados que entregan valor real, no promesas vacías.'),
            jsonb_build_object('icon', 'Award', 'iconColor', 'amber', 'title', 'Calidad', 'description', 'Solo trabajamos con marcas y partners que cumplen nuestros estándares.'),
            jsonb_build_object('icon', 'TrendingUp', 'iconColor', 'green', 'title', 'Innovación', 'description', 'Te acompañamos a adoptar las tecnologías que mueven el negocio.')
          )
        )
      ),
      'ctaTitle', 'Únete a la revolución',
      'ctaSubtitle', 'Soluciones tecnológicas pensadas para tu empresa.',
      'ctaPrimaryLabel', 'Ver productos',
      'ctaPrimaryHref', '/productos',
      'ctaSecondaryLabel', 'Contactanos',
      'ctaSecondaryHref', '/contacto'
    ),
    'contact', jsonb_build_object('enabled', false),
    'cookies', jsonb_build_object('enabled', false),
    'terms', jsonb_build_object('enabled', false),
    'privacy', jsonb_build_object('enabled', false),
    'returns', jsonb_build_object('enabled', false),
    'warranty', jsonb_build_object('enabled', false),
    'legalNotice', jsonb_build_object('enabled', false)
  ),

  -- ----------------------------------------------------------------------
  -- ANALYTICS: GA4 / GTM / Meta Pixel / Hotjar / Clarity
  -- ----------------------------------------------------------------------
  'analytics', jsonb_build_object(
    'enabled', false,
    'ga4MeasurementId', '',
    'gtmContainerId', '',
    'facebookPixelId', '',
    'hotjarId', '',
    'clarityId', '',
    'anonymizeIp', true,
    'trackPageViews', true,
    'trackEcommerce', true
  ),

  -- ----------------------------------------------------------------------
  -- CONSENT: Banner de cookies / consentimiento
  -- ----------------------------------------------------------------------
  'consent', jsonb_build_object(
    'enabled', true,
    'title', 'Usamos cookies',
    'body', 'Usamos cookies propias y de terceros para mejorar tu experiencia. Podés aceptar o rechazar las cookies analíticas.',
    'acceptLabel', 'Aceptar',
    'rejectLabel', 'Rechazar',
    'preferencesLabel', 'Preferencias',
    'learnMoreLabel', 'Más información',
    'learnMoreHref', '/cookies',
    'storageKey', 'cookie_consent_v1',
    'blockAnalyticsUntilConsent', true
  ),

  -- ----------------------------------------------------------------------
  -- HEADER: Visibilidad de elementos y mensaje del top bar
  -- ----------------------------------------------------------------------
  'header', jsonb_build_object(
    'showSearch', true,
    'showCategoriesMenu', true,
    'showFavorites', true,
    'showOrders', true,
    'showAccount', true,
    'showCart', true,
    'topBarMessage', 'Envíos a todo el país · Garantía oficial',
    'topBarHref', '/envios'
  ),

  -- ----------------------------------------------------------------------
  -- FOOTER: Secciones, captura WhatsApp, redes sociales
  -- ----------------------------------------------------------------------
  'footer', jsonb_build_object(
    'showWhatsappCapture', true,
    'whatsappOptInMessage', '¡Hola! Quiero recibir notificaciones de ofertas y novedades de DIAP.',
    'showSocial', true,
    'showPaymentBadges', true,
    'sections', jsonb_build_array()
  ),

  -- ----------------------------------------------------------------------
  -- CHECKOUT: Pasos, campos requeridos, opciones de cupón / notas
  -- ----------------------------------------------------------------------
  'checkout', jsonb_build_object(
    'steps', jsonb_build_array('shipping', 'payment', 'review'),
    'guestCheckoutEnabled', false,
    'showOrderNotes', true,
    'orderNotesLabel', 'Notas para el pedido',
    'orderNotesPlaceholder', 'Indicaciones para el envío, horarios, referencias…',
    'showCouponInput', true,
    'couponPlaceholder', 'Ingresá tu cupón',
    'couponApplyLabel', 'Aplicar',
    'fields', jsonb_build_array(
      jsonb_build_object('name', 'firstName', 'label', 'Nombre', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'account'),
      jsonb_build_object('name', 'lastName',  'label', 'Apellido', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'account'),
      jsonb_build_object('name', 'email', 'label', 'Email', 'required', true, 'visible', true, 'type', 'email', 'step', 'shipping', 'group', 'account'),
      jsonb_build_object('name', 'phone', 'label', 'Teléfono', 'required', true, 'visible', true, 'type', 'tel', 'step', 'shipping', 'group', 'account'),
      jsonb_build_object('name', 'dni', 'label', 'DNI / CUIT', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'account'),
      jsonb_build_object('name', 'address', 'label', 'Dirección', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'address'),
      jsonb_build_object('name', 'addressNumber', 'label', 'Número', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'address'),
      jsonb_build_object('name', 'apartment', 'label', 'Piso / Depto', 'required', false, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'address'),
      jsonb_build_object('name', 'city', 'label', 'Ciudad', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'address'),
      jsonb_build_object('name', 'state', 'label', 'Provincia', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'address'),
      jsonb_build_object('name', 'zipCode', 'label', 'Código Postal', 'required', true, 'visible', true, 'type', 'text', 'step', 'shipping', 'group', 'address')
    )
  ),

  -- ----------------------------------------------------------------------
  -- WISHLIST: Lista de favoritos
  -- ----------------------------------------------------------------------
  'wishlist', jsonb_build_object(
    'enabled', true,
    'storageKey', 'wishlist_v1',
    'requireAuth', false
  )
),
updated_at = NOW()
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

-- Verificación
SELECT
  account_id,
  config ? 'validation' AS has_validation,
  config ? 'seo' AS has_seo,
  config ? 'pages' AS has_pages,
  config ? 'analytics' AS has_analytics,
  config ? 'consent' AS has_consent,
  config ? 'header' AS has_header,
  config ? 'footer' AS has_footer,
  config ? 'checkout' AS has_checkout,
  config ? 'wishlist' AS has_wishlist,
  updated_at
FROM simple_ecommerce_configs
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';
