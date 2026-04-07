"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";

export function NewsletterCta({ locale }: { locale: "ar" | "en" }) {
  return (
    <section className="page-section mt-14 pb-10 lg:mt-16">
      <div className="section-container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.4rem] border border-black/6 bg-[linear-gradient(135deg,#fffdfc_0%,#f7eeeb_100%)] px-6 py-8 shadow-[0_46px_90px_-74px_rgba(17,12,12,0.38)] lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-10 end-10 h-36 w-36 rounded-full bg-[#e5ccd1]/75 blur-3xl" />
              <div className="absolute bottom-0 start-[10%] h-24 w-24 rounded-full bg-white/65 blur-2xl" />
            </div>

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.88fr] lg:items-end">
              <div>
                <p className="section-kicker mb-3">
                  {locale === "ar" ? "وصول هادئ" : "Quiet access"}
                </p>
                <h2 className="max-w-3xl font-display text-4xl leading-tight text-text sm:text-5xl lg:text-[3.7rem]">
                  {locale === "ar"
                    ? "احصلي على الإصدارات المختارة قبل ظهورها للجميع"
                    : "Receive selected launches before they appear everywhere"}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-text-soft sm:text-base">
                  {locale === "ar"
                    ? "نرسل فقط ما يستحق الوصول: إطلاقات جديدة، مجموعات محدودة، وتحريرات موسمية راقية."
                    : "Only the details worth receiving: new launches, limited edits and considered seasonal releases."}
                </p>
              </div>

              <form 
                className="grid gap-3 sm:grid-cols-[1fr_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success(locale === "ar" ? "تم الاشتراك بنجاح" : "Subscribed successfully");
                }}
              >
                <Input
                  type="email"
                  placeholder={locale === "ar" ? "name@email.com" : "name@email.com"}
                  className="h-12 rounded-full border-black/8 bg-white/78 px-5"
                />
                <Button type="submit" variant="primary" size="lg" className="px-7">
                  {locale === "ar" ? "انضمّي الآن" : "Join now"}
                </Button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
