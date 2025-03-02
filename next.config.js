// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//       },
//       {
//         protocol: 'https',
//         hostname: '*.supabase.co',
//       }
//     ],
//   },
//   // Ensure trailing slashes for static export
//   trailingSlash: true,
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    '/**': ['./public/**/*'],
  }, // این را به سطح بالا منتقل کن
};

module.exports = nextConfig;
