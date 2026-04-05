export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="p-4 flex gap-3">
        <div className="w-9 h-9 skeleton rounded-full shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 skeleton rounded w-28" />
          <div className="h-2.5 skeleton rounded w-16" />
        </div>
        <div className="h-6 w-20 skeleton rounded-full" />
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-1/2" />
      </div>
      <div className="h-72 skeleton" />
      <div className="p-4 flex gap-3 border-t border-border">
        <div className="h-8 w-10 skeleton rounded-lg" />
        <div className="h-8 w-12 skeleton rounded-lg" />
        <div className="h-8 w-10 skeleton rounded-lg" />
        <div className="h-8 w-24 skeleton rounded-lg" />
        <div className="h-8 w-24 skeleton rounded-lg ml-auto" />
      </div>
    </div>
  )
}
