import { ORDER_STATUS_LABELS, OrderStatus } from "@/lib/format";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  ENVIADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
