// Small text helpers shared by list previews and detail pages

export function excerpt(text, length = 220) {
  if (!text) return '';
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > length ? `${flat.slice(0, length).trimEnd()}…` : flat;
}

export function readingTime(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

export function timeAgo(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  return formatDate(value);
}

const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;

// Splits text into plain-text and URL parts so links can be rendered as chips
export function splitLinks(text) {
  if (!text) return [];
  return text.split(URL_PATTERN).filter(Boolean).map((part) => ({
    text: part,
    isLink: /^https?:\/\//.test(part),
  }));
}

export function linkLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'youtu.be' || host.endsWith('youtube.com')) return '▶ Watch on YouTube';
    return `↗ ${host}`;
  } catch {
    return '↗ Link';
  }
}
