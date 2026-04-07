import { Reveal } from "@/components/ui/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { SkeletonCard } from "@/components/ui/skeleton-card";


export function ProductGrid({
  locale,
  products,
  favoriteIds,
  loading = false
}: {
  locale: "ar" | "en";
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
  favoriteIds?: Set<string>;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 min-[390px]:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 min-[390px]:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => {
        // Option 3: If the total number of products is odd, hide the very last product on 2-column layouts (mobile/tablet) to prevent an empty slot on the left.
        const isOddTotal = products.length % 2 !== 0;
        const isLastItem = index === products.length - 1;
        const hideOnMobile = isOddTotal && isLastItem;

        return (
          <Reveal 
            key={product.id} 
            delay={index * 0.06}
            className={hideOnMobile ? "max-xl:hidden" : ""}
          >
            <ProductCard
              locale={locale}
              product={product}
              isFavorite={favoriteIds?.has(product.id)}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
