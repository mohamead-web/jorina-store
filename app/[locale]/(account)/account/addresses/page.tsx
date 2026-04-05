import { AddressManager } from "@/components/account/address-manager";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireUser } from "@/lib/auth/guards";
import { getAddresses } from "@/lib/services/address";

export default async function AddressesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await requireUser(typedLocale);
  const addresses = await getAddresses(user.id);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={typedLocale === "ar" ? "العناوين" : "Addresses"}
        title={typedLocale === "ar" ? "إدارة العناوين المحفوظة" : "Manage saved addresses"}
      />
      <AddressManager locale={typedLocale} addresses={addresses} />
    </div>
  );
}
