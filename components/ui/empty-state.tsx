import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

export function EmptyState({
  title,
  body,
  ctaLabel,
  ctaHref
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="premium-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 h-20 w-20 rounded-full bg-background-soft" />
      <h3 className="font-display text-2xl text-text">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-text-soft">{body}</p>
      {ctaLabel && ctaHref ? (
        <Button asChild className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
