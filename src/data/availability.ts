export type AvailabilityStatus = "available_now" | "available_today" | "next_available" | "limited" | "unavailable";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TimeBlock = {
  startTime: string;
  endTime: string;
};

export type BlockedSlot = TimeBlock & {
  id: string;
  specialistId: string;
  date: string;
  reason?: string;
};

export type AvailabilityProfile = {
  specialistId: string;
  instantAvailable: boolean;
  emergencyAvailable: boolean;
  minNoticeMinutes: number;
  slotDurationMinutes: number;
  workingHoursByWeekday: Record<Weekday, TimeBlock[]>;
  blockedSlots: BlockedSlot[];
  serviceDurations: Record<string, number>;
  communeCoverage: string[];
};

const weekdayHours = {
  weekday: [
    { startTime: "09:00", endTime: "13:00" },
    { startTime: "15:00", endTime: "18:30" },
  ],
  extended: [
    { startTime: "08:30", endTime: "13:30" },
    { startTime: "15:00", endTime: "20:00" },
  ],
  short: [{ startTime: "10:00", endTime: "14:00" }],
  off: [],
};

export const availabilityProfiles: AvailabilityProfile[] = [
  {
    specialistId: "victor-araya",
    instantAvailable: true,
    emergencyAvailable: true,
    minNoticeMinutes: 90,
    slotDurationMinutes: 90,
    workingHoursByWeekday: {
      0: weekdayHours.short,
      1: weekdayHours.extended,
      2: weekdayHours.extended,
      3: weekdayHours.weekday,
      4: weekdayHours.extended,
      5: weekdayHours.weekday,
      6: weekdayHours.short,
    },
    blockedSlots: [
      { id: "block-victor-1", specialistId: "victor-araya", date: "2026-06-10", startTime: "10:00", endTime: "12:00", reason: "Mantención programada" },
    ],
    serviceDurations: {
      "Técnico HVAC": 120,
      "Mantención HVAC": 90,
      "Diagnóstico": 60,
    },
    communeCoverage: ["Providencia", "Las Condes", "Ñuñoa", "Vitacura", "Santiago"],
  },
  {
    specialistId: "camila-torres",
    instantAvailable: false,
    emergencyAvailable: true,
    minNoticeMinutes: 120,
    slotDurationMinutes: 60,
    workingHoursByWeekday: {
      0: weekdayHours.off,
      1: weekdayHours.weekday,
      2: weekdayHours.weekday,
      3: weekdayHours.extended,
      4: weekdayHours.weekday,
      5: weekdayHours.weekday,
      6: weekdayHours.short,
    },
    blockedSlots: [],
    serviceDurations: {
      Electricidad: 90,
      "Visita diagnóstico": 60,
    },
    communeCoverage: ["Las Condes", "Vitacura", "Lo Barnechea", "Providencia"],
  },
  {
    specialistId: "mauricio-rivas",
    instantAvailable: true,
    emergencyAvailable: false,
    minNoticeMinutes: 60,
    slotDurationMinutes: 75,
    workingHoursByWeekday: {
      0: weekdayHours.short,
      1: weekdayHours.weekday,
      2: weekdayHours.extended,
      3: weekdayHours.weekday,
      4: weekdayHours.extended,
      5: weekdayHours.weekday,
      6: weekdayHours.short,
    },
    blockedSlots: [],
    serviceDurations: {
      Gasfitería: 90,
      Calefont: 75,
    },
    communeCoverage: ["Ñuñoa", "Macul", "Santiago", "La Reina", "Providencia"],
  },
];

export function createDefaultAvailabilityProfile(specialistId: string, communeCoverage: string[] = []): AvailabilityProfile {
  return {
    specialistId,
    instantAvailable: false,
    emergencyAvailable: false,
    minNoticeMinutes: 180,
    slotDurationMinutes: 90,
    workingHoursByWeekday: {
      0: weekdayHours.off,
      1: weekdayHours.weekday,
      2: weekdayHours.weekday,
      3: weekdayHours.weekday,
      4: weekdayHours.weekday,
      5: weekdayHours.weekday,
      6: weekdayHours.short,
    },
    blockedSlots: [],
    serviceDurations: {},
    communeCoverage,
  };
}
