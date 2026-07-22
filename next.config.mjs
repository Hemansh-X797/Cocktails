/** @type {import('next').NextConfig} */

// STATIC_EXPORT=true npm run build   -> produces /out for Tauri, Electron, Capacitor
// (unset)                            -> standard Next.js server build with API routes (dashboard uploads)
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        output: 'export',
        images: { unoptimized: true },
      }
    : {
        images: {
          remotePatterns: [
            { protocol: 'https', hostname: '**' },
          ],
        },
      }),
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
