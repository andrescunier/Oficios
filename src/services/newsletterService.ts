import { getNewsletterConfig } from '@/config/runtime';

type SubscribePayload = { email: string } | { telefono: string };

async function postSubscription(payload: SubscribePayload): Promise<void> {
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
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`newsletter_request_failed:${response.status}`);
  }
}

export async function subscribeToNewsletter(email: string): Promise<void> {
  return postSubscription({ email });
}

export async function subscribePhoneToNewsletter(telefono: string): Promise<void> {
  return postSubscription({ telefono });
}
