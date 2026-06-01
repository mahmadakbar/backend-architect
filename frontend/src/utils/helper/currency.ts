/**
 * Format number to Indonesian Rupiah currency format
 * @param amount - The amount to format (can be string or number)
 * @returns Formatted string like "Rp 1.049.000"
 */
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `Rp ${numAmount.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
};

/**
 * Parse currency string to number
 * @param currency - Currency string like "Rp 1.049.000"
 * @returns Numeric value
 */
export const parseCurrency = (currency: string): number => {
  return parseFloat(currency.replace(/[^0-9,-]/g, "").replace(",", "."));
};
