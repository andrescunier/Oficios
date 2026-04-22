import { getNewsletterConfig } from '@/config/runtime';

export async function subscribeToNewsletter(email: string): Promise<void> {
  const newsletter = getNewsletterConfig();

  if (!newsletter.enabled || !newsletter.endpoint.trim()) {
    throw new Error('newsletter_not_configured');
  }

  const response = await fetch(newsletter.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...newsletter.headers,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(`newsletter_request_failed:${response.status}`);
  }
}
