// app/(dashboard)/loading.tsx
// ✅ File ini otomatis ditampilkan Next.js saat halaman sedang loading
// Mencegah UI "freeze" — user langsung lihat skeleton, bukan layar beku

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-7 w-48 rounded-xl bg-muted" />
      <div className="h-4 w-72 rounded-lg bg-muted/60" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-10 rounded-xl bg-muted/70" />
        <div className="h-10 rounded-xl bg-muted/50" />
        <div className="h-10 rounded-xl bg-muted/40" />
      </div>
    </div>
  )
}