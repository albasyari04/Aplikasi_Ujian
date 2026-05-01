import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider }       from "@/components/ThemeProvider"
import { PreferencesProvider } from "@/components/PreferencesProvider"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "SMA Al-Istiqomah - Sistem Ujian Online",
  description: "Platform ujian online terpadu untuk SMA Al-Istiqomah",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PreferencesProvider>
            <Providers>
              {children}
            </Providers>
          </PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}