import { prisma } from "@/lib/db/prisma";
import { canRequestReturn } from "@/lib/services/order";
import {
  returnRequestSchema,
  type ReturnRequestInput
} from "@/lib/validators/return-request";

export async function getReturnRequestsForUser(userId: string) {
  return prisma.returnRequest.findMany({
    where: { userId },
    include: {
      order: true,
      items: {
        include: {
          orderItem: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createReturnRequest(userId: string, input: ReturnRequestInput) {
  const payload = returnRequestSchema.parse(input);

  const order = await prisma.order.findFirst({
    where: {
      id: payload.orderId,
      userId
    },
    include: {
      items: true,
      returnRequests: true
    }
  });

  if (!order || !canRequestReturn(order)) {
    throw new Error("Return request is not eligible");
  }

  const orderItem = order.items.find((item) => item.id === payload.orderItemId);

  if (!orderItem) {
    throw new Error("Order item not found");
  }

  return prisma.returnRequest.create({
    data: {
      orderId: order.id,
      userId,
      reason: payload.reason,
      notes: payload.notes || null,
      status: "REQUESTED",
      items: {
        create: {
          orderItemId: payload.orderItemId,
          quantity: 1
        }
      }
    }
  });
}
