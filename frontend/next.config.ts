/** @type {import('next').NextConfig} */
const nextConfig = {
  // Puerto personalizado para desarrollo
  env: {
    CUSTOM_PORT: '9090',
  },
  
  // Configuración de imágenes
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '7070',
        pathname: '/uploads/**',
      },
    ],
  },

  // Configuración experimental
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;