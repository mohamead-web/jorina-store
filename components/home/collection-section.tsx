import { Link } from "@/lib/i18n/navigation";
import { ProductGrid } from "@/components/shop/product-grid";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function CollectionSection({
  locale,
  eyebrow,
  title,
  description,
  href,
  products,
  favoriteIds
}: {
  locale: "ar" | "en";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  products: Array<{
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    price: number;
    compareAtPrice: number | null;
    imagePath: string;
    imageAlt: string;
    categoryName: string | null;
    inStock: boolean;
  }>;
  favoriteIds: Set<string>;
}) {
  return (
    <section className="page-section mt-14 lg:mt-16">
      <div className="section-container">
        <Reveal>
          <div className="mb-10 flex flex-col gap-6 border-t border-black/6 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow={eyebrow} title={title} description={description} />
            <Button asChild variant="secondary" className="bg-white/75">
              <Link href={href}>{locale === "ar" ? "عرض الكل" : "View all"}</Link>
            </Button>
          </div>
        </Reveal>
        <ProductGrid locale={locale} products={products} favoriteIds={favoriteIds} />
      </div>
    </section>
  );
}
