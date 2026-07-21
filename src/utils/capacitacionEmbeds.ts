/** Allowlist y normalización de embeds para capacitaciones. */

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

const IFRAME_HOSTS = new Set([
  ...YOUTUBE_HOSTS,
  ...VIMEO_HOSTS,
  'docs.google.com',
  'forms.gle',
  'drive.google.com',
  'www.google.com',
  'player.vimeo.com',
]);

const asHost = (raw: string): string | null => {
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
};

export const isAllowedEmbedHost = (url: string): boolean => {
  const host = asHost(url);
  if (!host) return false;
  return IFRAME_HOSTS.has(host) || host.endsWith('.google.com');
};

export const toYoutubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(host)) return null;
    let videoId = '';
    if (host.includes('youtu.be')) {
      videoId = parsed.pathname.replace('/', '').trim();
    } else {
      videoId = parsed.searchParams.get('v') || '';
      if (!videoId && parsed.pathname.includes('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
      }
      if (!videoId && parsed.pathname.includes('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      }
    }
    if (!videoId) return null;
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
  } catch {
    return null;
  }
};

export const toVimeoEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!VIMEO_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    if (parsed.hostname.includes('player.vimeo.com')) return url;
    const id = parsed.pathname.split('/').filter(Boolean)[0];
    if (!id || !/^\d+$/.test(id)) return null;
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return null;
  }
};

export const toSafeEmbedUrl = (
  url: string,
  provider?: string,
): { src: string; kind: 'video' | 'iframe' } | null => {
  if (!url || !isAllowedEmbedHost(url)) return null;
  const providerKey = (provider || '').toLowerCase();
  if (providerKey === 'youtube' || url.includes('youtu')) {
    const yt = toYoutubeEmbedUrl(url);
    return yt ? { src: yt, kind: 'video' } : null;
  }
  if (providerKey === 'vimeo' || url.includes('vimeo')) {
    const vm = toVimeoEmbedUrl(url);
    return vm ? { src: vm, kind: 'video' } : null;
  }
  return { src: url, kind: 'iframe' };
};

export type CapacitacionBlock =
  | { type: 'text'; title?: string; body: string }
  | { type: 'video'; title?: string; url: string; provider?: string }
  | { type: 'iframe'; title?: string; url: string; aspect?: string; minHeight?: number }
  | { type: 'checklist'; title?: string; items: string[] };

export const getCapacitacionBlocks = (
  metadata: Record<string, unknown> | null | undefined,
): CapacitacionBlock[] => {
  const raw = metadata?.content_blocks;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is CapacitacionBlock => {
    if (!item || typeof item !== 'object') return false;
    const type = String((item as { type?: string }).type || '');
    return ['text', 'video', 'iframe', 'checklist'].includes(type);
  });
};
