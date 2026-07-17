#!/usr/bin/env python3
"""Contenido CMS (pages.*) de OficiosHub en formato objeto para CmsPage."""
from __future__ import annotations


def page(
    title: str,
    subtitle: str,
    blocks: list[dict],
    *,
    cta_primary: tuple[str, str] | None = None,
    cta_secondary: tuple[str, str] | None = None,
    cta_title: str | None = None,
    cta_subtitle: str | None = None,
) -> dict:
    out: dict = {
        "enabled": True,
        "title": title,
        "subtitle": subtitle,
        "heroVariant": "gradient",
        "blocks": blocks,
        "lastUpdated": "2026-07-16",
    }
    if cta_title:
        out["ctaTitle"] = cta_title
    if cta_subtitle:
        out["ctaSubtitle"] = cta_subtitle
    if cta_primary:
        out["ctaPrimaryLabel"], out["ctaPrimaryHref"] = cta_primary
    if cta_secondary:
        out["ctaSecondaryLabel"], out["ctaSecondaryHref"] = cta_secondary
    return out


def build_pages() -> dict:
    return {
        "about": page(
            "Cómo funciona OficiosHub",
            "Personas particulares con oficio. La plataforma valida, capacita y conecta.",
            [
                {
                    "type": "text",
                    "title": "Qué es OficiosHub",
                    "body": (
                        "OficiosHub es un marketplace de personas, no de empresas por rubro. "
                        "Alguien necesita un arreglo en casa y otra persona particular lo ofrece: "
                        "plomería, electricidad, pintura o exterior. Cada perfil es un vecino con un oficio concreto."
                    ),
                },
                {
                    "type": "heading",
                    "title": "Responsabilidad de cada parte",
                },
                {
                    "type": "cards",
                    "items": [
                        {
                            "icon": "Users",
                            "iconColor": "blue",
                            "title": "Cliente",
                            "description": (
                                "Elegís a la persona, pedís el servicio con fecha y zona, "
                                "das el OK de calidad y dejás reseña. No hay contacto directo: "
                                "todo pasa por OficiosHub."
                            ),
                        },
                        {
                            "icon": "Briefcase",
                            "iconColor": "amber",
                            "title": "Persona con oficio (supplier)",
                            "description": (
                                "Sos vos, no una empresa. Publicás tu oficio con título "
                                "(Oficial, Medio oficial, etc.), foto personal, zona y precio fijo "
                                "o a convenir. Aceptás la reserva y ejecutás el trabajo."
                            ),
                        },
                        {
                            "icon": "ShieldCheck",
                            "iconColor": "green",
                            "title": "OficiosHub (plataforma)",
                            "description": (
                                "Intermedia la contratación y el pago. Valida idoneidad y antecedentes, "
                                "no ejecuta el trabajo. El cobro se libera recién con el OK de calidad "
                                "del cliente."
                            ),
                        },
                        {
                            "icon": "GraduationCap",
                            "iconColor": "purple",
                            "title": "Capacitaciones",
                            "description": (
                                "Con la intermediación financiamos capacitaciones que llegan "
                                "al panel del proveedor como tareas, para mejorar calidad y nivel de vida."
                            ),
                        },
                    ],
                },
                {
                    "type": "heading",
                    "title": "El recorrido, paso a paso",
                },
                {
                    "type": "list",
                    "title": "Para quien contrata",
                    "items": [
                        "Entrá al catálogo, filtrá por oficio o localidad/barrio y elegí una persona.",
                        "Creá tu cuenta de cliente si todavía no tenés.",
                        "Pedí el servicio con fecha, hora, zona y detalle del trabajo.",
                        "No hay contacto directo: toda la comunicación pasa por OficiosHub.",
                        "El proveedor debe aceptar la reserva. El cobro se libera recién con tu OK de calidad.",
                        "Después podés dejar reseña (servicio, limpieza, puntualidad, calidad).",
                    ],
                },
                {
                    "type": "list",
                    "title": "Para quien ofrece el oficio",
                    "items": [
                        "Registrate como persona con oficio (no como empresa de rubro).",
                        "La plataforma valida idoneidad y antecedentes.",
                        "Publicá un servicio claro con tu zona (Hogar, Electricidad, Pintura o Exterior).",
                        "Cuando te contraten, aceptá o rechazá la reserva en tu panel.",
                        "Coordiná solo por OficiosHub; el cobro llega tras el OK de calidad del cliente.",
                        "Completá capacitaciones (tareas) y seguí tus cobros por servicios prestados.",
                    ],
                },
                {
                    "type": "section",
                    "title": "Pocas categorías, a propósito",
                    "body": (
                        "Solo cuatro oficios: Hogar, Electricidad, Pintura y Exterior. "
                        "Así es más fácil encontrar a alguien y cada persona se presenta por lo que hace, "
                        "no por un catálogo corporativo enorme."
                    ),
                },
            ],
            cta_title="¿De qué lado estás?",
            cta_subtitle="Podés contratar un servicio o sumarte a ofrecer el tuyo.",
            cta_primary=("Ver personas y servicios", "/productos"),
            cta_secondary=("Ofrecer mi oficio", "/registro-proveedor"),
        ),
        "contact": page(
            "Contacto",
            "Escribinos si querés contratar, sumarte como persona con oficio o pedir ayuda.",
            [
                {
                    "type": "cards",
                    "items": [
                        {
                            "icon": "Mail",
                            "iconColor": "blue",
                            "title": "Email",
                            "description": "hola@oficioshub.cumar.com.ar",
                        },
                        {
                            "icon": "MessageCircle",
                            "iconColor": "green",
                            "title": "WhatsApp",
                            "description": "+54 11 5555 0100 · también para proveedores: proveedores@oficioshub.cumar.com.ar",
                        },
                        {
                            "icon": "MapPin",
                            "iconColor": "amber",
                            "title": "Zona",
                            "description": "Buenos Aires, Argentina · servicios a domicilio según cada persona.",
                        },
                        {
                            "icon": "Clock",
                            "iconColor": "slate",
                            "title": "Horario de atención de la plataforma",
                            "description": (
                                "Lunes a sábado 8:00 a 20:00. Fecha y hora del trabajo se indican "
                                "en la reserva y se confirman por OficiosHub."
                            ),
                        },
                    ],
                },
                {
                    "type": "text",
                    "title": "¿Sos proveedor?",
                    "body": (
                        "Registrate en Ofrezco mi oficio. Validamos idoneidad antes de que tu perfil "
                        "quede operativo. Usá el panel para servicios, reservas, capacitaciones y cobros."
                    ),
                },
            ],
            cta_primary=("Ofrecer mi oficio", "/registro-proveedor"),
            cta_secondary=("Ver servicios", "/productos"),
        ),
        "terms": page(
            "Términos y condiciones",
            "Reglas claras para contratar y para ofrecer un oficio en OficiosHub.",
            [
                {
                    "type": "section",
                    "title": "1. Naturaleza del marketplace",
                    "body": (
                        "OficiosHub conecta clientes con personas particulares que publican un servicio. "
                        "La plataforma facilita el pedido y el seguimiento; la ejecución del trabajo "
                        "la realiza la persona que publicó el servicio."
                    ),
                },
                {
                    "type": "section",
                    "title": "2. Contratar un servicio",
                    "body": (
                        "Al confirmar una reserva aceptás que OficiosHub intermedie la contratación: "
                        "indicás fecha, zona y detalle del trabajo; el proveedor acepta en su panel; "
                        "no hay contacto directo entre las partes. El pedido queda como orden de venta."
                    ),
                },
                {
                    "type": "section",
                    "title": "3. Ofrecer un oficio",
                    "body": (
                        "Quienes se registran como proveedores lo hacen como personas particulares. "
                        "Deben publicar información veraz, aceptar o rechazar reservas por la plataforma, "
                        "cumplir lo acordado y completar las capacitaciones asignadas cuando corresponda."
                    ),
                },
                {
                    "type": "section",
                    "title": "4. Validación y capacitaciones",
                    "body": (
                        "OficiosHub valida idoneidad y antecedentes antes de que el perfil quede operativo. "
                        "Las capacitaciones se asignan como tareas en el panel del proveedor, "
                        "financiadas con la intermediación."
                    ),
                },
                {
                    "type": "section",
                    "title": "5. Pagos y cobros",
                    "body": (
                        "Los medios de pago habilitados se muestran en el checkout. OficiosHub intermedia "
                        "el cobro: se retiene hasta que el cliente da el OK de calidad. "
                        "No está permitido acordar pagos por fuera de la plataforma."
                    ),
                },
                {
                    "type": "section",
                    "title": "6. Cancelaciones",
                    "body": (
                        "Podés pedir cambios o cancelaciones por el canal oficial (Contacto o WhatsApp "
                        "de OficiosHub), indicando el número de orden. La viabilidad depende del estado "
                        "de la reserva; OficiosHub gestiona el caso con la otra parte."
                    ),
                },
            ],
            cta_primary=("Volver al inicio", "/"),
            cta_secondary=("Contacto", "/contacto"),
        ),
        "privacy": page(
            "Privacidad",
            "Cómo cuidamos tus datos en OficiosHub.",
            [
                {
                    "type": "section",
                    "title": "Qué datos usamos",
                    "body": (
                        "Datos de cuenta (nombre, email, teléfono), pedidos, reseñas y, si sos proveedor, "
                        "datos de tu oficio y seguimiento de capacitaciones. Los usamos para operar el marketplace, "
                        "validar idoneidad cuando corresponda y mejorar la experiencia."
                    ),
                },
                {
                    "type": "section",
                    "title": "Con quién se comparten",
                    "body": (
                        "Para tu seguridad no compartimos teléfono ni WhatsApp entre cliente y proveedor. "
                        "El proveedor ve zona/barrio y, tras aceptar la reserva, la dirección del servicio "
                        "necesaria para la visita. La coordinación pasa por OficiosHub. No vendemos tu información."
                    ),
                },
                {
                    "type": "section",
                    "title": "Tus derechos",
                    "body": (
                        "Podés pedir acceso, corrección o baja escribiendo a hola@oficioshub.cumar.com.ar, "
                        "conforme a la normativa argentina de protección de datos personales."
                    ),
                },
            ],
            cta_primary=("Contacto", "/contacto"),
        ),
        "cookies": page(
            "Cookies",
            "Usamos cookies técnicas para que el marketplace funcione.",
            [
                {
                    "type": "section",
                    "title": "Para qué sirven",
                    "body": (
                        "Cookies propias para sesión, carrito, preferencias de consentimiento "
                        "y el funcionamiento básico del sitio. Si habilitamos analítica, "
                        "solo después de tu consentimiento."
                    ),
                },
                {
                    "type": "list",
                    "title": "Tipos",
                    "items": [
                        "Esenciales: login, carrito y seguridad.",
                        "Preferencias: tu elección de cookies.",
                        "Analítica (opcional): solo si aceptás.",
                    ],
                },
            ],
            cta_primary=("Volver al inicio", "/"),
        ),
        "returns": page(
            "Cambios y cancelaciones",
            "En OficiosHub contratás personas y servicios, no productos de stock.",
            [
                {
                    "type": "section",
                    "title": "Servicios, no devoluciones de góndola",
                    "body": (
                        "Si necesitás cancelar o modificar una reserva, escribinos al canal oficial "
                        "con el número de orden lo antes posible. OficiosHub gestiona el caso según "
                        "el estado (si todavía no se realizó el trabajo suele ser más simple)."
                    ),
                },
                {
                    "type": "list",
                    "title": "Cómo pedirlo",
                    "items": [
                        "Usá Contacto o el WhatsApp oficial de OficiosHub con tu número de orden.",
                        "Contá el motivo y si querés reprogramar o cancelar.",
                        "No contactes a la otra parte por fuera; si el trabajo ya empezó, se evalúa caso por caso.",
                    ],
                },
            ],
            cta_primary=("Seguimiento de pedido", "/seguimiento"),
            cta_secondary=("Contacto", "/contacto"),
        ),
        "warranty": page(
            "Calidad y reseñas",
            "La calidad se construye con personas validadas, capacitaciones y reseñas reales.",
            [
                {
                    "type": "section",
                    "title": "Cómo cuidamos la calidad",
                    "body": (
                        "Validamos idoneidad y antecedentes de quienes ofrecen oficios. "
                        "Además asignamos capacitaciones (como tareas) para mejorar el servicio. "
                        "Después de contratar, podés puntuar servicio, limpieza, puntualidad y calidad."
                    ),
                },
                {
                    "type": "section",
                    "title": "Si algo no salió bien",
                    "body": (
                        "No des el OK de calidad hasta estar conforme, o contactanos con el número de orden "
                        "antes. Revisamos el caso por la plataforma y buscamos una solución razonable. "
                        "No ofrecemos garantía de fábrica como un e‑commerce de productos; el foco es el oficio prestado."
                    ),
                },
            ],
            cta_primary=("Cómo funciona", "/como-funciona"),
            cta_secondary=("Contacto", "/contacto"),
        ),
        "legalNotice": page(
            "Aviso legal",
            "Información de la plataforma OficiosHub.",
            [
                {
                    "type": "section",
                    "title": "Titular",
                    "body": (
                        "OficiosHub opera como marketplace de intermediación entre clientes y personas "
                        "particulares con oficio. Contacto: hola@oficioshub.cumar.com.ar · Buenos Aires, Argentina."
                    ),
                },
                {
                    "type": "section",
                    "title": "Rol de la plataforma",
                    "body": (
                        "OficiosHub no ejecuta los trabajos publicados. Facilita la contratación, "
                        "el registro de pedidos, la validación/capacitación de proveedores y el seguimiento."
                    ),
                },
            ],
            cta_primary=("Términos", "/terminos"),
            cta_secondary=("Privacidad", "/privacidad"),
        ),
        "tracking": page(
            "Seguimiento de pedidos",
            "Consultá el estado de tu contratación con el número de orden.",
            [
                {
                    "type": "text",
                    "body": (
                        "Cuando contratás a una persona, el pedido queda como orden de venta. "
                        "Usá la pantalla de seguimiento o tu cuenta (Mis pedidos) para ver el estado. "
                        "Si sos proveedor, las reservas de tus servicios están en tu panel."
                    ),
                },
            ],
            cta_primary=("Ir a seguimiento", "/seguimiento"),
            cta_secondary=("Mis pedidos", "/pedidos"),
        ),
        "shipping": page(
            "Visitas y coordinación",
            "No hay envíos de paquetería: OficiosHub intermedia la visita.",
            [
                {
                    "type": "section",
                    "title": "Cómo se hace el servicio",
                    "body": (
                        "La mayoría de los oficios se realizan en tu domicilio u obra. "
                        "Al pedir el servicio indicás fecha, hora, zona y detalle. "
                        "El proveedor acepta en su panel; no hay contacto directo. "
                        "El cobro se libera recién con tu OK de calidad."
                    ),
                },
                {
                    "type": "list",
                    "title": "Seguridad",
                    "items": [
                        "No compartimos tu teléfono con la otra parte.",
                        "La dirección completa se muestra al proveedor recién al aceptar la reserva.",
                        "Cualquier duda: canal oficial de OficiosHub con tu número de orden.",
                    ],
                },
            ],
            cta_primary=("Ver oficios", "/productos"),
            cta_secondary=("Cómo funciona", "/como-funciona"),
        ),
        "company": page(
            "Sobre OficiosHub",
            "Marketplace de personas con oficio, con intermediación y respaldo.",
            [
                {
                    "type": "text",
                    "title": "Nuestra propuesta",
                    "body": (
                        "OficiosHub conecta vecinos que necesitan un arreglo con personas particulares "
                        "que saben hacerlo. No somos un directorio de contactos: intermediamos la reserva, "
                        "validamos idoneidad y retenemos el cobro hasta el OK de calidad del cliente."
                    ),
                },
                {
                    "type": "list",
                    "title": "Por qué da seguridad",
                    "items": [
                        "Sin contacto directo entre cliente y proveedor.",
                        "Validación de idoneidad y antecedentes de quienes ofrecen oficios.",
                        "Cobro liberado recién con OK de calidad.",
                        "Capacitaciones financiadas con la intermediación.",
                        "Pocas categorías claras: Hogar, Electricidad, Pintura y Exterior.",
                    ],
                },
            ],
            cta_primary=("Cómo funciona", "/como-funciona"),
            cta_secondary=("Ver oficios", "/productos"),
        ),
        "notFound": page(
            "No encontramos esa página",
            "Puede que el enlace esté vencido o mal escrito.",
            [
                {
                    "type": "text",
                    "body": "Volvé al inicio o mirá cómo funciona OficiosHub para orientarte.",
                },
            ],
            cta_primary=("Inicio", "/"),
            cta_secondary=("Cómo funciona", "/como-funciona"),
        ),
    }
