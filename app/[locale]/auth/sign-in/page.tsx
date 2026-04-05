import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/navigation/google-sign-in-button";
import { getCurrentUser } from "@/lib/auth/session";
import { isGoogleAuthConfigured } from "@/lib/auth/options";

export default async function SignInPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale } = await params;
  const typedLocale = locale as "ar" | "en";
  const user = await getCurrentUser();
  const { callbackUrl } = await searchParams;

  if (user) {
    redirect(callbackUrl ?? `/${typedLocale}/account`);
  }

  return (
    <div className="page-section py-16">
      <div className="section-container premium-card mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="section-kicker mb-3">
          {typedLocale === "ar" ? "المصادقة" : "Authentication"}
        </p>
        <h1 className="font-display text-4xl text-text sm:text-5xl">
          {typedLocale === "ar"
            ? "ادخلي إلى مساحة JORINA"
            : "Enter the JORINA account space"}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-text-soft">
          {typedLocale === "ar"
            ? "استخدمي Google للوصول إلى الطلبات، المفضلة، العناوين، وتفضيلات اللغة والدولة."
            : "Use Google to access orders, favorites, addresses and your language or country preferences."}
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          {isGoogleAuthConfigured ? (
            <GoogleSignInButton locale={typedLocale} callbackUrl={callbackUrl} />
          ) : (
            <div className="rounded-[1.4rem] border border-border bg-background-soft px-4 py-5 text-sm text-text-soft">
              {typedLocale === "ar"
                ? "Google OAuth غير مضبوط بعد داخل `.env` المحلي."
                : "Google OAuth is not configured in the local `.env` file yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
