import { getSearchSuggestions } from "@/lib/services/search";
import type { AppLocale } from "@/types/domain";

export const runtime = "nodejs";

function parseLocale(value: string | null): AppLocale {
  return value === "en" ? "en" : "ar";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = parseLocale(searchParams.get("locale"));
  const query = searchParams.get("q") ?? "";

  const limitValue = Number(searchParams.get("limit") ?? "0");
  const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined;

  const suggestions = await getSearchSuggestions(locale, query, {
    productLimit: limit
  });

  return Response.json(suggestions);
}
