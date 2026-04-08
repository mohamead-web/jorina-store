import type {
  CouponAudienceType,
  CouponDiscountType,
  Prisma,
  PrismaClient
} from "@/generated/prisma/client";

type PrismaCouponClient = PrismaClient | Prisma.TransactionClient;

export type CouponLifecycleStatus =
  | "ACTIVE"
  | "SCHEDULED"
  | "EXPIRED"
  | "ARCHIVED";

type CouponForStatus = {
  isArchived: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
};

type CouponForCheckout = CouponForStatus & {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: Prisma.Decimal | number;
  audienceType: CouponAudienceType;
  minSubtotal: Prisma.Decimal | number | null;
  maxRedemptions: number | null;
  perCustomerLimit: number;
  allowedEmails: Array<{ email: string }>;
  _count: { orders: number };
};

export type ResolvedCoupon = {
  couponId: string;
  couponCode: string;
  discountAmount: number;
};

export function normalizeCouponCode(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

export function normalizeCouponEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function getCouponStatus(
  coupon: CouponForStatus,
  now = new Date()
): CouponLifecycleStatus {
  if (coupon.isArchived) {
    return "ARCHIVED";
  }

  if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
    return "SCHEDULED";
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

function clampCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateCouponDiscount({
  discountType,
  discountValue,
  subtotal
}: {
  discountType: CouponDiscountType;
  discountValue: Prisma.Decimal | number;
  subtotal: number;
}) {
  const numericSubtotal = clampCurrency(Math.max(0, subtotal));
  const numericDiscountValue = Number(discountValue);

  if (numericSubtotal <= 0 || numericDiscountValue <= 0) {
    return 0;
  }

  if (discountType === "PERCENTAGE") {
    return clampCurrency(
      Math.min(numericSubtotal, (numericSubtotal * numericDiscountValue) / 100)
    );
  }

  return clampCurrency(Math.min(numericSubtotal, numericDiscountValue));
}

function assertCouponEligibility({
  coupon,
  normalizedEmail,
  subtotal,
  now,
  customerUsageCount
}: {
  coupon: CouponForCheckout;
  normalizedEmail: string;
  subtotal: number;
  now: Date;
  customerUsageCount: number;
}) {
  const status = getCouponStatus(coupon, now);

  if (status === "ARCHIVED") {
    throw new Error("This coupon is archived");
  }

  if (status === "SCHEDULED") {
    throw new Error("This coupon is not active yet");
  }

  if (status === "EXPIRED") {
    throw new Error("This coupon has expired");
  }

  if (!normalizedEmail) {
    throw new Error("Email is required to use a coupon");
  }

  if (
    typeof coupon.maxRedemptions === "number" &&
    coupon._count.orders >= coupon.maxRedemptions
  ) {
    throw new Error("This coupon has reached its usage limit");
  }

  if (
    typeof coupon.minSubtotal !== "undefined" &&
    coupon.minSubtotal !== null &&
    subtotal < Number(coupon.minSubtotal)
  ) {
    throw new Error("Order subtotal does not meet the coupon minimum");
  }

  if (coupon.audienceType === "TARGETED") {
    const allowed = coupon.allowedEmails.some(
      (entry) => entry.email === normalizedEmail
    );

    if (!allowed) {
      throw new Error("This coupon is not available for this email");
    }
  }

  if (customerUsageCount >= coupon.perCustomerLimit) {
    throw new Error("This coupon has already been used for this email");
  }
}

export async function resolveCouponForCheckout({
  client,
  code,
  email,
  subtotal,
  now = new Date()
}: {
  client: PrismaCouponClient;
  code: string;
  email: string | null | undefined;
  subtotal: number;
  now?: Date;
}) {
  const normalizedCode = normalizeCouponCode(code);
  const normalizedEmail = normalizeCouponEmail(email);

  if (!normalizedCode) {
    throw new Error("Coupon code is required");
  }

  const coupon = await client.coupon.findUnique({
    where: { code: normalizedCode },
    include: {
      allowedEmails: {
        select: { email: true }
      },
      _count: {
        select: { orders: true }
      }
    }
  });

  if (!coupon) {
    throw new Error("Coupon code is invalid");
  }

  const customerUsageCount = normalizedEmail
    ? await client.order.count({
        where: {
          couponId: coupon.id,
          email: {
            equals: normalizedEmail,
            mode: "insensitive"
          }
        }
      })
    : 0;

  assertCouponEligibility({
    coupon,
    normalizedEmail,
    subtotal,
    now,
    customerUsageCount
  });

  const discountAmount = calculateCouponDiscount({
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    subtotal
  });

  return {
    couponId: coupon.id,
    couponCode: coupon.code,
    discountAmount
  } satisfies ResolvedCoupon;
}
