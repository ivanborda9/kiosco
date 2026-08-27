"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Config = {
  courtName: string;
  pricePerSlot: number;
  depositAmount: number;
  slotDurationMin: number;
};

type AvailabilityResponse = {
  month: string;
  today: string;
  config: Config;
  days: Record<string, string[]>;
};

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_MONTHS_AHEAD = 3;

function weekdayMondayFirst(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const total = y * 12 + (m - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDateDisplay(date: string): string {
  return date.split("-").reverse().join("/");
}

export function BookingCalendar({
  initialConfig,
  mercadoPagoEnabled,
  today,
}: {
  initialConfig: Config;
  mercadoPagoEnabled: boolean;
  today: string;
}) {
  const router = useRouter();
  const currentMonth = today.slice(0, 7);
  const maxMonth = addMonths(currentMonth, MAX_MONTHS_AHEAD);

  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    setError(null);
    fetch(`/api/cancha/disponibilidad?month=${month}`)
      .then((res) => res.json())
      .then((json: AvailabilityResponse) => {
        if (!cancelled) setData(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const config = data?.config ?? initialConfig;
  const canGoPrev = month > currentMonth;
  const canGoNext = month < maxMonth;

  const leadingBlanks = weekdayMondayFirst(`${month}-01`);
  const dateEntries = data ? Object.entries(data.days).sort(([a], [b]) => (a < b ? -1 : 1)) : [];

  function selectDate(date: string, slots: string[]) {
    if (slots.length === 0) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/cancha/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          startTime: selectedSlot,
          customerName,
          customerPhone,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "No se pudo crear la reserva.");
        setSubmitting(false);
        if (res.status === 409) {
          // El turno se ocupó justo antes: refrescamos la disponibilidad del mes.
          setSelectedSlot(null);
          fetch(`/api/cancha/disponibilidad?month=${month}`)
            .then((r) => r.json())
            .then(setData);
        }
        return;
      }
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      router.push(`/cancha/reserva/${result.bookingId}`);
    } catch {
      setError("No se pudo crear la reserva. Intentá nuevamente.");
      setSubmitting(false);
    }
  }

  if (!mercadoPagoEnabled) {
    return (
      <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
        Las reservas online todavía no están disponibles. Contactanos directamente para coordinar tu
        turno.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setMonth((m) => addMonths(m, -1))}
          disabled={!canGoPrev}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-30"
        >
          ← Anterior
        </button>
        <span className="text-lg font-bold capitalize text-gray-900">{monthLabel(month)}</span>
        <button
          type="button"
          onClick={() => canGoNext && setMonth((m) => addMonths(m, 1))}
          disabled={!canGoNext}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-30"
        >
          Siguiente →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {dateEntries.map(([date, slots]) => {
          const day = Number(date.slice(-2));
          const hasSlots = slots.length > 0;
          const isSelected = date === selectedDate;
          const isToday = data?.today === date;
          return (
            <button
              key={date}
              type="button"
              disabled={!hasSlots}
              onClick={() => selectDate(date, slots)}
              className={`flex flex-col items-center gap-0.5 rounded-lg border px-1 py-2 text-sm transition ${
                isSelected
                  ? "border-brand-600 bg-brand-600 text-white"
                  : hasSlots
                    ? "border-brand-200 bg-white text-gray-900 hover:border-brand-400"
                    : "border-gray-100 bg-gray-50 text-gray-300"
              } ${isToday && !isSelected ? "ring-1 ring-brand-400" : ""}`}
            >
              <span className="font-semibold">{day}</span>
              {hasSlots && (
                <span className={`text-[10px] ${isSelected ? "text-brand-100" : "text-brand-600"}`}>
                  {slots.length} libres
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && <p className="mt-4 text-sm text-gray-500">Cargando disponibilidad...</p>}

      {selectedDate && data && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-gray-900">
            Turnos disponibles el {formatDateDisplay(selectedDate)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {(data.days[selectedDate] || []).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  selectedSlot === slot
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-gray-300 text-gray-700 hover:border-brand-400"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedSlot && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5"
        >
          <div className="text-sm text-gray-700">
            <p>
              Turno: <strong>{formatDateDisplay(selectedDate)}</strong> a las{" "}
              <strong>{selectedSlot}</strong>
            </p>
            <p className="mt-1">
              Precio total: {formatPrice(config.pricePerSlot)} · Seña a pagar ahora:{" "}
              <strong>{formatPrice(config.depositAmount)}</strong>
            </p>
          </div>

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
            <label className="mb-1 block text-sm font-medium text-gray-700">Celular</label>
            <input
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Ej: 1122334455"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-300"
          >
            {submitting ? "Procesando..." : `Pagar seña de ${formatPrice(config.depositAmount)}`}
          </button>
        </form>
      )}

      {error && !(selectedDate && selectedSlot) && (
        <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
