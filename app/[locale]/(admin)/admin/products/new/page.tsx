import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { getAdminProductEditorData } from "@/lib/services/admin-products";

export default async function AdminNewProductPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale === "en" ? "en" : "ar";
  const data = await getAdminProductEditorData(typedLocale);

  return (
    <ProductEditorForm
      locale={typedLocale}
      categories={data.categories}
      collections={data.collections}
      product={null}
    />
  );
}
