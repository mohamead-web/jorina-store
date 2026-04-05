import { z } from "zod";

export const preferenceSchema = z.object({
  localeCode: z.enum(["ar", "en"]).default("ar"),
  countryCode: z.enum(["EG"]).default("EG")
});

export type PreferenceInput = z.infer<typeof preferenceSchema>;
