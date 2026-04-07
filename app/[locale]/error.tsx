"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

function isDatabaseError(error: Error & { digest?: string }) {
  return error.message.includes("Authentication failed against the database server");
}

export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const { useParams } = require("next/navigation");
  const params = useParams();
  const locale = params?.locale === "ar" ? "ar" : "en";

  const databaseError = isDatabaseError(error);

  return (
    <div className="page-section py-20">
      <div className="section-container">
        <div className="premium-card mx-auto max-w-2xl p-8 text-center">
          <p className="section-kicker mb-4">
            {databaseError 
              ? (locale === "ar" ? "مشكلة في الاتصال بقاعدة البيانات" : "Database connection issue")
              : (locale === "ar" ? "حدث خطأ ما" : "Something went wrong")}
          </p>
          <h1 className="font-display text-4xl text-text sm:text-5xl">
            {databaseError
              ? (locale === "ar" ? "تعذر الاتصال بقاعدة البيانات" : "Cannot connect to database")
              : (locale === "ar" ? "حدث خلل غير متوقع" : "An unexpected error occurred")}
          </h1>
          <p className="mt-4 text-sm leading-8 text-text-soft sm:text-base">
            {databaseError
              ? (locale === "ar" ? "راجعي إعدادات PostgreSQL وDATABASE_URL ثم أعيدي تحميل الصفحة. إذا كنت تستخدمين Docker فغالبًا توجد حاوية أو بيانات قديمة بكلمة مرور مختلفة." : "Check PostgreSQL settings and DATABASE_URL then reload the page. If using Docker, you might have a stale container or data with a different password.")
              : (locale === "ar" ? "يمكنك إعادة المحاولة الآن، وإذا استمرت المشكلة سنراجع السجل التشغيلي مباشرة." : "You can try again now. If the issue persists, we will check the operational logs directly.")}
          </p>
          <div className="mt-8 flex justify-center">
            <Button type="button" onClick={reset}>
              {locale === "ar" ? "إعادة المحاولة" : "Try again"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
