"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveAdminProductAction } from "@/lib/actions/admin-product-actions";
import { adminProductSchema, type AdminProductInput } from "@/lib/validators/admin-product";
import { cn, slugify } from "@/lib/utils";

type Locale = "ar" | "en";
type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

type ProductEditorOption = {
  id: string;
  slug: string;
  label: string;
};

type ProductEditorRecord = {
  id: string;
  slug: string;
  sku: string;
  status: ProductStatus;
  basePrice: number;
  compareAtPrice: number | null;
  totalStock: number;
  translations: {
    ar: {
      name: string;
      shortDescription: string;
      longDescription: string;
      ingredients: string | null;
      howToUse: string | null;
      seoTitle: string | null;
      seoDescription: string | null;
    };
    en: {
      name: string;
      shortDescription: string;
      longDescription: string;
      ingredients: string | null;
      howToUse: string | null;
      seoTitle: string | null;
      seoDescription: string | null;
    };
  };
  images: Array<{
    id?: string;
    path: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: Array<{
    id?: string;
    sku: string;
    shadeName: string;
    shadeLabel: string | null;
    swatchHex: string | null;
    stockQty: number;
    priceOverride: number | null;
  }>;
  categoryIds: string[];
  collectionIds: string[];
};

type AdminProductFormValues = z.input<typeof adminProductSchema>;

const statusMeta: Record<ProductStatus, { ar: string; en: string }> = {
  DRAFT: { ar: "مسودة", en: "Draft" },
  ACTIVE: { ar: "نشط", en: "Active" },
  ARCHIVED: { ar: "مؤرشف", en: "Archived" }
};

function normalizeImages(images: AdminProductFormValues["images"] | undefined) {
  const nextImages = images ?? [];
  const sorted = [...nextImages]
    .sort((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
    .map((image, index) => ({
      ...image,
      isPrimary: false,
      sortOrder: index
    }));

  if (sorted.length > 0) {
    const nextPrimaryIndex = nextImages.findIndex((image) => image.isPrimary);
    const primaryIndex = nextPrimaryIndex >= 0 ? nextPrimaryIndex : 0;
    sorted[Math.min(primaryIndex, sorted.length - 1)] = {
      ...sorted[Math.min(primaryIndex, sorted.length - 1)],
      isPrimary: true
    };
  }

  return sorted;
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="font-display text-2xl text-white">{title}</h2>
        {description ? (
          <p className="text-sm leading-7 text-white/45">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SelectionGrid({
  locale,
  title,
  items,
  selectedIds,
  onToggle
}: {
  locale: Locale;
  title: string;
  items: ProductEditorOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white/70">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={cn(
                "rounded-[1.25rem] border px-4 py-3 text-start transition",
                selected
                  ? "border-rose-400/40 bg-rose-400/10 text-white"
                  : "border-white/10 bg-black/10 text-white/70 hover:border-white/20 hover:text-white"
              )}
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/35">
                {item.slug}
              </p>
            </button>
          );
        })}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-white/35">
          {locale === "ar"
            ? "لا توجد عناصر متاحة حاليًا."
            : "No options are available right now."}
        </p>
      ) : null}
    </div>
  );
}

function buildDefaults(product?: ProductEditorRecord) {
  return {
    id: product?.id,
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    status: product?.status ?? "DRAFT",
    basePrice: product?.basePrice ?? 0,
    compareAtPrice: product?.compareAtPrice ?? undefined,
    totalStock: product?.totalStock ?? 0,
    translations: {
      ar: {
        name: product?.translations.ar.name ?? "",
        shortDescription: product?.translations.ar.shortDescription ?? "",
        longDescription: product?.translations.ar.longDescription ?? "",
        ingredients: product?.translations.ar.ingredients ?? "",
        howToUse: product?.translations.ar.howToUse ?? "",
        seoTitle: product?.translations.ar.seoTitle ?? "",
        seoDescription: product?.translations.ar.seoDescription ?? ""
      },
      en: {
        name: product?.translations.en.name ?? "",
        shortDescription: product?.translations.en.shortDescription ?? "",
        longDescription: product?.translations.en.longDescription ?? "",
        ingredients: product?.translations.en.ingredients ?? "",
        howToUse: product?.translations.en.howToUse ?? "",
        seoTitle: product?.translations.en.seoTitle ?? "",
        seoDescription: product?.translations.en.seoDescription ?? ""
      }
    },
    images:
      product?.images.map((image, index) => ({
        id: image.id,
        path: image.path,
        isPrimary: image.isPrimary,
        sortOrder: index
      })) ?? [],
    variants:
      product?.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        shadeName: variant.shadeName,
        shadeLabel: variant.shadeLabel ?? "",
        swatchHex: variant.swatchHex ?? "",
        stockQty: variant.stockQty,
        priceOverride: variant.priceOverride ?? undefined
      })) ?? [],
    categoryIds: product?.categoryIds ?? [],
    collectionIds: product?.collectionIds ?? []
  } as AdminProductFormValues;
}

export function ProductEditorForm({
  locale,
  categories,
  collections,
  product
}: {
  locale: Locale;
  categories: ProductEditorOption[];
  collections: ProductEditorOption[];
  product?: ProductEditorRecord | null;
}) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const [isSaving, startSaving] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(product?.id));
  const initialBloblessImages = useMemo(
    () => new Set((product?.images ?? []).map((image) => image.path)),
    [product]
  );

  const form = useForm<AdminProductFormValues, unknown, AdminProductInput>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: buildDefaults(product ?? undefined)
  });

  const imagesFieldArray = useFieldArray({
    control: form.control,
    name: "images",
    keyName: "fieldKey"
  });
  const variantsFieldArray = useFieldArray({
    control: form.control,
    name: "variants",
    keyName: "fieldKey"
  });

  const images = form.watch("images") ?? [];
  const variants = form.watch("variants") ?? [];
  const englishName = form.watch("translations.en.name");
  const totalVariantStock = variants.reduce(
    (sum, variant) => sum + (Number(variant.stockQty) || 0),
    0
  );
  const hasVariants = variants.length > 0;

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }

    form.setValue("slug", slugify(englishName || ""), {
      shouldDirty: true
    });
  }, [englishName, form, slugManuallyEdited]);

  function replaceImages(nextImages: AdminProductFormValues["images"] | undefined) {
    imagesFieldArray.replace(normalizeImages(nextImages));
  }

  function toggleSelection(name: "categoryIds" | "collectionIds", value: string) {
    const current = (form.getValues(name) ?? []) as string[];
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    form.setValue(name, next, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  async function deleteUploadedBlob(url: string) {
    try {
      await fetch("/api/admin/products/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });
    } catch (error) {
      console.error("Blob cleanup error:", error);
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const uploadedImages: AdminProductInput["images"] = [];
      const nextSlug =
        slugify(form.getValues("slug")) ||
        slugify(form.getValues("translations.en.name")) ||
        "draft-product";

      for (const file of files) {
        const payload = new FormData();
        payload.append("file", file);
        payload.append("productSlug", nextSlug);

        const response = await fetch("/api/admin/products/upload", {
          method: "POST",
          body: payload
        });
        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !data.url) {
          throw new Error(data.error || "Image upload failed");
        }

        uploadedImages.push({
          path: data.url,
          isPrimary: images.length + uploadedImages.length === 0,
          sortOrder: images.length + uploadedImages.length
        });
      }

      replaceImages([...images, ...uploadedImages]);
      toast.success(
        isArabic ? "تم رفع الصور بنجاح" : "Images uploaded successfully"
      );
    } catch (error) {
      toast.error(
        isArabic
          ? "تعذر رفع الصور. تأكد من إعداد Blob."
          : "Image upload failed. Check Blob configuration."
      );
      console.error("Admin upload error:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function removeImage(index: number) {
    const removedImage = images[index];
    const nextImages = images.filter((_, currentIndex) => currentIndex !== index);

    replaceImages(nextImages);

    if (
      removedImage &&
      !removedImage.id &&
      removedImage.path.startsWith("https://") &&
      !initialBloblessImages.has(removedImage.path)
    ) {
      await deleteUploadedBlob(removedImage.path);
    }
  }

  function moveImage(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= images.length) {
      return;
    }

    const nextImages = [...images];
    const [current] = nextImages.splice(index, 1);
    nextImages.splice(targetIndex, 0, current);
    replaceImages(nextImages);
  }

  function markPrimary(index: number) {
    replaceImages(
      images.map((image, currentIndex) => ({
        ...image,
        isPrimary: currentIndex === index
      }))
    );
  }

  function addVariant() {
    variantsFieldArray.append({
      sku: "",
      shadeName: "",
      shadeLabel: "",
      swatchHex: "",
      stockQty: 0,
      priceOverride: undefined
    });
  }

  function autoFillSlug() {
    setSlugManuallyEdited(false);
    form.setValue("slug", slugify(form.getValues("translations.en.name")), {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => {
        const payload = {
          ...values,
          totalStock: hasVariants ? totalVariantStock : values.totalStock
        };

        startSaving(async () => {
          const result = await saveAdminProductAction(payload);

          if (!result.success) {
            toast.error(result.error ?? (isArabic ? "فشل حفظ المنتج" : "Failed to save product"));
            return;
          }

          toast.success(
            product?.id
              ? isArabic
                ? "تم تحديث المنتج"
                : "Product updated"
              : isArabic
                ? "تم إنشاء المنتج"
                : "Product created"
          );

          if (!product?.id && result.productId) {
            router.replace(`/${locale}/admin/products/${result.productId}`);
          }

          router.refresh();
        });
      })}
    >
      <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-300/70">
            {isArabic ? "إدارة المنتجات" : "Product management"}
          </p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            {product?.id
              ? isArabic
                ? "تعديل المنتج"
                : "Edit product"
              : isArabic
                ? "إضافة منتج"
                : "Create product"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
            {isArabic
              ? "حدّثي البيانات الأساسية، النصوص، الصور، والـ variants من شاشة واحدة."
              : "Update core details, bilingual content, images, and variants from one workflow."}
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          className="min-w-44"
          disabled={isSaving || isUploading}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving
            ? isArabic
              ? "جارٍ الحفظ..."
              : "Saving..."
            : isArabic
              ? "حفظ المنتج"
              : "Save product"}
        </Button>
      </div>

      <Section
        title={isArabic ? "البيانات الأساسية" : "Core details"}
        description={
          isArabic
            ? "هذه القيم تتحكم في السلاج، السعر المرجعي، حالة النشر، والمخزون الأساسي."
            : "These values control the slug, reference pricing, publishing state, and base stock."
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "الاسم الإنجليزي لتوليد السلاج" : "English name for slug generation"}
            </label>
            <Input
              placeholder={isArabic ? "مثال: Velvet Glow Serum" : "Example: Velvet Glow Serum"}
              {...form.register("translations.en.name")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            {form.formState.errors.translations?.en?.name ? (
              <p className="text-sm text-red-300">
                {form.formState.errors.translations.en.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-white/65">{isArabic ? "السلاج" : "Slug"}</label>
              <button
                type="button"
                onClick={autoFillSlug}
                className="inline-flex items-center gap-1 text-xs text-rose-300 transition hover:text-rose-200"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isArabic ? "تعبئة تلقائية" : "Auto-fill"}
              </button>
            </div>
            <Input
              placeholder="velvet-glow-serum"
              {...form.register("slug")}
              onChange={(event) => {
                setSlugManuallyEdited(true);
                form.setValue("slug", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true
                });
              }}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            {form.formState.errors.slug ? (
              <p className="text-sm text-red-300">{form.formState.errors.slug.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "SKU المنتج" : "Product SKU"}</label>
            <Input
              placeholder="JR-SERUM-001"
              {...form.register("sku")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            {form.formState.errors.sku ? (
              <p className="text-sm text-red-300">{form.formState.errors.sku.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "حالة المنتج" : "Product status"}</label>
            <select
              {...form.register("status")}
              className="h-12 w-full rounded-[1.15rem] border border-white/10 bg-black/20 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            >
              {(["DRAFT", "ACTIVE", "ARCHIVED"] as ProductStatus[]).map((status) => (
                <option key={status} value={status} className="bg-[#151515]">
                  {isArabic ? statusMeta[status].ar : statusMeta[status].en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "السعر الأساسي (EGP)" : "Base price (EGP)"}</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...form.register("basePrice")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            {form.formState.errors.basePrice ? (
              <p className="text-sm text-red-300">{form.formState.errors.basePrice.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "سعر قبل الخصم (اختياري)" : "Compare-at price (optional)"}</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...form.register("compareAtPrice")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            {form.formState.errors.compareAtPrice ? (
              <p className="text-sm text-red-300">{form.formState.errors.compareAtPrice.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "المخزون الأساسي" : "Base stock"}</label>
            <Input
              type="number"
              min="0"
              {...form.register("totalStock")}
              disabled={hasVariants}
              className={cn(
                "border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400",
                hasVariants && "cursor-not-allowed opacity-60"
              )}
            />
            <p className="text-xs text-white/35">
              {hasVariants
                ? isArabic
                  ? `تم حساب المخزون من الـ variants: ${totalVariantStock}`
                  : `Stock is derived from variants: ${totalVariantStock}`
                : isArabic
                  ? "يُستخدم فقط عندما لا توجد variants."
                  : "Used only when no variants exist."}
            </p>
          </div>
        </div>
      </Section>

      <Section
        title={isArabic ? "الترجمة العربية" : "Arabic content"}
        description={
          isArabic
            ? "هذه النصوص تظهر في الواجهة العربية."
            : "These fields are shown on the Arabic storefront."
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "الاسم" : "Name"}</label>
            <Input
              {...form.register("translations.ar.name")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "الوصف المختصر" : "Short description"}</label>
            <Input
              {...form.register("translations.ar.shortDescription")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <label className="text-sm text-white/65">{isArabic ? "الوصف الكامل" : "Long description"}</label>
            <Textarea
              rows={5}
              {...form.register("translations.ar.longDescription")}
              className="min-h-36 border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "المكونات" : "Ingredients"}</label>
            <Textarea
              rows={4}
              {...form.register("translations.ar.ingredients")}
              className="min-h-28 border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "طريقة الاستخدام" : "How to use"}</label>
            <Textarea
              rows={4}
              {...form.register("translations.ar.howToUse")}
              className="min-h-28 border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">SEO title</label>
            <Input
              {...form.register("translations.ar.seoTitle")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">SEO description</label>
            <Input
              {...form.register("translations.ar.seoDescription")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
        </div>
      </Section>

      <Section
        title={isArabic ? "الترجمة الإنجليزية" : "English content"}
        description={
          isArabic
            ? "هذه النصوص تظهر في الواجهة الإنجليزية."
            : "These fields are shown on the English storefront."
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "الاسم" : "Name"}</label>
            <Input
              {...form.register("translations.en.name")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "الوصف المختصر" : "Short description"}</label>
            <Input
              {...form.register("translations.en.shortDescription")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <label className="text-sm text-white/65">{isArabic ? "الوصف الكامل" : "Long description"}</label>
            <Textarea
              rows={5}
              {...form.register("translations.en.longDescription")}
              className="min-h-36 border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "المكونات" : "Ingredients"}</label>
            <Textarea
              rows={4}
              {...form.register("translations.en.ingredients")}
              className="min-h-28 border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">{isArabic ? "طريقة الاستخدام" : "How to use"}</label>
            <Textarea
              rows={4}
              {...form.register("translations.en.howToUse")}
              className="min-h-28 border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">SEO title</label>
            <Input
              {...form.register("translations.en.seoTitle")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/65">SEO description</label>
            <Input
              {...form.register("translations.en.seoDescription")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>
        </div>
      </Section>

      <Section
        title={isArabic ? "صور المنتج" : "Product images"}
        description={
          isArabic
            ? "ارفعي عدة صور، حددي الصورة الأساسية، وأعيدي ترتيب العرض."
            : "Upload multiple images, choose the primary one, and control display order."
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-white/45">
            {isArabic
              ? "الصور تحفظ في Vercel Blob وتُعرض مباشرة في المتجر."
              : "Images are stored in Vercel Blob and shown directly in the storefront."}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white transition hover:border-white/20">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {isArabic ? "رفع صور" : "Upload images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {form.formState.errors.images ? (
          <p className="mt-3 text-sm text-red-300">
            {form.formState.errors.images.message as string}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {images.map((image, index) => (
            <div
              key={imagesFieldArray.fields[index]?.fieldKey ?? `${image.path}-${index}`}
              className="rounded-[1.25rem] border border-white/10 bg-black/15 p-4"
            >
              <input type="hidden" {...form.register(`images.${index}.id`)} />
              <input type="hidden" {...form.register(`images.${index}.path`)} />
              <input type="hidden" {...form.register(`images.${index}.sortOrder`)} />
              <input type="hidden" {...form.register(`images.${index}.isPrimary`)} />
              <div className="flex gap-4">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                  <Image
                    src={image.path}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                      {image.isPrimary
                        ? isArabic
                          ? "الصورة الأساسية"
                          : "Primary image"
                        : isArabic
                          ? `صورة ${index + 1}`
                          : `Image ${index + 1}`}
                    </span>
                    {image.path.startsWith("https://") ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                        Blob
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 break-all text-xs leading-6 text-white/35">
                    {image.path}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => markPrimary(index)}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
                    >
                      {isArabic ? "تعيين كأساسية" : "Set as primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-35"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-35"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeImage(index)}
                      className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-400/15"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 ? (
          <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center text-sm text-white/35">
            {isArabic
              ? "لم تتم إضافة صور بعد."
              : "No images have been added yet."}
          </div>
        ) : null}
      </Section>

      <Section
        title={isArabic ? "الـ Variants" : "Variants"}
        description={
          isArabic
            ? "أضيفي درجات أو تنويعات المنتج مع SKU مستقل ومخزون خاص لكل واحدة."
            : "Add shades or product variants with their own SKU and stock."
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/45">
            {isArabic
              ? "إذا وُجدت variants فالمخزون الكلي سيُحسب منها تلقائيًا."
              : "When variants exist, total stock is calculated automatically from them."}
          </p>
          <Button type="button" variant="secondary" onClick={addVariant}>
            <Plus className="h-4 w-4" />
            {isArabic ? "إضافة variant" : "Add variant"}
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {variantsFieldArray.fields.map((variantField, index) => (
            <div
              key={variantField.fieldKey}
              className="rounded-[1.3rem] border border-white/10 bg-black/15 p-4 sm:p-5"
            >
              <input type="hidden" {...form.register(`variants.${index}.id`)} />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-white">
                    {isArabic ? `Variant ${index + 1}` : `Variant ${index + 1}`}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                    {isArabic ? "تنويع المنتج" : "Product variant"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => variantsFieldArray.remove(index)}
                  className="rounded-full border border-red-400/20 bg-red-400/10 p-2 text-red-200 transition hover:bg-red-400/15"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-white/65">SKU</label>
                  <Input
                    placeholder="JR-SERUM-001-ROSE"
                    {...form.register(`variants.${index}.sku`)}
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/65">{isArabic ? "اسم الدرجة" : "Shade name"}</label>
                  <Input
                    placeholder="Rose Nude"
                    {...form.register(`variants.${index}.shadeName`)}
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/65">{isArabic ? "وصف الدرجة" : "Shade label"}</label>
                  <Input
                    placeholder={isArabic ? "دفء وردي ناعم" : "Soft rosy warmth"}
                    {...form.register(`variants.${index}.shadeLabel`)}
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/65">{isArabic ? "لون العينة Hex" : "Swatch hex"}</label>
                  <Input
                    placeholder="#C98B88"
                    {...form.register(`variants.${index}.swatchHex`)}
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/65">{isArabic ? "المخزون" : "Stock"}</label>
                  <Input
                    type="number"
                    min="0"
                    {...form.register(`variants.${index}.stockQty`)}
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/65">{isArabic ? "سعر مخصص (اختياري)" : "Price override (optional)"}</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register(`variants.${index}.priceOverride`)}
                    className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {variants.length === 0 ? (
          <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center text-sm text-white/35">
            {isArabic
              ? "لا توجد variants. سيتم استخدام المخزون الأساسي للمنتج."
              : "No variants yet. The product will use its base stock."}
          </div>
        ) : null}
      </Section>

      <Section
        title={isArabic ? "التصنيفات والمجموعات" : "Categories and collections"}
        description={
          isArabic
            ? "اربطي المنتج بالفئات والمجموعات الموجودة بالفعل في المتجر."
            : "Attach the product to existing categories and storefront collections."
        }
      >
        <div className="space-y-6">
          <SelectionGrid
            locale={locale}
            title={isArabic ? "التصنيفات" : "Categories"}
            items={categories}
            selectedIds={(form.watch("categoryIds") ?? []) as string[]}
            onToggle={(id) => toggleSelection("categoryIds", id)}
          />
          <SelectionGrid
            locale={locale}
            title={isArabic ? "المجموعات" : "Collections"}
            items={collections}
            selectedIds={(form.watch("collectionIds") ?? []) as string[]}
            onToggle={(id) => toggleSelection("collectionIds", id)}
          />
        </div>
      </Section>
    </form>
  );
}
