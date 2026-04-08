"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tag,
  TicketPercent,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveAdminCouponAction } from "@/lib/actions/admin-coupon-actions";
import {
  adminCouponSchema,
  type AdminCouponInput
} from "@/lib/validators/admin-coupon";

type Locale = "ar" | "en";

type CouponEditorRecord = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  audienceType: "PUBLIC" | "TARGETED";
  startsAt: string | null;
  expiresAt: string | null;
  minSubtotal: number | null;
  maxRedemptions: number | null;
  perCustomerLimit: number;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "ARCHIVED";
  isArchived: boolean;
  redemptionCount: number;
  allowedEmailCount: number;
  allowedEmails: string[];
};

type AdminCouponFormValues = z.input<typeof adminCouponSchema>;

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 space-y-1">
        <h2 className="font-display text-2xl text-white">{title}</h2>
        {description ? (
          <p className="text-sm leading-7 text-white/45">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-300">{message}</p>;
}

function formatDateTimeInput(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function generateCouponCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomChunk = Array.from({ length: 8 }, () => {
    const index = Math.floor(Math.random() * alphabet.length);
    return alphabet[index];
  }).join("");

  return `JORINA-${randomChunk}`;
}

function normalizeEmailCandidates(input: string) {
  return [...new Set(
    input
      .split(/[\s,;\n]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  )];
}

function buildDefaults(coupon?: CouponEditorRecord | null): AdminCouponFormValues {
  return {
    id: coupon?.id,
    code: coupon?.code ?? "",
    discountType: coupon?.discountType ?? "PERCENTAGE",
    discountValue: coupon?.discountValue ?? 10,
    audienceType: coupon?.audienceType ?? "PUBLIC",
    startsAt: formatDateTimeInput(coupon?.startsAt),
    expiresAt: formatDateTimeInput(coupon?.expiresAt),
    minSubtotal: coupon?.minSubtotal ?? undefined,
    maxRedemptions: coupon?.maxRedemptions ?? undefined,
    perCustomerLimit: coupon?.perCustomerLimit ?? 1,
    allowedEmails: coupon?.allowedEmails ?? []
  };
}

export function CouponEditorForm({
  locale,
  customerOptions,
  coupon
}: {
  locale: Locale;
  customerOptions: string[];
  coupon?: CouponEditorRecord | null;
}) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const [isSaving, startSaving] = useTransition();
  const [manualEmails, setManualEmails] = useState("");

  const form = useForm<AdminCouponFormValues, unknown, AdminCouponInput>({
    resolver: zodResolver(adminCouponSchema),
    defaultValues: buildDefaults(coupon)
  });

  const audienceType = form.watch("audienceType");
  const selectedEmails = (form.watch("allowedEmails") as string[] | undefined) ?? [];
  const discountType = form.watch("discountType");
  const selectedEmailSet = useMemo(
    () => new Set(selectedEmails.map((entry) => entry.toLowerCase())),
    [selectedEmails]
  );

  function toggleEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const nextEmails = selectedEmailSet.has(normalized)
      ? selectedEmails.filter((entry) => entry !== normalized)
      : [...selectedEmails, normalized].sort((left, right) =>
          left.localeCompare(right)
        );

    form.setValue("allowedEmails", nextEmails, {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  function addManualEmails() {
    const nextCandidates = normalizeEmailCandidates(manualEmails);

    if (nextCandidates.length === 0) {
      return;
    }

    form.setValue(
      "allowedEmails",
      [...new Set([...selectedEmails, ...nextCandidates])].sort((left, right) =>
        left.localeCompare(right)
      ),
      {
        shouldDirty: true,
        shouldValidate: true
      }
    );
    setManualEmails("");
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => {
        startSaving(async () => {
          const result = await saveAdminCouponAction(values);

          if (!result.success) {
            toast.error(
              result.error ?? (isArabic ? "فشل حفظ الكوبون" : "Failed to save coupon")
            );
            return;
          }

          toast.success(
            coupon?.id
              ? isArabic
                ? "تم تحديث الكوبون"
                : "Coupon updated"
              : isArabic
                ? "تم إنشاء الكوبون"
                : "Coupon created"
          );

          if (!coupon?.id && result.couponId) {
            router.replace(`/${locale}/admin/coupons/${result.couponId}`);
          }

          router.refresh();
        });
      })}
    >
      <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-300/70">
            {isArabic ? "إدارة الكوبونات" : "Coupon management"}
          </p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            {coupon?.id
              ? isArabic
                ? "تعديل كوبون"
                : "Edit coupon"
              : isArabic
                ? "إنشاء كوبون"
                : "Create coupon"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">
            {isArabic
              ? "أنشئ كوبونات عامة أو مخصصة، واضبط مدة الصلاحية وحدود الاستخدام ثم شارك الكود يدويًا مع العملاء."
              : "Create public or targeted coupons, control validity, and share the code manually with customers."}
          </p>
          {coupon?.id ? (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/70">
                {isArabic ? "الاستخدامات" : "Uses"}: {coupon.redemptionCount}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/70">
                {isArabic ? "الاستهداف" : "Audience"}:{" "}
                {coupon.audienceType === "PUBLIC"
                  ? isArabic
                    ? "عام"
                    : "Public"
                  : isArabic
                    ? "مخصص"
                    : "Targeted"}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/70">
                {isArabic ? "الحالة" : "Status"}: {coupon.status}
              </span>
            </div>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="min-w-44" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving
            ? isArabic
              ? "جارٍ الحفظ..."
              : "Saving..."
            : isArabic
              ? "حفظ الكوبون"
              : "Save coupon"}
        </Button>
      </div>

      <Section
        title={isArabic ? "بيانات الكوبون" : "Coupon settings"}
        description={
          isArabic
            ? "حدّد الكود ونوع الخصم وطريقة تطبيقه على الطلب."
            : "Define the code, discount type, and how the coupon should apply."
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-white/65">
                {isArabic ? "كود الكوبون" : "Coupon code"}
              </label>
              <button
                type="button"
                onClick={() =>
                  form.setValue("code", generateCouponCode(), {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
                className="inline-flex items-center gap-1 text-xs text-rose-300 transition hover:text-rose-200"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isArabic ? "توليد تلقائي" : "Generate"}
              </button>
            </div>
            <Input
              placeholder="JORINA-25OFF"
              {...form.register("code")}
              onChange={(event) =>
                form.setValue("code", event.target.value.toUpperCase(), {
                  shouldDirty: true,
                  shouldValidate: true
                })
              }
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            <FieldError message={form.formState.errors.code?.message} />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "نوع الجمهور" : "Audience type"}
            </label>
            <select
              {...form.register("audienceType")}
              className="h-12 w-full rounded-[1.15rem] border border-white/10 bg-black/20 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            >
              <option value="PUBLIC" className="bg-[#151515]">
                {isArabic ? "عام" : "Public"}
              </option>
              <option value="TARGETED" className="bg-[#151515]">
                {isArabic ? "مخصص لإيميلات محددة" : "Targeted to selected emails"}
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "نوع الخصم" : "Discount type"}
            </label>
            <select
              {...form.register("discountType")}
              className="h-12 w-full rounded-[1.15rem] border border-white/10 bg-black/20 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            >
              <option value="PERCENTAGE" className="bg-[#151515]">
                {isArabic ? "نسبة مئوية" : "Percentage"}
              </option>
              <option value="FIXED_AMOUNT" className="bg-[#151515]">
                {isArabic ? "مبلغ ثابت" : "Fixed amount"}
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "قيمة الخصم" : "Discount value"}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              {...form.register("discountValue")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            <p className="text-xs text-white/35">
              {discountType === "PERCENTAGE"
                ? isArabic
                  ? "القيمة هنا تُفهم كنسبة من 100."
                  : "This value is treated as a percentage out of 100."
                : isArabic
                  ? "القيمة هنا تُخصم كمبلغ ثابت من المجموع الفرعي."
                  : "This value is deducted as a fixed amount from subtotal."}
            </p>
            <FieldError message={form.formState.errors.discountValue?.message} />
          </div>
        </div>
      </Section>

      <Section
        title={isArabic ? "قيود الاستخدام" : "Usage limits"}
        description={
          isArabic
            ? "حدّد نافذة الصلاحية والحد الأدنى والحدود لكل عميل أو إجماليًا."
            : "Control the validity window, minimum subtotal, and usage caps."
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "يبدأ في" : "Starts at"}
            </label>
            <Input
              type="datetime-local"
              {...form.register("startsAt")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            <FieldError message={form.formState.errors.startsAt?.message as string | undefined} />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "ينتهي في" : "Expires at"}
            </label>
            <Input
              type="datetime-local"
              {...form.register("expiresAt")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            <FieldError message={form.formState.errors.expiresAt?.message as string | undefined} />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "حد أدنى للمجموع الفرعي" : "Minimum subtotal"}
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              {...form.register("minSubtotal")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/65">
              {isArabic ? "الحد الأقصى للاستخدامات" : "Max redemptions"}
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              {...form.register("maxRedemptions")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
          </div>

          <div className="space-y-2 xl:max-w-sm">
            <label className="text-sm text-white/65">
              {isArabic ? "عدد مرات الاستخدام لكل عميل" : "Per-customer limit"}
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              {...form.register("perCustomerLimit")}
              className="border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
            />
            <FieldError message={form.formState.errors.perCustomerLimit?.message} />
          </div>
        </div>
      </Section>

      <Section
        title={isArabic ? "استهداف العملاء" : "Customer targeting"}
        description={
          isArabic
            ? "يمكنك اختيار إيميلات من قاعدة البيانات الحالية أو إضافتها يدويًا."
            : "Pick existing customer emails or add them manually."
        }
      >
        <div className="rounded-[1.3rem] border border-white/10 bg-black/15 p-4 text-sm text-white/60">
          <div className="flex items-center gap-2">
            {audienceType === "PUBLIC" ? (
              <Tag className="h-4 w-4 text-rose-300" />
            ) : (
              <Users className="h-4 w-4 text-rose-300" />
            )}
            <span>
              {audienceType === "PUBLIC"
                ? isArabic
                  ? "الكوبون عام ويمكن استخدامه من أي عميل طالما استوفى الشروط."
                  : "This coupon is public and can be used by any eligible customer."
                : isArabic
                  ? "الكوبون مخصص ويُطابق الإيميل المكتوب في صفحة الدفع."
                  : "This coupon is targeted and matches the email entered at checkout."}
            </span>
          </div>
        </div>

        {audienceType === "TARGETED" ? (
          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-white/65">
                {isArabic ? "الإيميلات المحددة" : "Selected emails"}
              </label>
              <div className="flex min-h-16 flex-wrap gap-2 rounded-[1.2rem] border border-white/10 bg-black/20 p-3">
                {selectedEmails.map((email) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => toggleEmail(email)}
                    className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/15"
                  >
                    {email}
                  </button>
                ))}
                {selectedEmails.length === 0 ? (
                  <span className="text-sm text-white/30">
                    {isArabic ? "لم يتم اختيار أي إيميلات بعد." : "No emails selected yet."}
                  </span>
                ) : null}
              </div>
              <FieldError message={form.formState.errors.allowedEmails?.message as string | undefined} />
            </div>

            <div className="space-y-3">
              <label className="text-sm text-white/65">
                {isArabic ? "إضافة يدوية" : "Manual add"}
              </label>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <Textarea
                  rows={4}
                  value={manualEmails}
                  onChange={(event) => setManualEmails(event.target.value)}
                  placeholder={
                    isArabic
                      ? "ألصق إيميلات متعددة مفصولة بسطر جديد أو فاصلة"
                      : "Paste one or more emails separated by new lines or commas"
                  }
                  className="min-h-28 border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-rose-400"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full lg:w-auto"
                  onClick={addManualEmails}
                >
                  <Plus className="h-4 w-4" />
                  {isArabic ? "إضافة الإيميلات" : "Add emails"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-white/65">
                <TicketPercent className="h-4 w-4 text-rose-300" />
                {isArabic ? "إيميلات العملاء الحالية" : "Known customer emails"}
              </label>
              <div className="max-h-72 overflow-y-auto rounded-[1.2rem] border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap gap-2">
                  {customerOptions.map((email) => {
                    const selected = selectedEmailSet.has(email);
                    return (
                      <button
                        key={email}
                        type="button"
                        onClick={() => toggleEmail(email)}
                        className={
                          selected
                            ? "rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-100 transition hover:bg-rose-400/15"
                            : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
                        }
                      >
                        {email}
                      </button>
                    );
                  })}
                  {customerOptions.length === 0 ? (
                    <p className="text-sm text-white/30">
                      {isArabic
                        ? "لا توجد إيميلات محفوظة بعد في قاعدة البيانات."
                        : "No saved customer emails were found yet."}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Section>
    </form>
  );
}
