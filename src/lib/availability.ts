import { type AvailabilityProfile, type AvailabilityStatus, type BlockedSlot, type TimeBlock, type Weekday } from "@/data/availability";
import type { BookingRequest } from "@/lib/bookingStorage";

export type TimeSlot = {
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  available: boolean;
  reason?: string;
};

export type AvailabilitySummary = {
  status: AvailabilityStatus;
  label: string;
  detail: string;
  nextSlot?: TimeSlot;
};

export const timezone = "America/Santiago";

export const weekdayLabels: Record<Weekday, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const weekdayOrder: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export const statusLabels: Record<AvailabilityStatus, string> = {
  available_now: "Disponible ahora",
  available_today: "Disponible hoy",
  next_available: "Próximo horario",
  limited: "Disponibilidad limitada",
  unavailable: "Sin horarios visibles",
};

export function toDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function formatDisplayDate(dateKey: string, options: Intl.DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "short" }) {
  return new Intl.DateTimeFormat("es-CL", { timeZone: timezone, ...options }).format(dateFromKey(dateKey));
}

export function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
}

export function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function dateTimeFromKey(dateKey: string, time: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}

export function addMinutesToTime(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function getWeekDates(anchor = new Date()) {
  const date = new Date(anchor);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  date.setHours(12, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(date);
    next.setDate(date.getDate() + index);
    return toDateKey(next);
  });
}

export function overlaps(a: TimeBlock, b: TimeBlock) {
  return timeToMinutes(a.startTime) < timeToMinutes(b.endTime) && timeToMinutes(b.startTime) < timeToMinutes(a.endTime);
}

export function getSlotsForDate(profile: AvailabilityProfile, dateKey: string, bookings: BookingRequest[] = [], now = new Date()): TimeSlot[] {
  const date = dateFromKey(dateKey);
  const weekday = date.getDay() as Weekday;
  const blocks = profile.workingHoursByWeekday[weekday] ?? [];
  const minStart = new Date(now.getTime() + profile.minNoticeMinutes * 60 * 1000);
  const blocked = profile.blockedSlots.filter((slot) => slot.date === dateKey);
  const reserved = bookings.filter((booking) => booking.specialistId === profile.specialistId && booking.date === dateKey && booking.status !== "Cancelada");

  return blocks.flatMap((block) => {
    const slots: TimeSlot[] = [];
    let cursor = block.startTime;

    while (timeToMinutes(cursor) + profile.slotDurationMinutes <= timeToMinutes(block.endTime)) {
      const endTime = addMinutesToTime(cursor, profile.slotDurationMinutes);
      const slotBlock = { startTime: cursor, endTime };
      const startsAt = dateTimeFromKey(dateKey, cursor);
      const blockedByManual = blocked.some((blockedSlot) => overlaps(slotBlock, blockedSlot));
      const blockedByBooking = reserved.some((booking) => overlaps(slotBlock, booking));
      const tooSoon = startsAt < minStart;
      const available = !blockedByManual && !blockedByBooking && !tooSoon;
      slots.push({
        date: dateKey,
        startTime: cursor,
        endTime,
        label: formatTimeRange(cursor, endTime),
        available,
        reason: blockedByManual ? "Horario bloqueado" : blockedByBooking ? "Solicitud existente" : tooSoon ? "Fuera del aviso mínimo" : undefined,
      });
      cursor = endTime;
    }

    return slots;
  });
}

export function getAvailableSlotsForWeek(profile: AvailabilityProfile, bookings: BookingRequest[] = [], anchor = new Date()) {
  return getWeekDates(anchor).flatMap((dateKey) => getSlotsForDate(profile, dateKey, bookings, anchor).filter((slot) => slot.available));
}

export function getAvailabilitySummary(profile: AvailabilityProfile, bookings: BookingRequest[] = [], now = new Date()): AvailabilitySummary {
  const weekSlots = getAvailableSlotsForWeek(profile, bookings, now);
  const todayKey = toDateKey(now);
  const todaySlots = weekSlots.filter((slot) => slot.date === todayKey);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nowWindow = todaySlots.find((slot) => Math.abs(timeToMinutes(slot.startTime) - currentMinutes) <= Math.max(60, profile.minNoticeMinutes));
  const nextSlot = weekSlots[0];

  if (profile.instantAvailable && nowWindow) {
    return { status: "available_now", label: statusLabels.available_now, detail: `Siguiente bloque ${nowWindow.label}`, nextSlot: nowWindow };
  }

  if (todaySlots.length) {
    return { status: "available_today", label: statusLabels.available_today, detail: `Hoy ${todaySlots[0].label}`, nextSlot: todaySlots[0] };
  }

  if (nextSlot) {
    return {
      status: "next_available",
      label: statusLabels.next_available,
      detail: `${formatDisplayDate(nextSlot.date)} ${nextSlot.label}`,
      nextSlot,
    };
  }

  return {
    status: profile.emergencyAvailable ? "limited" : "unavailable",
    label: profile.emergencyAvailable ? statusLabels.limited : statusLabels.unavailable,
    detail: "Sin horarios visibles esta semana. Solicita contacto y revisaremos disponibilidad.",
  };
}

export function hasBlockingConflict(blockedSlots: BlockedSlot[], nextBlock: Pick<BlockedSlot, "date" | "startTime" | "endTime">) {
  return blockedSlots.some((slot) => slot.date === nextBlock.date && overlaps(slot, nextBlock));
}
