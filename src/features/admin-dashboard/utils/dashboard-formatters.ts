export function formatMinorCurrency(
  amountMinor: number,
  currency: string,
  exponent: number,
  locale: string,
) {
  const amount = amountMinor / 10 ** exponent;
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(amount);
}

export function formatMajorCurrency(amount: number, currency: string, locale: string, exponent = 2) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(amount);
}

export function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG").format(value);
}

export function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    dateStyle: "medium",
  }).format(new Date(value));
}
