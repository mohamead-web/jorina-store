import { z } from "zod";

const couponCodePattern = /^[A-Z0-9][A-Z0-9_-]{2,39}$/;

function normalizeOptionalNumber(value: unknown) {
  if (value === "" || value === null || typeof value === "undefined") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}

function normalizeOptionalInteger(value: unknown) {
  const normalized = normalizeOptionalNumber(value);

  if (normalized === null) {
    return null;
  }

  if (typeof normalized === "number") {
    return Math.trunc(normalized);
  }

  return normalized;
}

function normalizeDateTime(value: unknown) {
  if (value === "" || value === null || typeof value === "undefined") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed;
  }

  return value;
}

function normalizeEmailArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(
    value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  )];
}

export const adminCouponSchema = z
  .object({
    id: z.string().optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3)
      .max(40)
      .regex(couponCodePattern, "Coupon code can include letters, numbers, dashes, and underscores"),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.coerce.number().positive(),
    audienceType: z.enum(["PUBLIC", "TARGETED"]).default("PUBLIC"),
    startsAt: z.preprocess(normalizeDateTime, z.date().nullable()),
    expiresAt: z.preprocess(normalizeDateTime, z.date().nullable()),
    minSubtotal: z.preprocess(
      normalizeOptionalNumber,
      z.number().nonnegative().nullable()
    ),
    maxRedemptions: z.preprocess(
      normalizeOptionalInteger,
      z.number().int().positive().nullable()
    ),
    perCustomerLimit: z.preprocess(
      normalizeOptionalInteger,
      z.number().int().positive()
    ),
    allowedEmails: z.preprocess(
      normalizeEmailArray,
      z.array(z.string().email()).default([])
    )
  })
  .superRefine((value, ctx) => {
    if (value.discountType === "PERCENTAGE" && value.discountValue > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Percentage discount cannot exceed 100"
      });
    }

    if (
      value.startsAt &&
      value.expiresAt &&
      value.expiresAt.getTime() <= value.startsAt.getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiry must be after the start date"
      });
    }

    if (value.audienceType === "TARGETED" && value.allowedEmails.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["allowedEmails"],
        message: "Targeted coupons need at least one email"
      });
    }
  });

export type AdminCouponInput = z.infer<typeof adminCouponSchema>;
