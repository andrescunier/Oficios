/**
 * Seguimiento de pedido — textos desde ecommerce-config (ui.tracking*).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MessageCircle,
  Package,
  Truck,
} from 'lucide-react';
import { CONTACT } from '@/config/branding';
import { getAppConfig, getUIConfig } from '@/config/runtime';

export const OrderTracking: React.FC = () => {
  const ui = getUIConfig();
  const app = getAppConfig();
  const whatsappNumber = CONTACT.WHATSAPP;
  const whatsappMessage = encodeURIComponent(
    'Hola! Quiero consultar el estado de mi pedido. Número de pedido: ',
  );
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : '/contacto';

  const steps = [
    {
      icon: FileText,
      title: ui.trackingStep1Title,
      body: ui.trackingStep1Body,
    },
    {
      icon: MessageCircle,
      title: ui.trackingStep2Title,
      body: ui.trackingStep2Body,
    },
    {
      icon: Truck,
      title: ui.trackingStep3Title,
      body: ui.trackingStep3Body,
    },
  ];

  const statuses = [
    { label: ui.trackingStatus1Label, desc: ui.trackingStatus1Desc },
    { label: ui.trackingStatus2Label, desc: ui.trackingStatus2Desc },
    { label: ui.trackingStatus3Label, desc: ui.trackingStatus3Desc },
    { label: ui.trackingStatus4Label, desc: ui.trackingStatus4Desc },
  ];

  const faqs = [
    { q: ui.trackingFaq1Question, a: ui.trackingFaq1Answer },
    { q: ui.trackingFaq2Question, a: ui.trackingFaq2Answer },
    { q: ui.trackingFaq3Question, a: ui.trackingFaq3Answer },
    { q: ui.trackingFaq4Question, a: ui.trackingFaq4Answer },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Link
            to="/"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {ui.trackingBackLabel}
          </Link>
          <div className="max-w-3xl">
            {app.name ? (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                {app.name}
              </p>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {ui.trackingPageTitle}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{ui.trackingSubtitle}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{ui.trackingWhatsappTitle}</h2>
            <p className="mt-2 text-muted-foreground">{ui.trackingWhatsappBody}</p>
            <a
              href={whatsappUrl}
              target={whatsappNumber ? '_blank' : undefined}
              rel={whatsappNumber ? 'noopener noreferrer' : undefined}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {ui.trackingWhatsappLabel}
            </a>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background text-primary">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{ui.trackingHelpTitle}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{ui.trackingHelpBody}</p>
            <Link
              to="/contacto"
              className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              {ui.trackingHelpCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">{ui.trackingHowTitle}</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
            {ui.trackingStatusSectionTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statuses.map((status, index) => (
              <div key={status.label} className="rounded-2xl border bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Paso {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{status.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{status.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
              {ui.trackingFaqTitle}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border bg-card px-5 py-4 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
                    <span className="flex items-start justify-between gap-4">
                      {faq.q}
                      <span className="text-muted-foreground transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderTracking;
