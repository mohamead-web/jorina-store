import { z } from "zod";

export const checkoutSchema = z
  .object({
    email: z.string().email().optional().or(z.literal("")),
    couponCode: z.string().trim().max(40).optional().or(z.literal("")),
    fullName: z.string().min(3).max(80),
    phoneNumber: z.string().min(8).max(20),
    countryCode: z.enum(["EG", "SD"]).default("EG"),
    city: z.string().min(2).max(60),
    area: z.string().min(2).max(80),
    detailedAddress: z.string().min(6).max(220),
    notes: z.string().max(240).optional().or(z.literal("")),
    latitude: z.number(),
    longitude: z.number(),
    localeCode: z.enum(["ar", "en"]).default("ar")
  })
  .superRefine((value, ctx) => {
    if (value.couponCode && !value.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email is required when using a coupon"
      });
    }
  });

export const couponPreviewSchema = z.object({
  code: z.string().trim().min(1).max(40),
  email: z.string().trim().email(),
  subtotal: z.coerce.number().nonnegative()
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutFormValues = z.input<typeof checkoutSchema>;
export type CouponPreviewInput = z.infer<typeof couponPreviewSchema>;
