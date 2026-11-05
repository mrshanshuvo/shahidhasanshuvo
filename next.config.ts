import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.userway.org https://api.userway.org https://www.google.com https://www.gstatic.com https://vercel.live https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://cdn.userway.org;
  img-src 'self' blob: data: https://res.cloudinary.com https://cdn.userway.org https://*.google.com https://*.googleusercontent.com;
  font-src 'self' data: https://cdn.userway.org;
  connect-src 'self' https://api.userway.org https://cdn.userway.org https://www.google.com https://res.cloudinary.com https://*.vercel-insights.com https://vitals.vercel-insights.com;
  frame-src 'self' https://www.google.com https://recaptcha.google.com https://www.youtube.com https://player.vimeo.com https://codesandbox.io https://codepen.io https://stackblitz.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
