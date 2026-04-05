"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { deleteAddress, saveAddress } from "@/lib/services/address";
import { createReturnRequest } from "@/lib/services/returns";
import { addressSchema } from "@/lib/validators/address";
import { returnRequestSchema } from "@/lib/validators/return-request";

export async function saveAddressAction(localeCode: "ar" | "en", rawInput: unknown) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const input = addressSchema.parse(rawInput);
  await saveAddress(user.id, input);

  revalidatePath(`/${localeCode}/account/addresses`);
  revalidatePath(`/${localeCode}/account`);

  return { success: true };
}

export async function deleteAddressAction(localeCode: "ar" | "en", addressId: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  await deleteAddress(user.id, addressId);
  revalidatePath(`/${localeCode}/account/addresses`);

  return { success: true };
}

export async function requestReturnAction(localeCode: "ar" | "en", rawInput: unknown) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Authentication required");
  }

  const input = returnRequestSchema.parse(rawInput);
  await createReturnRequest(user.id, input);

  revalidatePath(`/${localeCode}/account/returns`);
  revalidatePath(`/${localeCode}/account/orders`);

  return { success: true };
}
