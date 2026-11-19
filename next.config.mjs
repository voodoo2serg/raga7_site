/** @type {import('next').NextConfig} */
export default {
  // Served under https://raga.vodopetov.ru/cabinet (canonical host; not raga7.*).
  basePath: '/cabinet',
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    // Next.js App Router emits inline RSC flight scripts.
    // Without 'unsafe-inline', the page flashes SSR HTML then goes blank.
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://yoomoney.ru https://*.yookassa.ru https://auth.robokassa.ru",
    ].join('; ');
    return [
      {
        source: '/:path*',
        headers: [
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
          {key: 'Content-Security-Policy', value: csp},
        ],
      },
    ];
  },
};
