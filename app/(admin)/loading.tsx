// app/(admin)/loading.tsx
// ✅ File ini otomatis ditampilkan Next.js saat halaman admin sedang loading

export default function AdminLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      {/* Page title skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-muted" />
        <div className="h-7 w-56 rounded-xl bg-muted" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted" />
        ))}
      </div>

      {/* Toolbar skeleton (search + filter) */}
      <div className="flex gap-3 pt-1">
        <div className="flex-1 h-10 rounded-xl bg-muted/70" />
        <div className="h-10 w-28 rounded-xl bg-muted/60" />
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-2 pt-1">
        <div className="h-12 rounded-xl bg-muted/50" />
        <div className="h-12 rounded-xl bg-muted/40" />
        <div className="h-12 rounded-xl bg-muted/30" />
        <div className="h-12 rounded-xl bg-muted/20" />
      </div>
    </div>
  )
}