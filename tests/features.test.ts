import { describe, it, expect } from "vitest";
import { calculateStreak, getStreakMessage } from "../lib/timing";

// Helper to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

describe("Streak Calculation", () => {
  it("should return 0 streak for empty entries", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("should return 1 streak for single entry today", () => {
    const today = new Date();
    const dateStr = getLocalDateString(today);
    const entries = [
      {
        entryDate: dateStr,
        morningCompleted: true,
        eveningCompleted: false,
      },
    ];
    expect(calculateStreak(entries)).toBe(1);
  });

  it("should return 0 streak if entry is incomplete", () => {
    const today = new Date();
    const dateStr = getLocalDateString(today);
    const entries = [
      {
        entryDate: dateStr,
        morningCompleted: false,
        eveningCompleted: false,
      },
    ];
    expect(calculateStreak(entries)).toBe(0);
  });

  it("should calculate consecutive days correctly", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        entryDate: getLocalDateString(date),
        morningCompleted: true,
        eveningCompleted: false,
      });
    }

    expect(calculateStreak(entries)).toBe(5);
  });

  it("should break streak on missing day", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = [];
    // Day 0 (today)
    entries.push({
      entryDate: getLocalDateString(today),
      morningCompleted: true,
      eveningCompleted: false,
    });

    // Day 2 (skip day 1)
    const day2 = new Date(today);
    day2.setDate(day2.getDate() - 2);
    entries.push({
      entryDate: getLocalDateString(day2),
      morningCompleted: true,
      eveningCompleted: false,
    });

    expect(calculateStreak(entries)).toBe(1);
  });

  it("should count evening completion as valid", () => {
    const today = new Date();
    const dateStr = getLocalDateString(today);
    const entries = [
      {
        entryDate: dateStr,
        morningCompleted: false,
        eveningCompleted: true,
      },
    ];
    expect(calculateStreak(entries)).toBe(1);
  });
});

describe("Streak Messages", () => {
  it("should return start message for 0 streak", () => {
    expect(getStreakMessage(0)).toBe("Start your journey today!");
  });

  it("should return 1-day message", () => {
    expect(getStreakMessage(1)).toContain("Great start");
  });

  it("should return 3-day message with fire emoji", () => {
    expect(getStreakMessage(3)).toContain("3-day streak");
    expect(getStreakMessage(3)).toContain("🔥");
  });

  it("should return 7-day message with star emoji", () => {
    expect(getStreakMessage(7)).toContain("One week");
    expect(getStreakMessage(7)).toContain("🌟");
  });

  it("should return 30-day message with crown emoji", () => {
    expect(getStreakMessage(30)).toContain("One month");
    expect(getStreakMessage(30)).toContain("👑");
  });

  it("should return generic message for other streaks", () => {
    expect(getStreakMessage(5)).toContain("5-day streak");
    expect(getStreakMessage(15)).toContain("15-day streak");
  });
});
