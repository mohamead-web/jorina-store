import { getShippingFeeForLocation } from "@/lib/constants/commerce";
import { prisma } from "@/lib/db/prisma";
import { returnWindowDays } from "@/lib/constants/commerce";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";
import type { OrderStatus } from "@/generated/prisma/client";

function createOrderNumber() {
  return `JR${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
}

export async function createOrderFromCart({
  userId,
  guestToken,
  input
}: {
  userId?: string | null;
  guestToken?: string | null;
  input: CheckoutInput;
}) {
  const payload = checkoutSchema.parse(input);
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { guestToken: guestToken ?? "" },
    include: {
      items: {
        include: {
          product: {
            include: {
              translations: true,
              images: true
            }
          },
          variant: true
        }
      }
    }
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  for (const item of cart.items) {
    const availableStock = item.variant ? item.variant.stockQty : item.product.totalStock;

    if (availableStock < item.quantity) {
      throw new Error("Insufficient stock for one or more items");
    }
  }

  const shippingFee = getShippingFeeForLocation(payload.countryCode, payload.city);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.currentUnitPrice) * item.quantity,
    0
  );
  const total = subtotal + shippingFee;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId: userId ?? undefined,
        guestToken: guestToken ?? undefined,
        email: payload.email || null,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        localeCode: payload.localeCode,
        paymentMethod: "CASH_ON_DELIVERY",
        status: "PENDING",
        shippingFee,
        subtotal,
        total,
        notes: payload.notes || null,
        addressSnapshot: {
          create: {
            fullName: payload.fullName,
            phoneNumber: payload.phoneNumber,
            countryCode: payload.countryCode,
            city: payload.city,
            area: payload.area,
            detailedAddress: payload.detailedAddress,
            latitude: payload.latitude,
            longitude: payload.longitude,
            notes: payload.notes || null
          }
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note:
              payload.localeCode === "ar"
                ? "تم استلام الطلب بانتظار المراجعة."
                : "Order received and awaiting review."
          }
        },
        items: {
          create: cart.items.map((item, index) => {
            const translation =
              item.product.translations.find(
                (entry) => entry.localeCode === payload.localeCode
              ) ?? item.product.translations[0];
            const image =
              [...item.product.images].sort(
                (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder
              )[0];

            return {
              productId: item.productId,
              variantId: item.variantId ?? undefined,
              productSlug: item.product.slug,
              productName: translation?.name ?? item.product.slug,
              variantName: item.variant?.shadeName ?? null,
              imagePath: image?.path ?? "/assets/products/placeholder.svg",
              quantity: item.quantity,
              unitPrice: item.currentUnitPrice,
              totalPrice: Number(item.currentUnitPrice) * item.quantity,
              sortOrder: index
            };
          })
        }
      },
      include: {
        items: true
      }
    });

    for (const item of cart.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQty: {
              decrement: item.quantity
            }
          }
        });
      }

      await tx.product.update({
        where: { id: item.productId },
        data: {
          totalStock: {
            decrement: item.quantity
          }
        }
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return created;
  });

  return {
    orderNumber: order.orderNumber,
    total
  };
}

export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getOrderByOrderNumber(userId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: {
      userId,
      orderNumber
    },
    include: {
      addressSnapshot: true,
      items: true,
      statusHistory: {
        orderBy: { createdAt: "asc" }
      },
      returnRequests: {
        include: {
          items: true
        }
      }
    }
  });
}

export type ReturnEligibilityOrder =
  | {
      status: OrderStatus;
      deliveredAt: Date | null;
    }
  | null
  | undefined;

export function canRequestReturn(order: ReturnEligibilityOrder) {
  if (!order || order.status !== "DELIVERED" || !order.deliveredAt) {
    return false;
  }

  const diff = Date.now() - order.deliveredAt.getTime();
  const diffDays = diff / (1000 * 60 * 60 * 24);

  return diffDays <= returnWindowDays;
}
