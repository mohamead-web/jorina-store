"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import {
  archiveAdminCoupon,
  saveAdminCoupon
} from "@/lib/services/admin-coupons";

function revalidateCouponPaths(couponId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/ar/admin");
  revalidatePath("/en/admin");
  revalidatePath("/ar/admin/coupons");
  revalidatePath("/en/admin/coupons");

  if (couponId) {
    revalidatePath(`/ar/admin/coupons/${couponId}`);
    revalidatePath(`/en/admin/coupons/${couponId}`);
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected error";
}

export async function saveAdminCouponAction(rawInput: unknown) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const coupon = await saveAdminCoupon(rawInput);
    revalidateCouponPaths(coupon.id);

    return {
      success: true,
      couponId: coupon.id,
      code: coupon.code
    };
  } catch (error) {
    console.error("Admin coupon save error:", error);
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

export async function archiveAdminCouponAction(input: { couponId: string }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const coupon = await archiveAdminCoupon(input.couponId);
    revalidateCouponPaths(coupon.id);

    return {
      success: true,
      code: coupon.code
    };
  } catch (error) {
    console.error("Admin coupon archive error:", error);
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}
