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
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https', // پروتکل مورد استفاده (معمولا https)
        hostname: 'res.cloudinary.com', // دامنه‌ای که می‌خواهید مجاز کنید
        // port: '', // اختیاری: اگر پورت خاصی نیاز است
        // pathname: '/your-account-path/**', // اختیاری: برای محدود کردن به مسیر خاصی در دامنه
      },
    ]
  },
  outputFileTracingIncludes: {
    '/**': ['./public/**/*'],
  }, // این را به سطح بالا منتقل کن
};

module.exports = nextConfig;
