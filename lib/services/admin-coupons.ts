import { notFound } from "next/navigation";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getCouponStatus,
  normalizeCouponCode,
  normalizeCouponEmail
} from "@/lib/services/coupons";
import {
  adminCouponSchema,
  type AdminCouponInput
} from "@/lib/validators/admin-coupon";

const adminCouponInclude = {
  allowedEmails: {
    orderBy: { email: "asc" }
  },
  _count: {
    select: { orders: true }
  }
} satisfies Prisma.CouponInclude;

type AdminCouponRecord = Prisma.CouponGetPayload<{
  include: typeof adminCouponInclude;
}>;

function mapCouponSummary(coupon: AdminCouponRecord) {
  return {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    audienceType: coupon.audienceType,
    startsAt: coupon.startsAt,
    expiresAt: coupon.expiresAt,
    minSubtotal: coupon.minSubtotal ? Number(coupon.minSubtotal) : null,
    maxRedemptions: coupon.maxRedemptions,
    perCustomerLimit: coupon.perCustomerLimit,
    status: getCouponStatus(coupon),
    isArchived: coupon.isArchived,
    redemptionCount: coupon._count.orders,
    allowedEmailCount: coupon.allowedEmails.length,
    allowedEmailsPreview: coupon.allowedEmails.slice(0, 3).map((entry) => entry.email),
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt
  };
}

function mapCouponEditor(coupon: AdminCouponRecord) {
  return {
    ...mapCouponSummary(coupon),
    startsAt: coupon.startsAt?.toISOString() ?? null,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
    allowedEmails: coupon.allowedEmails.map((entry) => entry.email)
  };
}

function buildCouponPayload(input: AdminCouponInput) {
  const allowedEmails =
    input.audienceType === "TARGETED"
      ? [...new Set(input.allowedEmails.map((entry) => normalizeCouponEmail(entry)).filter(Boolean))]
      : [];

  return {
    code: normalizeCouponCode(input.code),
    discountType: input.discountType,
    discountValue: input.discountValue,
    audienceType: input.audienceType,
    startsAt: input.startsAt,
    expiresAt: input.expiresAt,
    minSubtotal: input.minSubtotal,
    maxRedemptions: input.maxRedemptions,
    perCustomerLimit: input.perCustomerLimit,
    allowedEmails
  };
}

async function assertCouponCodeUniqueness(code: string, couponId?: string) {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code },
    select: { id: true }
  });

  if (existingCoupon && existingCoupon.id !== couponId) {
    throw new Error("Coupon code is already in use");
  }
}

export async function getAdminCouponCustomerOptions() {
  const [users, orders] = await Promise.all([
    prisma.user.findMany({
      where: {
        email: {
          not: null
        }
      },
      select: { email: true }
    }),
    prisma.order.findMany({
      where: {
        email: {
          not: null
        }
      },
      select: { email: true }
    })
  ]);

  return [...new Set(
    [...users, ...orders]
      .map((entry) => normalizeCouponEmail(entry.email))
      .filter(Boolean)
  )].sort((left, right) => left.localeCompare(right));
}

export async function getAdminCoupons() {
  const coupons = await prisma.coupon.findMany({
    include: adminCouponInclude,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
  });

  return coupons.map(mapCouponSummary);
}

export async function getAdminCouponEditorData(couponId?: string) {
  const [customerOptions, coupon] = await Promise.all([
    getAdminCouponCustomerOptions(),
    couponId
      ? prisma.coupon.findUnique({
          where: { id: couponId },
          include: {
            ...adminCouponInclude,
            orders: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                orderNumber: true,
                fullName: true,
                email: true,
                status: true,
                discountAmount: true,
                total: true,
                createdAt: true,
                countryCode: true
              }
            }
          }
        })
      : Promise.resolve(null)
  ]);

  if (couponId && !coupon) {
    notFound();
  }

  return {
    customerOptions,
    coupon: coupon ? mapCouponEditor(coupon) : null,
    usageHistory:
      coupon?.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        fullName: order.fullName,
        email: order.email,
        status: order.status,
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
        countryCode: order.countryCode,
        createdAt: order.createdAt
      })) ?? []
  };
}

export async function saveAdminCoupon(rawInput: unknown) {
  const input = adminCouponSchema.parse(rawInput);
  const payload = buildCouponPayload(input);

  await assertCouponCodeUniqueness(payload.code, input.id);

  if (!input.id) {
    const created = await prisma.coupon.create({
      data: {
        code: payload.code,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        audienceType: payload.audienceType,
        startsAt: payload.startsAt,
        expiresAt: payload.expiresAt,
        minSubtotal: payload.minSubtotal,
        maxRedemptions: payload.maxRedemptions,
        perCustomerLimit: payload.perCustomerLimit,
        allowedEmails: payload.allowedEmails.length
          ? {
              create: payload.allowedEmails.map((email) => ({ email }))
            }
          : undefined
      },
      select: {
        id: true,
        code: true
      }
    });

    return created;
  }

  const existingCoupon = await prisma.coupon.findUnique({
    where: { id: input.id },
    select: { id: true }
  });

  if (!existingCoupon) {
    throw new Error("Coupon not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.coupon.update({
      where: { id: input.id },
      data: {
        code: payload.code,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        audienceType: payload.audienceType,
        startsAt: payload.startsAt,
        expiresAt: payload.expiresAt,
        minSubtotal: payload.minSubtotal,
        maxRedemptions: payload.maxRedemptions,
        perCustomerLimit: payload.perCustomerLimit
      }
    });

    await tx.couponAllowedEmail.deleteMany({
      where: { couponId: input.id }
    });

    if (payload.allowedEmails.length > 0) {
      await tx.couponAllowedEmail.createMany({
        data: payload.allowedEmails.map((email) => ({
          couponId: input.id as string,
          email
        }))
      });
    }
  });

  return {
    id: input.id,
    code: payload.code
  };
}

export async function archiveAdminCoupon(couponId: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    select: {
      id: true,
      code: true
    }
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  await prisma.coupon.update({
    where: { id: coupon.id },
    data: {
      isArchived: true
    }
  });

  return coupon;
}
