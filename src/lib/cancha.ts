import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

const CONFIG_ID = "singleton";
const TIME_ZONE = "America/Argentina/Buenos_Aires";

/** Minutos que una reserva sin seña acreditada retiene el turno antes de liberarse solo. */
export const PENDING_HOLD_MINUTES = 15;

export const BOOKING_STATUSES = ["PENDIENTE", "CONFIRMADO", "CANCELADO"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
};

export const getCanchaConfig = cache(async () => {
  try {
    return await prisma.canchaConfig.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID },
    });
  } catch (err) {
    // Dos requests concurrentes pueden intentar crear la fila única al mismo tiempo;
    // si perdimos la carrera, la fila ya existe: la leemos directamente.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return prisma.canchaConfig.findUniqueOrThrow({ where: { id: CONFIG_ID } });
    }
    throw err;
  }
});

export async function updateCanchaConfig(data: {
  courtName: string;
  slotDurationMin: number;
  openTime: string;
  closeTime: string;
  closedWeekdays: string;
  pricePerSlot: number;
  depositAmount: number;
  whatsappNumber: string;
  callmebotApiKey: string;
  logoUrl: string | null;
}) {
  return prisma.canchaConfig.upsert({
    where: { id: CONFIG_ID },
    update: data,
    create: { id: CONFIG_ID, ...data },
  });
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateDaySlots(config: {
  openTime: string;
  closeTime: string;
  slotDurationMin: number;
}): { startTime: string; endTime: string }[] {
  const open = toMinutes(config.openTime);
  const close = toMinutes(config.closeTime);
  const slots: { startTime: string; endTime: string }[] = [];
  for (let t = open; t + config.slotDurationMin <= close; t += config.slotDurationMin) {
    slots.push({ startTime: minutesToHHMM(t), endTime: minutesToHHMM(t + config.slotDurationMin) });
  }
  return slots;
}

/** Día de la semana (0=domingo) de una fecha "YYYY-MM-DD", sin depender de la zona horaria del servidor. */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isClosedWeekday(config: { closedWeekdays: string }, dateStr: string): boolean {
  const closed = config.closedWeekdays
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  return closed.includes(weekdayOf(dateStr));
}

/** Fecha de hoy "YYYY-MM-DD" en horario argentino, sin importar en qué zona corra el servidor. */
export function todayDateString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Hora actual "HH:mm" en horario argentino. */
export function nowHHMM(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}
