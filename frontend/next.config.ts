import type { NextConfig } from "next";

const ML_FORECAST_INTERNAL =
    process.env.ML_FORECAST_INTERNAL_URL ?? "http://localhost:8086";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bucket-de-prueba-smartlogix.s3.us-east-1.amazonaws.com', // ¡IMPORTANTE! Reemplaza esto con el dominio real de tu bucket
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
  async rewrites() {
    return [
      { source: "/ml-dashboard",        destination: `${ML_FORECAST_INTERNAL}/dashboard` },
      { source: "/ml-dashboard/",       destination: `${ML_FORECAST_INTERNAL}/dashboard` },
      { source: "/ml-dashboard/:path*", destination: `${ML_FORECAST_INTERNAL}/dashboard/:path*` },
      { source: "/ml-api/:path*",       destination: `${ML_FORECAST_INTERNAL}/:path*` },
    ];
  },
};

export default nextConfig;