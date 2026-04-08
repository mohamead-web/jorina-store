"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getGuestCartToken } from "@/lib/services/cart";
import { resolveCouponForCheckout } from "@/lib/services/coupons";
import { createOrderFromCart } from "@/lib/services/order";
import {
  saveUserPreferences,
  writeGuestPreferences
} from "@/lib/services/preferences";
import { checkoutSchema, couponPreviewSchema } from "@/lib/validators/checkout";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Checkout failed. Please try again.";
}

export async function placeOrderAction(rawInput: unknown) {
  try {
    const input = checkoutSchema.parse(rawInput);
    const user = await getCurrentUser();
    const guestToken = await getGuestCartToken();

    if (user?.id) {
      await saveUserPreferences(user.id, {
        localeCode: input.localeCode,
        countryCode: input.countryCode
      });
    } else {
      await writeGuestPreferences({
        localeCode: input.localeCode,
        countryCode: input.countryCode
      });
    }

    const order = await createOrderFromCart({
      userId: user?.id,
      guestToken,
      input
    });

    revalidatePath(`/${input.localeCode}`);
    revalidatePath(`/${input.localeCode}/cart`);
    revalidatePath(`/${input.localeCode}/checkout`);
    revalidatePath(`/${input.localeCode}/account`);
    revalidatePath(`/${input.localeCode}/account/orders`);
    revalidatePath("/", "layout");

    return {
      success: true,
      orderNumber: order.orderNumber
    };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

export async function previewCouponAction(rawInput: unknown) {
  try {
    const input = couponPreviewSchema.parse(rawInput);
    const coupon = await resolveCouponForCheckout({
      client: prisma,
      code: input.code,
      email: input.email,
      subtotal: input.subtotal
    });

    return {
      success: true,
      coupon
    };
  } catch (error) {
    console.error("Coupon preview error:", error);
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}
