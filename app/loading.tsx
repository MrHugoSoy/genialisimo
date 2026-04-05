export default function Loading() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 pt-20 pb-16 flex gap-7">
      {/* Sidebar skeleton */}
      <div className="w-48 shrink-0 hidden lg:block space-y-2 pt-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-9 skeleton rounded-lg" />
        ))}
      </div>

      {/* Feed skeleton */}
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex gap-3 mb-5">
          <div className="h-8 w-32 skeleton rounded" />
          <div className="h-6 w-20 skeleton rounded-full" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-4 flex gap-3">
              <div className="w-9 h-9 skeleton rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 skeleton rounded w-28" />
                <div className="h-3 skeleton rounded w-16" />
              </div>
            </div>
            <div className="px-4 pb-3">
              <div className="h-5 skeleton rounded w-3/4" />
            </div>
            <div className="h-64 skeleton" />
            <div className="p-4 flex gap-3">
              <div className="h-8 w-24 skeleton rounded-lg" />
              <div className="h-8 w-20 skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Right sidebar skeleton */}
      <div className="w-56 shrink-0 hidden xl:block space-y-3">
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <div className="h-5 skeleton rounded w-24" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-4 h-4 skeleton rounded" />
              <div className="w-10 h-8 skeleton rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 skeleton rounded" />
                <div className="h-2 skeleton rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
