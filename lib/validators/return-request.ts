import { z } from "zod";

export const returnRequestSchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1),
  reason: z.string().min(8).max(240),
  notes: z.string().max(240).optional().or(z.literal(""))
});

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
