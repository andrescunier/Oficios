-- =============================================================================
-- UPDATE ecommerce-config para DIAP Store
-- Agrega secciones: ui, registration, shipping (merge sin pisar el resto)
-- Tabla: simple_ecommerce_configs
-- Account ID: bed2df35-717f-4900-a4b1-7c3a7fb59b7c
-- DB: simpledb | Host: 100.105.218.66:5432
-- =============================================================================
-- Ejecutar:
--   psql -h 100.105.218.66 -U simpleuser -d simpledb -f diap-update-ui-shipping-registration.sql
-- =============================================================================

UPDATE simple_ecommerce_configs
SET
  config = config
    || jsonb_build_object(
        'shipping', '{
          "enabled": true,
          "mode": "flat_rate",
          "bannerText": "¡Envío gratis en compras superiores a $50.000!",
          "label": "Envío",
          "freeLabel": "Gratis",
          "pendingLabel": "A calcular",
          "drawerMessage": "Envío gratis en pedidos superiores a $50.000",
          "chargedMessage": "El costo de envío se agrega al finalizar la compra",
          "productBadgeTitle": "Envío",
          "productBadgeDescription": "A todo el país",
          "chargeAmount": 3500,
          "chargeProductId": "",
          "chargeProductSku": "",
          "chargeProductDescription": "Cargo de envío",
          "taxRate": 0
        }'::jsonb,

        'registration', '{
          "title": "Crear Cuenta",
          "subtitle": "Registrate para acceder a precios y realizar pedidos",
          "submitLabel": "Crear Cuenta",
          "successMessage": "Registro completado con éxito",
          "acceptTermsLabel": "Acepto los términos y condiciones",
          "alreadyHaveAccountText": "¿Ya tenés cuenta?",
          "alreadyHaveAccountLinkText": "Iniciá sesión aquí",
          "fields": [
            { "name": "email", "label": "Email", "placeholder": "tu@email.com", "required": true, "visible": true },
            { "name": "password", "label": "Contraseña", "placeholder": "Tu contraseña", "required": true, "visible": true, "type": "password" },
            { "name": "confirmPassword", "label": "Confirmar Contraseña", "placeholder": "Confirma tu contraseña", "required": false, "visible": true, "type": "password" }
          ]
        }'::jsonb,

        'ui', '{
          "loginTitle": "Iniciar Sesión",
          "loginSubtitle": "Accedé a tu cuenta DIAP",
          "loginEmailLabel": "Email",
          "loginPasswordLabel": "Contraseña",
          "loginSubmitLabel": "Ingresar",
          "loginForgotLabel": "¿Olvidaste tu contraseña?",
          "loginNoAccountText": "¿No tenés cuenta?",
          "loginRegisterLinkText": "Registrate aquí",
          "registerTitle": "Crear Cuenta",
          "registerSubtitle": "Registrate para acceder a precios y realizar pedidos",
          "registerSubmitLabel": "Crear Cuenta",
          "cartTitle": "Tu Carrito",
          "cartEmptyTitle": "Tu carrito está vacío",
          "cartEmptyBody": "Explorá nuestros productos y agregá los que te interesen",
          "cartEmptyExploreLabel": "Explorar Productos",
          "cartProceedAuthLabel": "Ir al Checkout",
          "cartClearLabel": "Vaciar carrito",
          "cartPageTitle": "Mi Carrito",
          "cartPageContinueShopping": "Seguir comprando",
          "cartPageItemsLabel": "Artículos en tu carrito",
          "cartPageClearCartLabel": "Vaciar carrito",
          "cartPageProductSingular": "producto",
          "cartPageProductPlural": "productos",
          "cartPageSubtotalLabel": "Subtotal",
          "cartPageTotalLabel": "Total",
          "cartPageCheckoutLabel": "Ir al Checkout",
          "cartPageSSLBadge": "Pago Seguro",
          "cartPageSSLDesc": "Transacciones cifradas con SSL",
          "cartPageShippingBadge": "Envío",
          "cartPageShippingDesc": "A todo el país",
          "checkoutTitle": "Finalizar Compra",
          "checkoutBackLabel": "Volver al Carrito",
          "checkoutStepShipping": "Envío",
          "checkoutStepPayment": "Pago",
          "checkoutStepReview": "Revisar",
          "checkoutShippingTitle": "Información de Envío",
          "checkoutPaymentTitle": "Información de Pago",
          "checkoutReviewTitle": "Revisar tu Pedido",
          "checkoutAddressTitle": "Dirección de Entrega",
          "checkoutAccountDataTitle": "Datos de tu cuenta",
          "checkoutFieldFirst": "Nombre",
          "checkoutFieldLast": "Apellido",
          "checkoutFieldEmail": "Email",
          "checkoutFieldPhone": "Teléfono",
          "checkoutFieldAddress": "Dirección de Entrega",
          "checkoutFieldCity": "Ciudad",
          "checkoutFieldState": "Provincia",
          "checkoutFieldZip": "Código Postal",
          "checkoutContinueToPayment": "Continuar al Pago",
          "checkoutPaymentMethodLabel": "Método de Pago",
          "checkoutTransferLabel": "Transferencia Bancaria",
          "checkoutTransferDesc": "Método de pago seguro y directo",
          "checkoutTransferInfoTitle": "Datos para la Transferencia",
          "checkoutEfectivoLabel": "Efectivo",
          "checkoutEfectivoDesc": "Pago en efectivo al momento de la entrega o retiro",
          "checkoutEfectivoInfoTitle": "Pago en Efectivo",
          "checkoutFinalizeLabel": "Finalizar Compra",
          "checkoutFinalizingLabel": "Procesando pago y creando orden...",
          "checkoutBackButton": "Volver",
          "checkoutCartEmptyTitle": "Carrito vacío",
          "checkoutCartEmptyMsg": "No tenés productos en tu carrito para procesar",
          "checkoutViewProductsLabel": "Ver Productos",
          "checkoutSubtotalLabel": "Subtotal",
          "checkoutShippingLabel": "Envío",
          "checkoutTotalLabel": "Total",
          "checkoutOrderTitle": "Resumen del Pedido",
          "checkoutBankLabel": "Banco",
          "checkoutHolderLabel": "Titular",
          "checkoutCbuLabel": "CBU",
          "checkoutAliasLabel": "Alias",
          "checkoutTransferImportantNote": "Una vez realizada la transferencia, enviá el comprobante por WhatsApp con tu número de orden para acelerar la confirmación.",
          "checkoutEfectivoNote": "Recibirás una confirmación por email con los detalles de tu pedido y coordinación de entrega.",
          "footerCompanyTitle": "Empresa",
          "footerCustomerServiceTitle": "Atención al Cliente",
          "footerCategoriesTitle": "Categorías",
          "footerLegalTitle": "Legal",
          "footerCompanyAboutLabel": "Sobre Nosotros",
          "footerCustomerHelpLabel": "Centro de Ayuda",
          "footerCustomerTrackingLabel": "Seguimiento de Pedido",
          "footerCustomerReturnsLabel": "Devoluciones",
          "footerCustomerWarrantyLabel": "Garantías",
          "footerLegalTermsLabel": "Términos y Condiciones",
          "footerLegalPrivacyLabel": "Política de Privacidad",
          "footerLegalCookiesLabel": "Política de Cookies",
          "footerLegalNoticeLabel": "Aviso Legal",
          "footerLegalWithdrawalLabel": "Derecho de Arrepentimiento",
          "footerWhatsappTitle": "Recibí notificaciones por WhatsApp",
          "footerWhatsappBody": "Ingresá tu número y recibí novedades y estado de tus pedidos",
          "footerWhatsappPlaceholder": "+54 9 11 1234-5678",
          "footerWhatsappButton": "Suscribirme",
          "footerCopyrightSuffix": "Todos los derechos reservados.",
          "footerPaymentMethodsLabel": "Medios de pago",
          "searchPlaceholder": "Buscar productos...",
          "headerCategoriesLabel": "Categorías",
          "headerAllProductsLabel": "Todos los Productos",
          "headerLoginLabel": "Iniciar Sesión",
          "headerRegisterLabel": "Registrarse",
          "headerMyProfileLabel": "Mi Perfil",
          "headerMyOrdersLabel": "Mis Pedidos",
          "headerFavoritesLabel": "Favoritos",
          "headerLogoutLabel": "Cerrar Sesión"
        }'::jsonb
    ),
  updated_at = NOW()
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

-- Verificar resultado
SELECT
  account_id,
  config ? 'ui'           AS tiene_ui,
  config ? 'shipping'     AS tiene_shipping,
  config ? 'registration' AS tiene_registration,
  updated_at
FROM simple_ecommerce_configs
WHERE account_id = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';
