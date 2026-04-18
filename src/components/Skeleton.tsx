export function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl p-5 min-h-[120px] border border-neutral-800 bg-neutral-900/50 overflow-hidden relative">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-neutral-800" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 bg-neutral-800 rounded" />
          <div className="h-4 w-3/4 bg-neutral-800 rounded" />
          <div className="h-4 w-1/2 bg-neutral-800 rounded" />
        </div>
      </div>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  )
}
