import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="section-kicker mb-3">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl leading-tight text-text sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-sm leading-7 text-text-soft sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
