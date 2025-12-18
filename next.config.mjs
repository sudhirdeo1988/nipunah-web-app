/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Enable SWC minification for better builds
  swcMinify: true,

  // Enable SCSS support (built-in)
  sassOptions: {
    prependData: `@import "src/styles/_settings.scss";`,
  },

  // Custom image domains if you're using <Image> component
  images: {
    domains: ["images.example.com", "cdn.example.com"],
  },

  // Runtime environment variable exposure (NEXT_PUBLIC_* are auto-exposed)
  env: {
    CUSTOM_SECRET: process.env.CUSTOM_SECRET, // Used server-side
  },

  // Experimental settings
  experimental: {
    appDir: true, // using /app directory
    serverActions: true,
  },

  // Optional: Internationalization
  // Note: i18n is not fully supported in App Router, but keeping for compatibility
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  // Optional: Custom headers (CSP, CORS, etc.)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Optional: Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Optional: Rewrites (useful for API proxying)
  // Disabled - we're using Next.js API routes as proxies instead
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "https://api.example.com/:path*",
  //     },
  //   ];
  // },

  // Generate source maps in production for debugging
  productionBrowserSourceMaps: true,
};

export default nextConfig;
