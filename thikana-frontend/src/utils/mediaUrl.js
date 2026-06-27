const FALLBACK_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

export const getBackendOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

  if (apiUrl.startsWith('http')) {
    return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  }

  // When VITE_API_URL is /api/v1, use Vite proxy:
  // /uploads/... will be proxied to backend by vite.config.js
  return '';
};

export const getMediaUrl = (url, fallback = FALLBACK_PROPERTY_IMAGE) => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
  return `${getBackendOrigin()}${normalizedUrl}`;
};

export { FALLBACK_PROPERTY_IMAGE };