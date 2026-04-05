"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductDetailsTabs({
  locale,
  description,
  ingredients,
  howToUse
}: {
  locale: "ar" | "en";
  description: string;
  ingredients: string;
  howToUse: string;
}) {
  const tabs = [
    {
      value: "details",
      label: locale === "ar" ? "التفاصيل" : "Details",
      content: description
    },
    {
      value: "ingredients",
      label: locale === "ar" ? "المكونات" : "Ingredients",
      content: ingredients
    },
    {
      value: "usage",
      label: locale === "ar" ? "طريقة الاستخدام" : "How to use",
      content: howToUse
    }
  ];

  return (
    <div className="premium-card p-6">
      <Tabs defaultValue="details">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="rounded-[1.4rem] border border-border bg-white px-5 py-5">
              <p className="text-sm leading-8 text-text-soft sm:text-base">
                {tab.content}
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
