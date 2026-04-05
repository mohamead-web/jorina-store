import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function LocaleLoading() {
  return (
    <div className="page-section py-10">
      <div className="section-container grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
