import { formatVariantLabel } from "./format";

export function buildWhatsappOrderLink(params: {
  orderId: string;
  customerName: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    variantColor?: string | null;
    variantSize?: string | null;
  }[];
  total: number;
  resellerCode?: string | null;
  whatsappNumber?: string | null;
}): string {
  const number = params.whatsappNumber;
  const lines = [
    `Hola! Quiero coordinar el pago/envío de mi pedido #${params.orderId.slice(-6).toUpperCase()}.`,
    `Nombre: ${params.customerName}`,
    "Productos:",
    ...params.items.map((i) => {
      const variant = formatVariantLabel(i.variantColor, i.variantSize);
      return `- ${i.quantity}x ${i.productName}${variant ? ` (${variant})` : ""}`;
    }),
    `Total: $${params.total.toLocaleString("es-AR")}`,
  ];
  if (params.resellerCode) {
    lines.push(`Código de revendedora usado: ${params.resellerCode}`);
  }
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number ?? ""}?text=${text}`;
}
