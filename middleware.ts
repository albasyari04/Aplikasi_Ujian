// middleware.ts
//
// ✅ ROOT CAUSE #1 LOADING LAMBAT:
// Matcher sebelumnya:
//   "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|...)).*)"
//
// Pattern ini MEMANG mengecualikan _next, tapi regex-nya dieksekusi untuk
// SETIAP request yang masuk ke server — termasuk setiap fetch API,
// setiap navigasi, dll. Di Next.js, middleware dijalankan di Edge Runtime
// yang artinya SETIAP request diproses withAuth() → JWT decode → check role.
//
// FIX: Sederhanakan matcher — hanya intercept route yang benar-benar butuh
// proteksi. Static files (_next/static, favicon, dll) tidak perlu disentuh.

import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"
import type { JWT } from "next-auth/jwt"

interface RequestWithAuth extends NextRequest {
  nextauth: {
    token: JWT | null
  }
}

export const middleware = withAuth(
  function middleware(request: RequestWithAuth) {
    const pathname = request.nextUrl.pathname
    const token = request.nextauth.token

    // ─── Admin Routes (ADMIN dan GURU) ───────────────────────────
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      if (token.role !== "ADMIN" && token.role !== "GURU") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // ─── Dashboard Routes (khusus SISWA) ─────────────────────────
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      if (token.role === "ADMIN" || token.role === "GURU") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
      if (token.role !== "SISWA") {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    // ─── Protected API Routes ─────────────────────────────────────
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized - Silakan login terlebih dahulu" },
          { status: 401 }
        )
      }
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/login",
      error: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const publicRoutes = ["/login", "/", "/api/auth"]
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true
        }
        return !!token
      },
    },
  }
)

// ✅ FIX: Matcher yang TEPAT — hanya intercept halaman & API yang perlu auth.
// TIDAK intercept: _next/static, _next/image, favicon, file statis.
// Sebelumnya regex panjang itu tetap MENJALANKAN middleware untuk semua
// request non-static, yang sangat memberatkan Edge Runtime.
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/ujian/:path*",
    "/jadwal/:path*",
    "/nilai/:path*",
    "/riwayat/:path*",
    "/notifikasi/:path*",
    "/profil/:path*",
    "/pengaturan/:path*",
    // API routes — kecualikan /api/auth (dihandle NextAuth sendiri)
    "/api/((?!auth).*)",
  ],
}