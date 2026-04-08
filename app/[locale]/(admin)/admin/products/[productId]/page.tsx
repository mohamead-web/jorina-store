import { ProductArchiveButton } from "@/components/admin/product-archive-button";
import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { getAdminProductEditorData } from "@/lib/services/admin-products";

export default async function AdminEditProductPage({
  params
}: {
  params: Promise<{ locale: string; productId: string }>;
}) {
  const { locale, productId } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const data = await getAdminProductEditorData(typedLocale, productId);

  if (!data.product) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.product.status !== "ARCHIVED" ? (
        <div className="flex justify-end">
          <ProductArchiveButton
            locale={typedLocale}
            productId={data.product.id}
            redirectToList
          />
        </div>
      ) : null}
      <ProductEditorForm
        locale={typedLocale}
        categories={data.categories}
        collections={data.collections}
        product={data.product}
      />
    </div>
  );
}
