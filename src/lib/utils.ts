import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number or string into Ghana Cedis (GH₵)
 */
export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace("GHS", "GH₵");
}

/**
 * Format phone condition badge label & color
 */
export function getConditionBadge(condition: "brand_new" | "uk_used" | "refurbished") {
  switch (condition) {
    case "brand_new":
      return { label: "Brand New", className: "bg-emerald-500/15 text-emerald-700 border-emerald-300 dark:text-emerald-400" };
    case "uk_used":
      return { label: "UK Used (Grade A)", className: "bg-amber-500/15 text-amber-800 border-amber-300 dark:text-amber-400" };
    case "refurbished":
      return { label: "Refurbished", className: "bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400" };
    default:
      return { label: "Standard", className: "bg-gray-100 text-gray-800 border-gray-300" };
  }
}
