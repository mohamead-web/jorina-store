export function SkeletonCard() {
  return (
    <div className="premium-card overflow-hidden">
      <div className="aspect-[0.85] animate-pulse bg-background-soft" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-24 animate-pulse rounded-full bg-background-soft" />
        <div className="h-6 w-2/3 animate-pulse rounded-full bg-background-soft" />
        <div className="h-4 w-full animate-pulse rounded-full bg-background-soft" />
      </div>
    </div>
  );
}
