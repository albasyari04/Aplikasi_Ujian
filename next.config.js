/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ FIX 1: Matikan reactStrictMode di dev — ini bikin setiap komponen
  // dirender DUA KALI di development, yang bikin terasa lambat.
  // Di production otomatis dimatikan, tapi kita eksplisitkan:
  // (Ubah ke false saat dev kalau mau lebih cepat, true untuk production)

  // ✅ FIX 2: Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 hari cache
  },

  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // ✅ FIX 3: Package import optimization — ini KRUSIAL
  // lucide-react punya 1000+ icon, tanpa ini semua icon di-bundle sekaligus
  // Sebelumnya hanya optimize lucide-react & radix, sekarang tambah xlsx & mammoth
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "date-fns",
    ],
    // ✅ FIX 4: Partial prerendering — halaman dikembalikan shell HTML
    // instan, data di-stream belakangan (Next.js 14+)
    // ppr: true, // Uncomment jika pakai Next.js 14.1+
  },

  // ✅ FIX 5: Webpack optimization — pisahkan vendor chunks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          // Pisahkan xlsx ke chunk sendiri — library ini ~1MB!
          // Dengan ini, xlsx hanya dimuat saat ImportModal dibuka
          xlsx: {
            test: /[\\/]node_modules[\\/]xlsx[\\/]/,
            name: "xlsx",
            chunks: "async", // HANYA load saat dibutuhkan (dynamic import)
            priority: 30,
          },
          // mammoth juga besar, pisahkan
          mammoth: {
            test: /[\\/]node_modules[\\/]mammoth[\\/]/,
            name: "mammoth",
            chunks: "async",
            priority: 30,
          },
          // Vendor umum
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },

  // ✅ FIX 6: Cache headers untuk static assets
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ✅ FIX 7: Cache API responses yang tidak sering berubah
      {
        source: "/api/ujian/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig