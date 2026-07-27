import type { Currency } from "@/types";

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  ILS: "he-IL",
  USD: "en-US",
  EUR: "de-DE",
};

/** Format an integer amount of cents into a localized currency string. */
export function formatPrice(priceCents: number, currency: Currency): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}
