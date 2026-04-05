"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { updateOrderStatus as updateStatus } from "@/lib/services/admin";
import type { OrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatusAction(input: {
  orderNumber: string;
  status: OrderStatus;
  note?: string;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await updateStatus(input.orderNumber, input.status, input.note);

    revalidatePath("/ar/admin");
    revalidatePath("/ar/admin/orders");
    revalidatePath(`/ar/admin/orders/${input.orderNumber}`);
    revalidatePath("/en/admin");
    revalidatePath("/en/admin/orders");
    revalidatePath(`/en/admin/orders/${input.orderNumber}`);

    return { success: true };
  } catch (error) {
    console.error("Admin status update error:", error);
    return { success: false, error: "Failed to update order status" };
  }
}
