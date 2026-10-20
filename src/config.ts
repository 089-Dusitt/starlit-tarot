export const SITE = {
  name: 'Starlit Tarot',
  thaiName: 'ทาโรต์ลายดาว',
  url:
    import.meta.env?.VITE_SITE_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${import.meta.env?.BASE_URL || '/'}`
      : ''),
  base: import.meta.env?.BASE_URL || '/',
} as const;
