export function formatCurrency(
  value: number | string,
  locale = "es-CL",
  currency = "CLP"
): string {
  const amount = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(amount)) {
    return `${value}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}