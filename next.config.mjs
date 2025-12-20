/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

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
  // Note: appDir and serverActions are enabled by default in Next.js 15
  experimental: {
    // serverActions is enabled by default in Next.js 15
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
