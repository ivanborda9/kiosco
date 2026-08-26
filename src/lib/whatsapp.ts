export function buildWhatsappOrderLink(params: {
  orderId: string;
  customerName: string;
  items: { productName: string; quantity: number; price: number }[];
  total: number;
  resellerCode?: string | null;
}): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const lines = [
    `Hola! Quiero coordinar el pago/envío de mi pedido #${params.orderId.slice(-6).toUpperCase()}.`,
    `Nombre: ${params.customerName}`,
    "Productos:",
    ...params.items.map((i) => `- ${i.quantity}x ${i.productName}`),
    `Total: $${params.total.toLocaleString("es-AR")}`,
  ];
  if (params.resellerCode) {
    lines.push(`Código de revendedora usado: ${params.resellerCode}`);
  }
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number ?? ""}?text=${text}`;
}
