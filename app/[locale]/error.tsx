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

  const databaseError = isDatabaseError(error);

  return (
    <div className="page-section py-20">
      <div className="section-container">
        <div className="premium-card mx-auto max-w-2xl p-8 text-center">
          <p className="section-kicker mb-4">
            {databaseError ? "Database connection issue" : "Something went wrong"}
          </p>
          <h1 className="font-display text-4xl text-text sm:text-5xl">
            {databaseError
              ? "تعذر الاتصال بقاعدة البيانات"
              : "حدث خلل غير متوقع"}
          </h1>
          <p className="mt-4 text-sm leading-8 text-text-soft sm:text-base">
            {databaseError
              ? "راجعي إعدادات PostgreSQL وDATABASE_URL ثم أعيدي تحميل الصفحة. إذا كنت تستخدمين Docker فغالبًا توجد حاوية أو بيانات قديمة بكلمة مرور مختلفة."
              : "يمكنك إعادة المحاولة الآن، وإذا استمرت المشكلة سنراجع السجل التشغيلي مباشرة."}
          </p>
          <div className="mt-8 flex justify-center">
            <Button type="button" onClick={reset}>
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
