"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { getGuestCartToken } from "@/lib/services/cart";
import { createOrderFromCart } from "@/lib/services/order";
import {
  saveUserPreferences,
  writeGuestPreferences
} from "@/lib/services/preferences";
import { checkoutSchema } from "@/lib/validators/checkout";

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
