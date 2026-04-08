import { z } from "zod";

const hexColorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeNullableNumber(value: unknown) {
  if (value === "" || value === null || typeof value === "undefined") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((entry): entry is string => typeof entry === "string"))];
}

const localizedContentSchema = z.object({
  name: z.string().trim().min(1),
  shortDescription: z.string().trim().min(1),
  longDescription: z.string().trim().min(1),
  ingredients: z.preprocess(normalizeOptionalString, z.string().nullable()),
  howToUse: z.preprocess(normalizeOptionalString, z.string().nullable()),
  seoTitle: z.preprocess(normalizeOptionalString, z.string().nullable()),
  seoDescription: z.preprocess(normalizeOptionalString, z.string().nullable())
});

const productImageSchema = z.object({
  id: z.string().optional(),
  path: z
    .string()
    .trim()
    .min(1)
    .refine((value) => {
      if (value.startsWith("/")) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Invalid image path"),
  isPrimary: z.boolean(),
  sortOrder: z.coerce.number().int().min(0)
});

const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1),
  shadeName: z.string().trim().min(1),
  shadeLabel: z.preprocess(normalizeOptionalString, z.string().nullable()),
  swatchHex: z.preprocess(
    normalizeOptionalString,
    z.string().regex(hexColorPattern, "Invalid swatch color").nullable()
  ),
  stockQty: z.coerce.number().int().min(0),
  priceOverride: z.preprocess(
    normalizeNullableNumber,
    z.number().nonnegative().nullable()
  )
});

export const adminProductSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().trim().min(1).regex(slugPattern, "Invalid slug"),
    sku: z.string().trim().min(1),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    basePrice: z.coerce.number().nonnegative(),
    compareAtPrice: z.preprocess(
      normalizeNullableNumber,
      z.number().nonnegative().nullable()
    ),
    totalStock: z.coerce.number().int().min(0),
    translations: z.object({
      ar: localizedContentSchema,
      en: localizedContentSchema
    }),
    images: z.array(productImageSchema).default([]),
    variants: z.array(productVariantSchema).default([]),
    categoryIds: z.preprocess(normalizeStringArray, z.array(z.string()).default([])),
    collectionIds: z.preprocess(normalizeStringArray, z.array(z.string()).default([]))
  })
  .superRefine((value, ctx) => {
    if (
      value.compareAtPrice !== null &&
      typeof value.compareAtPrice === "number" &&
      value.compareAtPrice < value.basePrice
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "Compare-at price must be greater than or equal to the base price"
      });
    }

    if (value.images.length > 0 && !value.images.some((image) => image.isPrimary)) {
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "One image must be marked as primary"
      });
    }

    const variantSkuSet = new Set<string>();

    for (const [index, variant] of value.variants.entries()) {
      const normalizedSku = variant.sku.toLowerCase();

      if (variantSkuSet.has(normalizedSku)) {
        ctx.addIssue({
          code: "custom",
          path: ["variants", index, "sku"],
          message: "Variant SKU must be unique"
        });
      }

      variantSkuSet.add(normalizedSku);
    }
  });

export type AdminProductInput = z.infer<typeof adminProductSchema>;
