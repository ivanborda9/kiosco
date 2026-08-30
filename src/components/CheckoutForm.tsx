"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

type CodeState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; name: string; discountPercent: number }
  | { status: "invalid"; message: string };

type PaymentMethod = "WHATSAPP" | "MERCADOPAGO";

export function CheckoutForm({
  mercadoPagoEnabled,
  showResellerCode = true,
}: {
  mercadoPagoEnabled: boolean;
  showResellerCode?: boolean;
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<CodeState>({ status: "idle" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    mercadoPagoEnabled ? "MERCADOPAGO" : "WHATSAPP"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discountAmount = useMemo(() => {
    if (codeState.status === "valid") {
      return Math.round(subtotal * (codeState.discountPercent / 100));
    }
    return 0;
  }, [codeState, subtotal]);

  const total = subtotal - discountAmount;

  async function checkCode() {
    if (!code.trim()) {
      setCodeState({ status: "idle" });
      return;
    }
    setCodeState({ status: "checking" });
    try {
      const res = await fetch("/api/codigo/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCodeState({ status: "valid", name: data.name, discountPercent: data.discountPercent });
      } else {
        setCodeState({ status: "invalid", message: data.message || "Código no válido." });
      }
    } catch {
      setCodeState({ status: "invalid", message: "No se pudo validar el código." });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          notes,
          resellerCode: codeState.status === "valid" ? code : null,
          paymentMethod,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo procesar el pedido.");
        setSubmitting(false);
        return;
      }
      clear();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      router.push(`/pedido/${data.orderId}`);
    } catch {
      setError("No se pudo procesar el pedido. Intentá nuevamente.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">No tenés productos en el carrito</h1>
        <Link href="/" className="mt-4 inline-block text-brand-600 hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:col-span-2">
        <h1 className="text-2xl font-bold text-gray-900">Finalizar compra</h1>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre y apellido</label>
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Dirección de envío</label>
          <input
            required
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            rows={2}
          />
        </div>

        {showResellerCode && (
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
            <label className="mb-1 block text-sm font-medium text-brand-800">
              ¿Comprás a través de una revendedora? Ingresá su código
            </label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeState({ status: "idle" });
                }}
                placeholder="Ej: ANA10"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 uppercase"
              />
              <button
                type="button"
                onClick={checkCode}
                className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
              >
                Validar
              </button>
            </div>
            {codeState.status === "checking" && (
              <p className="mt-2 text-sm text-brand-700">Validando...</p>
            )}
            {codeState.status === "valid" && (
              <p className="mt-2 text-sm font-medium text-green-700">
                ¡Código de {codeState.name} aplicado! {codeState.discountPercent}% de descuento.
              </p>
            )}
            {codeState.status === "invalid" && (
              <p className="mt-2 text-sm font-medium text-red-600">{codeState.message}</p>
            )}
          </div>
        )}

        <div>
          <span className="mb-2 block text-sm font-medium text-gray-700">¿Cómo querés pagar?</span>
          <div className="flex flex-col gap-2">
            {mercadoPagoEnabled && (
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
                  paymentMethod === "MERCADOPAGO" ? "border-brand-600 bg-brand-50" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "MERCADOPAGO"}
                  onChange={() => setPaymentMethod("MERCADOPAGO")}
                />
                <span className="text-sm">
                  <span className="font-medium text-gray-900">Tarjeta / Mercado Pago</span>
                  <br />
                  <span className="text-gray-500">
                    Pagás ahora online con tarjeta de crédito, débito u otros medios.
                  </span>
                </span>
              </label>
            )}
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
                paymentMethod === "WHATSAPP" ? "border-brand-600 bg-brand-50" : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "WHATSAPP"}
                onChange={() => setPaymentMethod("WHATSAPP")}
              />
              <span className="text-sm">
                <span className="font-medium text-gray-900">Efectivo / transferencia</span>
                <br />
                <span className="text-gray-500">Coordinás el pago y el envío por WhatsApp.</span>
              </span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300"
        >
          {submitting
            ? "Procesando..."
            : paymentMethod === "MERCADOPAGO"
              ? "Ir a pagar"
              : "Confirmar pedido"}
        </button>
      </form>

      <div className="h-fit rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Resumen del pedido</h2>
        <ul className="mb-3 flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between text-gray-700">
              <span>
                {i.quantity}x {i.name}
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-gray-200 pt-2 text-gray-700">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Descuento</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
