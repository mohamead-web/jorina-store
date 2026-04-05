import { prisma } from "@/lib/db/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

export async function getAdminStats() {
  const [totalOrders, pendingOrders, confirmedOrders, shippedOrders, deliveredOrders, cancelledOrders, totalRevenue, totalCustomers, totalProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.user.count(),
      prisma.product.count({ where: { status: "ACTIVE" } })
    ]);

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    totalCustomers,
    totalProducts
  };
}

export async function getAllOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      items: true,
      addressSnapshot: true,
      user: {
        select: { name: true, email: true, image: true }
      },
      statusHistory: {
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      addressSnapshot: true,
      user: {
        select: { name: true, email: true, image: true }
      },
      statusHistory: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function updateOrderStatus(
  orderNumber: string,
  newStatus: OrderStatus,
  note?: string
) {
  const order = await prisma.order.findUnique({
    where: { orderNumber }
  });

  if (!order) throw new Error("Order not found");

  const dateFields: Record<string, Date> = {};
  const now = new Date();

  if (newStatus === "CONFIRMED") dateFields.confirmedAt = now;
  if (newStatus === "SHIPPED") dateFields.shippedAt = now;
  if (newStatus === "DELIVERED") dateFields.deliveredAt = now;
  if (newStatus === "CANCELLED") dateFields.cancelledAt = now;
  if (newStatus === "RETURNED") dateFields.returnedAt = now;

  return prisma.$transaction([
    prisma.order.update({
      where: { orderNumber },
      data: {
        status: newStatus,
        ...dateFields
      }
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: newStatus,
        note: note || undefined
      }
    })
  ]);
}
