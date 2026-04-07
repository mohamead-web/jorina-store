"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { cookieKeys } from "@/lib/constants/cookies";
import { getCurrentUser } from "@/lib/auth/session";
import {
  addCartItem,
  getGuestCartToken,
  mergeGuestCartIntoUser,
  removeCartItem,
  updateCartItemQuantity
} from "@/lib/services/cart";
import { getResolvedPreferences, mergeGuestPreferencesIntoUser } from "@/lib/services/preferences";

async function resolveCartOwner() {
  const user = await getCurrentUser();

  if (user?.id) {
    return { userId: user.id, guestToken: null };
  }

  const cookieStore = await cookies();
  let guestToken = cookieStore.get(cookieKeys.cartToken)?.value ?? null;

  if (!guestToken) {
    guestToken = randomUUID();
    cookieStore.set(cookieKeys.cartToken, guestToken, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30
    });
  }

  return { userId: null, guestToken };
}

export async function addToCartAction(input: {
  localeCode: "ar" | "en";
  productId: string;
  variantId?: string | null;
  quantity?: number;
}) {
  try {
    const { userId, guestToken } = await resolveCartOwner();
    const prefs = await getResolvedPreferences(userId);
    await addCartItem({
      userId,
      guestToken,
      localeCode: input.localeCode,
      countryCode: prefs.countryCode,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity ?? 1
    });

    revalidatePath(`/${input.localeCode}`);
    revalidatePath(`/${input.localeCode}/cart`);

    return { success: true };
  } catch (error) {
    console.error("Cart add error:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function updateCartItemAction(input: {
  localeCode: "ar" | "en";
  itemId: string;
  quantity: number;
}) {
  try {
    const user = await getCurrentUser();
    const guestToken = await getGuestCartToken();

    await updateCartItemQuantity({
      userId: user?.id,
      guestToken,
      itemId: input.itemId,
      quantity: input.quantity
    });

    revalidatePath(`/${input.localeCode}/cart`);
    return { success: true };
  } catch (error) {
    console.error("Cart update error:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}

export async function removeCartItemAction(input: {
  localeCode: "ar" | "en";
  itemId: string;
}) {
  try {
    const user = await getCurrentUser();
    const guestToken = await getGuestCartToken();

    await removeCartItem({
      userId: user?.id,
      guestToken,
      itemId: input.itemId
    });

    revalidatePath(`/${input.localeCode}/cart`);
    return { success: true };
  } catch (error) {
    console.error("Cart remove error:", error);
    return { success: false, error: "Failed to remove cart item" };
  }
}

export async function mergeGuestStateAction(localeCode: "ar" | "en") {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { merged: false };
    }

    const guestToken = await getGuestCartToken();
    if (!guestToken) {
      return { merged: false };
    }

    await mergeGuestCartIntoUser(user.id, guestToken);
    await mergeGuestPreferencesIntoUser(user.id);

    const cookieStore = await cookies();
    cookieStore.delete(cookieKeys.cartToken);

    revalidatePath(`/${localeCode}`);
    revalidatePath(`/${localeCode}/cart`);
    revalidatePath(`/${localeCode}/account`);

    return { merged: true };
  } catch (error) {
    console.error("Cart merge error:", error);
    return { merged: false, error: "Failed to merge cart" };
  }
}
