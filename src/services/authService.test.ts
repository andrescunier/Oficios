import { extractBusinessPartnerIdFromAuthData, normalizeAuthEmail } from './authService';

describe('authService storefront contract helpers', () => {
  it('normaliza email para auth en minúsculas y sin espacios', () => {
    expect(normalizeAuthEmail('  Foo.Bar+Test@Example.COM  ')).toBe('foo.bar+test@example.com');
  });

  it('prefers top-level business_partner_id from auth payloads', () => {
    expect(extractBusinessPartnerIdFromAuthData({
      business_partner_id: 'bp-top',
      customer: { business_partner_id: 'bp-customer' },
      billing: { business_partner_id: 'bp-billing' },
      partner_id: 'bp-legacy',
    })).toBe('bp-top');
  });

  it('falls back to customer and billing business_partner_id when needed', () => {
    expect(extractBusinessPartnerIdFromAuthData({
      customer: { business_partner_id: 'bp-customer' },
      billing: { business_partner_id: 'bp-billing' },
    })).toBe('bp-customer');

    expect(extractBusinessPartnerIdFromAuthData({
      billing: { business_partner_id: 'bp-billing' },
    })).toBe('bp-billing');
  });

  it('keeps legacy partner_id only as last compatibility fallback', () => {
    expect(extractBusinessPartnerIdFromAuthData({
      partner_id: 'bp-legacy',
    })).toBe('bp-legacy');
  });
});
