"use client";

import { useState } from "react";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mercadopago/${orderId}/retry`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "No se pudo generar el link de pago.");
        setLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("No se pudo generar el link de pago.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300"
      >
        {loading ? "Generando link..." : "Reintentar pago"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
