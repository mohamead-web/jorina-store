import {
  BarChart3,
  ClipboardList,
  Home,
  LayoutDashboard,
  Package,
  TicketPercent
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/guards";
import { Link } from "@/lib/i18n/navigation";

const adminLinks = [
  { href: "/admin", icon: LayoutDashboard, labelAr: "لوحة التحكم", labelEn: "Dashboard" },
  { href: "/admin/orders", icon: ClipboardList, labelAr: "الطلبات", labelEn: "Orders" },
  { href: "/admin/products", icon: Package, labelAr: "المنتجات", labelEn: "Products" },
  { href: "/admin/coupons", icon: TicketPercent, labelAr: "الكوبونات", labelEn: "Coupons" },
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
      <aside className="fixed inset-x-0 bottom-0 z-40 flex h-16 w-full border-t border-white/5 bg-[#141414] lg:inset-y-0 lg:start-0 lg:h-full lg:w-64 lg:flex-col lg:border-e lg:border-t-0">
        <div className="hidden h-16 items-center gap-3 border-b border-white/5 px-6 lg:flex">
          <BarChart3 className="h-6 w-6 text-rose-400" />
          <span className="font-display text-lg font-semibold tracking-wide text-white">
            JORINA <span className="text-xs font-normal text-white/40">Admin</span>
          </span>
        </div>

        <nav className="flex flex-1 items-center justify-around px-2 lg:mt-4 lg:flex-col lg:justify-start lg:space-y-1 lg:px-3">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href as any}
                className="group flex flex-col items-center gap-1 rounded-xl p-2 text-[10px] text-white/60 transition-all hover:bg-white/5 hover:text-white sm:text-xs lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm"
              >
                <Icon className="h-5 w-5 text-white/40 transition-colors group-hover:text-rose-400 lg:h-4 lg:w-4" />
                <span className="hidden min-[390px]:block lg:block">
                  {typedLocale === "ar" ? link.labelAr : link.labelEn}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/5 p-4 lg:block">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
            JORINA Admin v1.0
          </p>
        </div>
      </aside>

      <main className="flex-1 pb-16 lg:pb-0 lg:ps-64">
        <div className="px-4 py-6 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
