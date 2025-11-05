// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suprimir warnings de hydration causados por extensiones del navegador
  experimental: {
    suppressHydrationWarning: true
  }
}

module.exports = nextConfig
