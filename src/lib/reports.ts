export type CostMap = Map<string, number | null | undefined>;

export function buildCostMap(products: { id: string; costPrice: number | null }[]): CostMap {
  return new Map(products.map((p) => [p.id, p.costPrice]));
}

export function orderCost(
  items: { productId: string; quantity: number }[],
  costByProductId: CostMap
): number {
  return items.reduce(
    (sum, item) => sum + (costByProductId.get(item.productId) ?? 0) * item.quantity,
    0
  );
}

/**
 * Ganancia neta de un pedido: total cobrado (ya con descuento aplicado) menos
 * el costo de los productos vendidos (0 para los que no tienen costo cargado)
 * menos la comisión pagada a la revendedora.
 */
export function orderNetProfit(
  order: {
    total: number;
    commissionAmount: number;
    items: { productId: string; quantity: number }[];
  },
  costByProductId: CostMap
): number {
  return order.total - orderCost(order.items, costByProductId) - order.commissionAmount;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export function dayKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function monthKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type OrderForStats = {
  status: string;
  total: number;
  commissionAmount: number;
  createdAt: Date;
  resellerId: string | null;
  items: { productId: string; productName: string; price: number; quantity: number }[];
};

export function buildResellerStats(
  reseller: { id: string; lastPayoutAt: Date | null },
  orders: OrderForStats[],
  costMap: CostMap
) {
  const active = orders.filter((o) => o.resellerId === reseller.id && o.status !== "CANCELADO");
  const salesCount = active.length;
  const totalSales = active.reduce((sum, o) => sum + o.total, 0);
  const commissionEarned = active.reduce((sum, o) => sum + o.commissionAmount, 0);
  const netProfitGenerated = active.reduce((sum, o) => sum + orderNetProfit(o, costMap), 0);
  const pendingCommission = active
    .filter((o) => !reseller.lastPayoutAt || o.createdAt > reseller.lastPayoutAt)
    .reduce((sum, o) => sum + o.commissionAmount, 0);

  const productAgg = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const o of active) {
    for (const item of o.items) {
      const entry = productAgg.get(item.productId) ?? {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.price * item.quantity;
      productAgg.set(item.productId, entry);
    }
  }
  const products = Array.from(productAgg.values()).sort((a, b) => b.quantity - a.quantity);

  return { salesCount, totalSales, commissionEarned, netProfitGenerated, pendingCommission, products };
}
