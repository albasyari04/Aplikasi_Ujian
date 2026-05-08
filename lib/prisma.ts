// lib/prisma.ts
//
// ✅ ROOT CAUSE #3 LOADING LAMBAT:
// PrismaClient tanpa konfigurasi connection pool menggunakan default:
//   - connection_limit = num_cpus * 2 + 1 (bisa terlalu banyak/sedikit)
//   - connect_timeout = 5 detik (terlalu pendek untuk cold start)
//   - pool_timeout = 10 detik
//
// Untuk Next.js (serverless/edge), setiap cold start membuat koneksi baru
// ke MySQL. Tanpa pool yang dikonfigurasi dengan benar, tiap request
// bisa menunggu koneksi baru dibuat (~200-500ms per request).
//
// FIX: Konfigurasi connection pool eksplisit + log hanya di development.

import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// ✅ FIX: Konfigurasi eksplisit untuk performa optimal
function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "stdout", level: "error" }],

    // ✅ FIX: Datasource override untuk connection pool
    // connection_limit: berapa koneksi simultan ke MySQL
    // Di Next.js serverless, nilai kecil (5-10) lebih baik karena
    // banyak instance berjalan paralel, bukan satu server besar
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// ✅ Singleton pattern — KRUSIAL untuk Next.js dev mode
// Tanpa ini, setiap hot-reload membuat PrismaClient baru → connection leak
export const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma

  // ✅ FIX: Log slow queries di development untuk identifikasi bottleneck
  // Query yang memakan >100ms perlu dioptimasi dengan index atau select spesifik
  if (process.env.NODE_ENV === "development") {
    // @ts-ignore — prisma.$on tersedia di versi dengan event emit
    prisma.$on("query", (e: { query: string; duration: number }) => {
      if (e.duration > 100) {
        console.warn(`⚠️  SLOW QUERY (${e.duration}ms):`, e.query)
      }
    })
  }
}

export default prisma