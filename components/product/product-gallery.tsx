import Image from "next/image";

export function ProductGallery({
  images,
  title
}: {
  images: Array<{ id: string; path: string; alt: string }>;
  title: string;
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="premium-card relative aspect-[0.84] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,#fff_0%,#f8f0ee_100%)] sm:aspect-[0.92]">
        <Image
          src={images[0]?.path ?? "/assets/products/placeholder.svg"}
          alt={images[0]?.alt ?? title}
          fill
          className="object-contain p-5 sm:p-8"
          sizes="(max-width: 1024px) 100vw, 48vw"
          priority
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {images.slice(1, 4).map((image) => (
            <div
              key={image.id}
              className="premium-card relative aspect-square w-24 shrink-0 overflow-hidden rounded-[1.2rem] bg-[linear-gradient(180deg,#fff_0%,#f8f0ee_100%)] sm:w-auto"
            >
              <Image
                src={image.path}
                alt={image.alt}
                fill
                className="object-contain p-3"
                sizes="(max-width: 1024px) 33vw, 12vw"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
