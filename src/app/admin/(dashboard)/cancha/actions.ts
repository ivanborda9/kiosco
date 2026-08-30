"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BOOKING_STATUSES, BookingStatus, getCanchaConfig, updateCanchaConfig } from "@/lib/cancha";
import { sendCallMeBotMessage } from "@/lib/notify";

const TIME_RE = /^\d{2}:\d{2}$/;

export async function saveCanchaConfig(formData: FormData) {
  const courtName = String(formData.get("courtName") || "").trim() || "Cancha de Fútbol 7";
  const pricePerSlot = Math.max(0, Number(formData.get("pricePerSlot")) || 0);
  const depositAmount = Math.max(0, Number(formData.get("depositAmount")) || 0);
  const slotDurationMin = Math.max(15, Math.floor(Number(formData.get("slotDurationMin")) || 60));
  const openTimeRaw = String(formData.get("openTime") || "").trim();
  const closeTimeRaw = String(formData.get("closeTime") || "").trim();
  const openTime = TIME_RE.test(openTimeRaw) ? openTimeRaw : "09:00";
  const closeTime = TIME_RE.test(closeTimeRaw) ? closeTimeRaw : "23:00";
  const closedWeekdays = formData.getAll("closedWeekdays").map(String).join(",");
  const whatsappNumber = String(formData.get("whatsappNumber") || "").trim();
  const callmebotApiKey = String(formData.get("callmebotApiKey") || "").trim();

  await updateCanchaConfig({
    courtName,
    pricePerSlot,
    depositAmount,
    slotDurationMin,
    openTime,
    closeTime,
    closedWeekdays,
    whatsappNumber,
    callmebotApiKey,
  });

  revalidatePath("/cancha", "layout");
  redirect("/admin/cancha?guardado=1");
}

export async function updateBookingStatus(id: string, formData: FormData) {
  const status = String(formData.get("status") || "");
  if (!BOOKING_STATUSES.includes(status as BookingStatus)) return;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return;

  await prisma.booking.update({ where: { id }, data: { status } });

  if (status === "CANCELADO" && booking.status !== "CANCELADO") {
    const config = await getCanchaConfig();
    await sendCallMeBotMessage({
      phone: config.whatsappNumber,
      apiKey: config.callmebotApiKey,
      message: `❌ Reserva cancelada en ${config.courtName}\nFecha: ${booking.date} a las ${booking.startTime}\nCliente: ${booking.customerName} (${booking.customerPhone})`,
    });
  }

  revalidatePath("/admin/cancha");
}
