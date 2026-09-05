export function computeProfit(price: number, costPrice: number | null | undefined) {
  if (costPrice == null || costPrice <= 0 || price <= 0) return null;
  const profit = price - costPrice;
  const marginPercent = (profit / price) * 100;
  return { profit, marginPercent };
}
