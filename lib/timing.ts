/**
 * Wellness Matrix timing utilities.
 * All timing is based on the user's local device time.
 */

export type TimeSlot = "morning" | "afternoon" | "evening" | "all-day";

/**
 * Returns the current time slot based on local device time.
 * - morning: before 12:00 (noon)
 * - afternoon: 12:00 - 18:00
 * - evening: after 18:00
 */
export function getCurrentTimeSlot(): TimeSlot {
  const now = new Date();
  const hour = now.getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/**
 * Whether the morning journal is available (before 12pm).
 */
export function isMorningAvailable(): boolean {
  const slot = getCurrentTimeSlot();
  return slot === "morning";
}

/**
 * Whether the evening journal is available (after 6pm).
 */
export function isEveningAvailable(): boolean {
  const slot = getCurrentTimeSlot();
  return slot === "evening";
}

/**
 * Whether it is Sunday (for weekly reflections and practice choosers).
 */
export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

/**
 * Get today's date as YYYY-MM-DD string in local time.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get a greeting based on the time of day.
 */
export function getGreeting(): string {
  const slot = getCurrentTimeSlot();
  if (slot === "morning") return "Good morning";
  if (slot === "afternoon") return "Good afternoon";
  return "Good evening";
}

/**
 * Calculate the current day number in the journey (1-56 for 8 weeks).
 * @param startDate ISO date string of journey start
 */
export function getJourneyDay(startDate: string | null | undefined): number {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(56, diffDays + 1));
}

/**
 * Calculate the current week number (0 = prep, 1-8 = journey weeks).
 * @param startDate ISO date string of journey start
 */
export function getJourneyWeek(startDate: string | null | undefined): number {
  const day = getJourneyDay(startDate);
  return Math.min(8, Math.ceil(day / 7));
}

/**
 * Get progress percentage for the current week (0-100).
 */
export function getWeekProgress(startDate: string | null | undefined): number {
  const day = getJourneyDay(startDate);
  const dayInWeek = ((day - 1) % 7) + 1;
  return Math.round((dayInWeek / 7) * 100);
}

/**
 * Get progress percentage for the full journey (0-100).
 */
export function getJourneyProgress(startDate: string | null | undefined): number {
  const day = getJourneyDay(startDate);
  return Math.round((day / 56) * 100);
}
