/**
 * Footer profesional para Ecommerce
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BRANDING, ASSETS, SOCIAL_LINKS, FEATURES, CONTACT } from '@/config/branding';
import { getCategoriesConfig, getUIConfig, getFooterConfig, getPaymentMethodsConfig, getLoanConfig } from '@/config/runtime';
import { getFeatureBenefitIcon } from '@/components/ui/featureBenefitIcons';
import { subscribePhoneToNewsletter } from '@/services/newsletterService';
import { useStore } from '@/store/useStore';

export const Footer: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const addNotification = useStore((state) => state.addNotification);
  const uiCfg = getUIConfig();
  const footerCfg = getFooterConfig();
  const paymentMethodsCfg = getPaymentMethodsConfig();
  const loanCfg = getLoanConfig();

  const enabledPaymentMethods = React.useMemo(() => {
    const methods: string[] = [];

    if (paymentMethodsCfg.transferencia) {
      methods.push(uiCfg.paymentMethodTransfer || uiCfg.checkoutTransferLabel || 'Transferencia');
    }

    if (paymentMethodsCfg.efectivo) {
      methods.push(uiCfg.paymentMethodCash || uiCfg.checkoutEfectivoLabel || 'Efectivo');
    }

    if (paymentMethodsCfg.mercadopago) {
      methods.push(uiCfg.paymentMethodMercadopago || 'Mercado Pago');
    }

    if (paymentMethodsCfg.tarjeta) {
      methods.push(uiCfg.paymentMethodCard || 'Tarjeta');
    }

    if (paymentMethodsCfg.prestamo && loanCfg.enabled) {
      methods.push(uiCfg.paymentMethodLoan || 'Préstamo');
    }

    return Array.from(new Set(methods));
  }, [
    loanCfg.enabled,
    paymentMethodsCfg.efectivo,
    paymentMethodsCfg.mercadopago,
    paymentMethodsCfg.prestamo,
    paymentMethodsCfg.tarjeta,
    paymentMethodsCfg.transferencia,
    uiCfg.checkoutEfectivoLabel,
    uiCfg.checkoutTransferLabel,
    uiCfg.paymentMethodCard,
    uiCfg.paymentMethodCash,
    uiCfg.paymentMethodLoan,
    uiCfg.paymentMethodMercadopago,
    uiCfg.paymentMethodTransfer,
  ]);

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const telefono = phoneNumber.trim();
    if (!telefono || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await subscribePhoneToNewsletter(telefono);
      addNotification({
        type: 'success',
        title: '¡Listo!',
        message: footerCfg.whatsappOptInSuccessMessage,
        duration: 4000,
      });
      setPhoneNumber('');
    } catch {
      addNotification({
        type: 'error',
        title: 'No pudimos suscribirte',
        message: 'Intentá nuevamente en unos minutos.',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Default sections (legacy) — used when footer.sections is empty
  const defaultSections = {
    company: {
      title: uiCfg.footerCompanyTitle,
      links: [
        { label: uiCfg.footerCompanyAboutLabel, href: '/sobrenosotros', external: false },
      ]
    },
    customer: {
      title: uiCfg.footerCustomerServiceTitle,
      links: [
        { label: uiCfg.footerCustomerHelpLabel, href: '/contacto', external: false },
        { label: uiCfg.footerCustomerTrackingLabel, href: '/seguimiento', external: false },
        { label: uiCfg.footerCustomerReturnsLabel, href: '/devoluciones', external: false },
        { label: uiCfg.footerCustomerWarrantyLabel, href: '/garantias', external: false },
      ]
    },
    categories: {
      title: uiCfg.footerCategoriesTitle,
      links: getCategoriesConfig().flatMap(c => [
        { label: c.name, href: c.link, external: false },
        ...(c.subcategories || []).flatMap(sub => [
          { label: `  ${sub.name}`, href: sub.link, external: false },
          ...(sub.subcategories || []).map(subsub => ({
            label: `    ${subsub.name}`,
            href: subsub.link,
            external: false,
          })),
        ]),
      ])
    },
    legal: {
      title: uiCfg.footerLegalTitle,
      links: [
        { label: uiCfg.footerLegalTermsLabel, href: '/terminos', external: false },
        { label: uiCfg.footerLegalPrivacyLabel, href: '/privacidad', external: false },
        { label: uiCfg.footerLegalCookiesLabel, href: '/cookies', external: false },
        { label: uiCfg.footerLegalNoticeLabel, href: '/aviso-legal', external: false },
        { label: uiCfg.footerLegalWithdrawalLabel, href: CONTACT.WHATSAPP_LINK ? CONTACT.WHATSAPP_LINK + '?text=' + encodeURIComponent(footerCfg.withdrawalWhatsappMessage) : '/contacto', external: !!CONTACT.WHATSAPP_LINK },
      ]
    }
  };

  // Merge config-driven footer.sections override on top of defaults.
  // Each section can override links by id, or hide via fromCategories/empty links
  const footerSections: Record<string, { title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = { ...defaultSections } as any;
  if (Array.isArray(footerCfg.sections) && footerCfg.sections.length > 0) {
    for (const section of footerCfg.sections) {
      if (!section?.id) continue;
      const links = (section.links || []).map((l) => ({
        label: l.label || '',
        href: l.href || '#',
        external: !!l.external,
      }));
      footerSections[section.id] = {
        title: section.title || (footerSections[section.id]?.title ?? ''),
        links: links.length > 0 ? links : (footerSections[section.id]?.links ?? []),
      };
    }
  }

  const socialLinks = [
    ...(SOCIAL_LINKS.LINKEDIN ? [{ icon: Linkedin, href: SOCIAL_LINKS.LINKEDIN, label: 'LinkedIn' }] : []),
    ...(SOCIAL_LINKS.INSTAGRAM ? [{ icon: Instagram, href: SOCIAL_LINKS.INSTAGRAM, label: 'Instagram' }] : []),
  ];

  return (
    <footer className="bg-muted/50 border-t">
      {/* Features section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.SHIPPING_BENEFITS.map((feature) => {
              const Icon = getFeatureBenefitIcon(feature.icon);
              return (
                <div key={`${feature.icon}-${feature.title}-${feature.description}`} className="flex items-center justify-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              {ASSETS.FOOTER_LOGO_PATH ? (
                <img
                  src={ASSETS.FOOTER_LOGO_PATH}
                  alt={`${BRANDING.APP_NAME} Logo`}
                  className="h-10 w-auto"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {BRANDING.APP_NAME.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
            
            <p className="text-sm text-muted-foreground mb-6">
              {BRANDING.APP_DESCRIPTION}
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{BRANDING.CONTACT_ADDRESS}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{BRANDING.CONTACT_PHONE}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{BRANDING.CONTACT_EMAIL}</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button
                  key={`${social.label}-${social.href}`}
                  variant="outline"
                  size="icon"
                  asChild
                  className="w-8 h-8"
                >
                  <a 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    {link.external ? (
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* WhatsApp Notifications */}
        {footerCfg.showWhatsappCapture !== false && (
          <div className="mt-12 pt-8 border-t">
          <div className="max-w-md">
            <h3 className="font-semibold mb-2">{uiCfg.footerWhatsappTitle}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {uiCfg.footerWhatsappBody}
            </p>
            <form onSubmit={handleWhatsAppSubmit} className="flex space-x-2">
              <Input
                type="tel"
                placeholder={uiCfg.footerWhatsappPlaceholder}
                value={phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-primary"
                required
                pattern="[0-9+\s()-]+"
              />
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                {isSubmitting ? 'Enviando...' : uiCfg.footerWhatsappButton}
              </Button>
            </form>
          </div>
        </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {BRANDING.COMPANY_NAME}. {uiCfg.footerCopyrightSuffix} | v{__APP_VERSION__}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{uiCfg.footerPaymentMethodsLabel}</span>
              <div className="flex flex-wrap gap-2">
                {enabledPaymentMethods.map((method) => (
                  <div key={method} className="px-3 py-1 bg-muted rounded border flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {method}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
