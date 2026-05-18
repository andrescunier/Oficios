/**
 * Lightweight SEO head manager driven by ecommerce-config.
 * Updates document.title, meta tags and JSON-LD without external libs.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoConfig, getBrandingConfig, getAppConfig, type SeoMeta } from '@/config/runtime';

const MANAGED_ATTR = 'data-seo-managed';

function ensureMeta(selector: string, create: () => HTMLMetaElement | HTMLLinkElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    el.setAttribute(MANAGED_ATTR, 'true');
    document.head.appendChild(el);
  }
  return el;
}

function setMetaName(name: string, content?: string) {
  if (!content) return;
  const el = ensureMeta(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('name', name);
    return m;
  });
  el.setAttribute('content', content);
}

function setMetaProperty(prop: string, content?: string) {
  if (!content) return;
  const el = ensureMeta(`meta[property="${prop}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('property', prop);
    return m;
  });
  el.setAttribute('content', content);
}

function setLink(rel: string, href?: string) {
  if (!href) return;
  const el = ensureMeta(`link[rel="${rel}"]`, () => {
    const l = document.createElement('link');
    l.setAttribute('rel', rel);
    return l;
  }) as HTMLLinkElement;
  el.href = href;
}

function setJsonLd(id: string, data: any) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.text = JSON.stringify(data);
}

export interface ApplySeoOptions {
  pathname?: string;
  override?: SeoMeta;
}

function applyTitleTemplate(template: string | undefined, title: string): string {
  const safeTemplate = template || '%s';
  if (safeTemplate.includes('{title}')) {
    return safeTemplate.split('{title}').join(title);
  }
  return safeTemplate.replace('%s', title);
}

export function applySeo({ pathname = '/', override }: ApplySeoOptions = {}): void {
  if (typeof document === 'undefined') return;
  const seo = getSeoConfig();
  const branding = getBrandingConfig();
  const app = getAppConfig();
  const routeMeta = seo.routes[pathname] || seo.routes['*'] || {};

  const title = override?.title || routeMeta.title || seo.defaultTitle || app.name;
  const finalTitle = applyTitleTemplate(seo.titleTemplate, title);
  document.title = finalTitle;

  const description = override?.description || routeMeta.description || seo.defaultDescription || app.description;
  const keywords = override?.keywords || routeMeta.keywords || seo.defaultKeywords;
  const ogTitle = override?.ogTitle || routeMeta.ogTitle || finalTitle;
  const ogDescription = override?.ogDescription || routeMeta.ogDescription || description;
  const ogImage = override?.ogImage || routeMeta.ogImage || seo.defaultOgImage || branding.ogImage;
  const ogType = override?.ogType || routeMeta.ogType || 'website';
  const twitterCard = override?.twitterCard || routeMeta.twitterCard || 'summary_large_image';
  const canonical = override?.canonical || routeMeta.canonical;
  const noindex = override?.noindex ?? routeMeta.noindex ?? false;

  setMetaName('description', description);
  setMetaName('keywords', keywords);
  setMetaName('robots', noindex ? 'noindex,nofollow' : 'index,follow');
  setMetaProperty('og:title', ogTitle);
  setMetaProperty('og:description', ogDescription);
  setMetaProperty('og:image', ogImage);
  setMetaProperty('og:type', ogType);
  setMetaProperty('og:url', canonical || (typeof window !== 'undefined' ? window.location.href : ''));
  setMetaName('twitter:card', twitterCard);
  if (seo.twitterHandle) setMetaName('twitter:site', seo.twitterHandle);
  setMetaName('twitter:title', ogTitle);
  setMetaName('twitter:description', ogDescription);
  setMetaName('twitter:image', ogImage);
  if (canonical) setLink('canonical', canonical);
  if (branding.favicon) setLink('icon', branding.favicon);

  if (seo.enableJsonLd && seo.organization.name) {
    setJsonLd('ld-organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: seo.organization.name,
      url: seo.organization.url || app.url,
      logo: seo.organization.logo || branding.logo,
      sameAs: seo.organization.sameAs,
    });
  }
}

export function setProductJsonLd(product: {
  name: string;
  description?: string;
  sku?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock';
  url?: string;
}): void {
  if (typeof document === 'undefined') return;
  const seo = getSeoConfig();
  if (!seo.enableJsonLd || !seo.enableProductJsonLd) return;
  setJsonLd('ld-product', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image,
    offers: product.price !== undefined
      ? {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'ARS',
          availability:
            product.availability === 'out_of_stock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          url: product.url,
        }
      : undefined,
  });
}

export function clearProductJsonLd(): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('ld-product');
  if (el) el.remove();
}

export function useSeo(override?: SeoMeta): void {
  const location = useLocation();
  useEffect(() => {
    applySeo({ pathname: location.pathname, override });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, JSON.stringify(override || {})]);
}

export function SeoHead({ override }: { override?: SeoMeta }): null {
  useSeo(override);
  return null;
}
