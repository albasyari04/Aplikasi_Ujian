// app/layout.tsx
//
// ✅ ROOT CAUSE #2 LOADING LAMBAT:
// Layout sebelumnya tidak mendefinisikan font sama sekali.
// Ini berarti browser jatuh ke system font ATAU (lebih buruk) ada font
// yang di-load via CSS/Tailwind dari Google Fonts sebagai render-blocking
// resource — browser BERHENTI render HTML sampai font selesai diunduh.
//
// FIX: Gunakan next/font/google yang:
//   1. Men-download font saat build time (bukan runtime)
//   2. Self-host font di server kita sendiri
//   3. Zero layout shift (font-display: swap otomatis)
//   4. Tidak ada request ke fonts.googleapis.com saat runtime

import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { PreferencesProvider } from "@/components/PreferencesProvider"
import { Providers } from "./providers"

// ✅ FIX: next/font otomatis self-host & zero layout shift
// subsets: hanya load karakter Latin (bukan semua 1000+ karakter)
// display: "swap" → teks langsung tampil pakai fallback font, baru diganti
// variable: bisa pakai CSS variable di Tailwind config
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  // preload: true adalah default — font di-preload otomatis
})

export const metadata: Metadata = {
  title: {
    default: "SMA Al-Istiqomah - Sistem Ujian Online",
    template: "%s | SMA Al-Istiqomah",
  },
  description: "Platform ujian online terpadu untuk SMA Al-Istiqomah",
  // ✅ FIX: Tambah robots dan viewport untuk performa
  robots: {
    index: false, // Aplikasi internal, tidak perlu diindeks
    follow: false,
  },
}

// ✅ FIX: Pisahkan viewport ke export sendiri (Next.js 14+ best practice)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`h-full antialiased ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
         * ✅ FIX: DNS prefetch untuk koneksi database/auth yang dibuat
         * saat halaman pertama kali load. Ini mengurangi latency DNS lookup.
         * Sesuaikan domain dengan server database/auth kamu.
         */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body className={`min-h-full flex flex-col ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PreferencesProvider>
            <Providers>{children}</Providers>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}