/**
 * Neurotransmitter unlock detection logic
 * Determines when a user has completed their first week of each neurotransmitter
 */

export interface UnlockStatus {
  week: number;
  neurotransmitterColor: string;
  isUnlocked: boolean;
  daysCompleted: number;
}

/**
 * Check if a week should trigger an unlock animation
 * A week is "unlocked" when the user has completed 7 days (all days of the week)
 */
export function checkWeekUnlock(
  weekNum: number,
  weekEntries: Array<{ morningCompleted: boolean; eveningCompleted: boolean }>
): boolean {
  if (weekNum < 1 || weekNum > 8) return false;

  // Count days where either morning or evening was completed
  const completedDays = weekEntries.filter(
    (e) => e.morningCompleted || e.eveningCompleted
  ).length;

  // Unlock when all 7 days are completed
  return completedDays >= 7;
}

/**
 * Get the unlock status for a specific week
 */
export function getWeekUnlockStatus(
  weekNum: number,
  weekEntries: Array<{ morningCompleted: boolean; eveningCompleted: boolean }>,
  weekColor: string
): UnlockStatus {
  const completedDays = weekEntries.filter(
    (e) => e.morningCompleted || e.eveningCompleted
  ).length;

  return {
    week: weekNum,
    neurotransmitterColor: weekColor,
    isUnlocked: completedDays >= 7,
    daysCompleted: completedDays,
  };
}

/**
 * Get all unlock statuses for weeks 1-8
 */
export function getAllUnlockStatuses(
  weeklyEntries: Record<number, Array<{ morningCompleted: boolean; eveningCompleted: boolean }>>,
  weekColorMap: Record<number, string>
): UnlockStatus[] {
  return Array.from({ length: 8 }, (_, i) => {
    const weekNum = i + 1;
    const entries = weeklyEntries[weekNum] ?? [];
    const color = weekColorMap[weekNum] ?? "blue";
    return getWeekUnlockStatus(weekNum, entries, color);
  });
}

/**
 * Check if this is the first time a week has been unlocked
 * (used to trigger the unlock animation only once)
 */
export function isFirstTimeUnlock(
  currentUnlocked: boolean,
  previousUnlocked: boolean
): boolean {
  return currentUnlocked && !previousUnlocked;
}
