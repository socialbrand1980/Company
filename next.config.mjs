/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export for development (required for Sanity Studio)
  // Enable only for production deployment to GitHub Pages
  output: process.env.NEXT_PUBLIC_BASE_PATH ? 'export' : undefined,
  trailingSlash: process.env.NEXT_PUBLIC_BASE_PATH ? true : undefined,
  // Only use basePath for GitHub Pages production deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
