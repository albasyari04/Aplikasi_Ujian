// middleware.ts
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

    // ─── Admin Routes (ADMIN dan GURU) ───────────────────────
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // ✅ FIX: GURU juga diizinkan akses /admin
      if (token.role !== "ADMIN" && token.role !== "GURU") {
        // SISWA yang coba akses /admin → redirect ke dashboard siswa
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // ─── Dashboard Routes (khusus SISWA) ─────────────────────
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // ✅ FIX: ADMIN/GURU yang akses /dashboard → redirect ke admin
      if (token.role === "ADMIN" || token.role === "GURU") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }

      // Hanya SISWA yang boleh di sini
      if (token.role !== "SISWA") {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    // ─── Protected API Routes ─────────────────────────────────
    if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
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

        // Rute publik — tidak butuh autentikasi
        const publicRoutes = ["/login", "/", "/api/auth"]
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true
        }

        // Rute yang dilindungi — butuh token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/api/:path*",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|webp|webmanifest)).*)",
  ],
}