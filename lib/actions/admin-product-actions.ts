"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import {
  archiveAdminProduct,
  saveAdminProduct
} from "@/lib/services/admin-products";

function revalidateProductPaths(slug: string) {
  revalidatePath("/", "layout");
  revalidatePath("/ar/admin");
  revalidatePath("/en/admin");
  revalidatePath("/ar/admin/products");
  revalidatePath("/en/admin/products");
  revalidatePath("/ar/shop");
  revalidatePath("/en/shop");
  revalidatePath("/ar/categories");
  revalidatePath("/en/categories");
  revalidatePath("/ar/best-sellers");
  revalidatePath("/en/best-sellers");
  revalidatePath("/ar/new-arrivals");
  revalidatePath("/en/new-arrivals");
  revalidatePath("/ar/offers");
  revalidatePath("/en/offers");
  revalidatePath(`/ar/products/${slug}`);
  revalidatePath(`/en/products/${slug}`);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected error";
}

export async function saveAdminProductAction(rawInput: unknown) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const product = await saveAdminProduct(rawInput);
    revalidateProductPaths(product.slug);

    return {
      success: true,
      productId: product.id,
      slug: product.slug
    };
  } catch (error) {
    console.error("Admin product save error:", error);
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

export async function archiveAdminProductAction(input: { productId: string }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const product = await archiveAdminProduct(input.productId);
    revalidateProductPaths(product.slug);

    return {
      success: true,
      slug: product.slug
    };
  } catch (error) {
    console.error("Admin product archive error:", error);
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}
