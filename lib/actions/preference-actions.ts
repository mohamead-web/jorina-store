"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import {
  saveUserPreferences,
  writeGuestPreferences
} from "@/lib/services/preferences";
import { preferenceSchema } from "@/lib/validators/preferences";

export async function updatePreferencesAction(rawInput: unknown) {
  const input = preferenceSchema.parse(rawInput);
  const user = await getCurrentUser();

  if (user?.id) {
    await saveUserPreferences(user.id, input);
  } else {
    await writeGuestPreferences(input);
  }

  revalidatePath(`/${input.localeCode}`);

  return { success: true };
}
