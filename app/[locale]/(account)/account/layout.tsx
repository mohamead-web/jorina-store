import type { ReactNode } from "react";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { requireUser } from "@/lib/auth/guards";

export default async function AccountLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireUser(locale as "ar" | "en");

  return (
    <div className="page-section pb-28 pt-8 lg:pb-10 lg:pt-10">
      <div className="section-container grid gap-6 lg:grid-cols-[250px_1fr]">
        <AccountSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
