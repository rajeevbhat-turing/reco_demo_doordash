import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[^0-9.]/g, ""));
}
