import { z } from "zod";

export const addressSchema = z.object({
  addressId: z.string().optional(),
  label: z.string().min(2).max(40),
  type: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  fullName: z.string().min(3).max(80),
  phoneNumber: z.string().min(8).max(20),
  countryCode: z.enum(["EG", "SD"]).default("EG"),
  city: z.string().min(2).max(60),
  area: z.string().min(2).max(80),
  detailedAddress: z.string().min(6).max(220),
  notes: z.string().max(240).optional().or(z.literal("")),
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean().default(false)
});

export type AddressInput = z.infer<typeof addressSchema>;
export type AddressFormValues = z.input<typeof addressSchema>;
