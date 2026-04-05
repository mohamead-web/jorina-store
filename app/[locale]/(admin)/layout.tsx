import { BarChart3, ClipboardList, Home, LayoutDashboard, Package } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/guards";

const adminLinks = [
  { href: "/admin", icon: LayoutDashboard, labelAr: "لوحة التحكم", labelEn: "Dashboard" },
  { href: "/admin/orders", icon: ClipboardList, labelAr: "الطلبات", labelEn: "Orders" },
  { href: "/", icon: Home, labelAr: "الموقع", labelEn: "Go to site" }
];

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  await requireAdmin(typedLocale);

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-40 flex w-64 flex-col border-e border-white/5 bg-[#141414]">
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-6">
          <BarChart3 className="h-6 w-6 text-rose-400" />
          <span className="font-display text-lg font-semibold tracking-wide text-white">
            JORINA <span className="text-xs font-normal text-white/40">Admin</span>
          </span>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4 text-white/40 transition-colors group-hover:text-rose-400" />
                {typedLocale === "ar" ? link.labelAr : link.labelEn}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
            JORINA Admin v1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ps-64">
        <div className="px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
