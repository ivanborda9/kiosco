import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PENDING_HOLD_MINUTES,
  daysInMonth,
  generateDaySlots,
  getCanchaConfig,
  isClosedWeekday,
  nowHHMM,
  todayDateString,
} from "@/lib/cancha";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function GET(req: NextRequest) {
  const today = todayDateString();
  const monthParam = req.nextUrl.searchParams.get("month") || "";
  const month = MONTH_RE.test(monthParam) ? monthParam : today.slice(0, 7);

  const config = await getCanchaConfig();
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const numDays = daysInMonth(year, monthIndex);

  const dates: string[] = [];
  for (let d = 1; d <= numDays; d++) {
    dates.push(`${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`);
  }

  const blockingBookings = await prisma.booking.findMany({
    where: {
      date: { in: dates },
      status: { not: "CANCELADO" },
      OR: [
        { paymentStatus: "APROBADO" },
        {
          paymentStatus: "PENDIENTE",
          createdAt: { gt: new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000) },
        },
      ],
    },
    select: { date: true, startTime: true },
  });
  const blocked = new Set(blockingBookings.map((b) => `${b.date}|${b.startTime}`));

  const allSlots = generateDaySlots(config);
  const currentTime = nowHHMM();

  const days: Record<string, string[]> = {};
  for (const date of dates) {
    if (date < today || isClosedWeekday(config, date)) {
      days[date] = [];
      continue;
    }
    days[date] = allSlots
      .filter((s) => date > today || s.startTime > currentTime)
      .filter((s) => !blocked.has(`${date}|${s.startTime}`))
      .map((s) => s.startTime);
  }

  return NextResponse.json({
    month,
    today,
    config: {
      courtName: config.courtName,
      pricePerSlot: config.pricePerSlot,
      depositAmount: config.depositAmount,
      slotDurationMin: config.slotDurationMin,
    },
    days,
  });
}
