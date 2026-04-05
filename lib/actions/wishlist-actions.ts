"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { toggleWishlist } from "@/lib/services/wishlist";

export async function toggleWishlistAction(input: {
  localeCode: "ar" | "en";
  productId: string;
}) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        requiresAuth: true
      };
    }

    const result = await toggleWishlist(user.id, input.productId);

    revalidatePath(`/${input.localeCode}/account/favorites`);
    revalidatePath(`/${input.localeCode}`);

    return {
      success: true,
      saved: result.saved
    };
  } catch (error) {
    console.error("Wishlist toggle error:", error);
    return {
      success: false,
      error: "Failed to update wishlist"
    };
  }
}
