import { Reveal } from "@/components/ui/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { SkeletonCard } from "@/components/ui/skeleton-card";

function chunkProducts<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

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
    <div className="space-y-4 sm:space-y-5">
      {chunkProducts(products, 3).map((row, rowIndex) => (
        <Reveal key={row.map((product) => product.id).join("-")} delay={rowIndex * 0.06}>
          <div className="grid gap-4 min-[390px]:grid-cols-2 xl:grid-cols-3">
            {row.map((product) => (
              <ProductCard
                key={product.id}
                locale={locale}
                product={product}
                isFavorite={favoriteIds?.has(product.id)}
              />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
