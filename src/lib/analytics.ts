/**
 * Lightweight analytics dispatcher driven by ecommerce-config.
 * Bootstraps GA4, GTM, Facebook Pixel, Hotjar and Microsoft Clarity from
 * runtime config. Respects consent gating when configured.
 */
import { getAnalyticsConfig, getConsentConfig } from '@/config/runtime';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    __analyticsBootstrapped__?: boolean;
    __analyticsConsentGranted__?: boolean;
  }
}

const isBrowser = (): boolean => typeof window !== 'undefined';

function injectScript(src: string, id: string, async = true): void {
  if (!isBrowser()) return;
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = async;
  script.src = src;
  document.head.appendChild(script);
}

function injectInline(code: string, id: string): void {
  if (!isBrowser()) return;
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.text = code;
  document.head.appendChild(script);
}

export function consentGranted(): boolean {
  if (!isBrowser()) return false;
  const cfg = getConsentConfig();
  if (!cfg.enabled) return true;
  if (window.__analyticsConsentGranted__) return true;
  try {
    const stored = localStorage.getItem(cfg.storageKey);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed?.analytics === true || parsed?.accepted === true;
  } catch {
    return false;
  }
}

export function setConsent(granted: boolean): void {
  if (!isBrowser()) return;
  const cfg = getConsentConfig();
  try {
    localStorage.setItem(
      cfg.storageKey,
      JSON.stringify({ accepted: granted, analytics: granted, timestamp: Date.now() }),
    );
  } catch {
    /* ignore */
  }
  window.__analyticsConsentGranted__ = granted;
  if (granted) {
    bootstrapAnalytics();
  }
}

export function bootstrapAnalytics(): void {
  if (!isBrowser()) return;
  if (window.__analyticsBootstrapped__) return;
  const cfg = getAnalyticsConfig();
  if (!cfg.enabled) return;
  const consent = getConsentConfig();
  if (consent.enabled && consent.blockAnalyticsUntilConsent && !consentGranted()) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (window.dataLayer as any[]).push(arguments);
    };
  }

  if (cfg.gtmContainerId) {
    injectInline(
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${cfg.gtmContainerId}');`,
      'gtm-bootstrap',
    );
  }

  if (cfg.ga4MeasurementId) {
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${cfg.ga4MeasurementId}`, 'ga4-script');
    window.gtag('js', new Date());
    window.gtag('config', cfg.ga4MeasurementId, {
      anonymize_ip: cfg.anonymizeIp,
      send_page_view: cfg.trackPageViews,
    });
  }

  if (cfg.facebookPixelId) {
    injectInline(
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${cfg.facebookPixelId}');fbq('track', 'PageView');`,
      'fb-pixel-bootstrap',
    );
  }

  if (cfg.hotjarId) {
    injectInline(
      `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${cfg.hotjarId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-',' .js?sv=');`,
      'hotjar-bootstrap',
    );
  }

  if (cfg.clarityId) {
    injectInline(
      `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','${cfg.clarityId}');`,
      'clarity-bootstrap',
    );
  }

  window.__analyticsBootstrapped__ = true;
}

export function trackPageView(path: string, title?: string): void {
  if (!isBrowser()) return;
  const cfg = getAnalyticsConfig();
  if (!cfg.enabled || !cfg.trackPageViews) return;
  if (cfg.ga4MeasurementId && window.gtag) {
    window.gtag('event', 'page_view', { page_path: path, page_title: title });
  }
  if (cfg.facebookPixelId && window.fbq) {
    window.fbq('track', 'PageView');
  }
  if (cfg.gtmContainerId && window.dataLayer) {
    window.dataLayer.push({ event: 'page_view', page: path, title });
  }
}

export function trackEvent(event: string, params: Record<string, any> = {}): void {
  if (!isBrowser()) return;
  const cfg = getAnalyticsConfig();
  if (!cfg.enabled) return;
  if (window.gtag) window.gtag('event', event, params);
  if (window.dataLayer) window.dataLayer.push({ event, ...params });
}

export function trackEcommerceEvent(event: string, payload: Record<string, any>): void {
  const cfg = getAnalyticsConfig();
  if (!cfg.trackEcommerce) return;
  trackEvent(event, payload);
}
