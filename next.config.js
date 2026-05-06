/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages output mode
  output: "export",

  // Image optimization off for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for CF Pages
  trailingSlash: true,
};

module.exports = nextConfig;
