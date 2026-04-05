import { SettingsPanel } from "@/components/account/settings-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth/guards";
import { getResolvedPreferences } from "@/lib/services/preferences";

export default async function SettingsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await requireUser(typedLocale);
  const preferences = await getResolvedPreferences(user.id);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={typedLocale === "ar" ? "الإعدادات" : "Settings"}
        title={typedLocale === "ar" ? "التفضيلات والحساب" : "Preferences and account"}
      />
      <SettingsPanel
        locale={typedLocale}
        currentLocale={preferences.localeCode}
        currentCountry={preferences.countryCode}
        profile={{
          name: user.name,
          email: user.email
        }}
      />
    </div>
  );
}
