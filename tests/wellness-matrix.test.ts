import { describe, it, expect } from "vitest";
import {
  WEEK_COLOR_MAP,
  WEEK_NAMES,
  WEEK_PRACTICE_IDEAS,
  REFLECTION_QUESTIONS,
} from "../shared/types";

describe("Wellness Matrix shared types", () => {
  it("should have color mappings for all 4 weeks", () => {
    expect(WEEK_COLOR_MAP[1]).toBe("blue");
    expect(WEEK_COLOR_MAP[2]).toBe("yellow");
    expect(WEEK_COLOR_MAP[3]).toBe("green");
    expect(WEEK_COLOR_MAP[4]).toBe("red");
  });

  it("should have week names for all 4 colors", () => {
    expect(WEEK_NAMES.blue).toContain("Serotonin");
    expect(WEEK_NAMES.yellow).toContain("Endorphins");
    expect(WEEK_NAMES.green).toContain("Dopamine");
    expect(WEEK_NAMES.red).toContain("Oxytocin");
  });

  it("should have practice ideas for all 4 colors", () => {
    expect(WEEK_PRACTICE_IDEAS.blue.length).toBeGreaterThanOrEqual(3);
    expect(WEEK_PRACTICE_IDEAS.yellow.length).toBeGreaterThanOrEqual(3);
    expect(WEEK_PRACTICE_IDEAS.green.length).toBeGreaterThanOrEqual(3);
    expect(WEEK_PRACTICE_IDEAS.red.length).toBeGreaterThanOrEqual(3);
  });

  it("should have 6 reflection questions for each of the 8 weeks", () => {
    for (let w = 1; w <= 8; w++) {
      expect(REFLECTION_QUESTIONS[w]).toBeDefined();
      expect(REFLECTION_QUESTIONS[w].length).toBe(6);
    }
  });

  it("should have non-empty reflection questions", () => {
    for (let w = 1; w <= 8; w++) {
      for (const q of REFLECTION_QUESTIONS[w]) {
        expect(q.length).toBeGreaterThan(10);
      }
    }
  });
});

describe("Weekly setup config", () => {
  it("should have neurotransmitter-based week titles", async () => {
    const { getWeeklySetupConfig } = await import("../lib/weekly-setup");
    expect(getWeeklySetupConfig(1).title).toContain("Serotonin");
    expect(getWeeklySetupConfig(2).title).toContain("Endorphins");
    expect(getWeeklySetupConfig(3).title).toContain("Dopamine");
    expect(getWeeklySetupConfig(4).title).toContain("Oxytocin");
  });
});

describe("Timing logic", () => {
  it("should produce a valid date string for today", async () => {
    const { getTodayDateString } = await import("../lib/timing");
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

   it("should return journey day 1 when no start date", async () => {
    const { getJourneyDay } = await import("../lib/timing");
    expect(getJourneyDay(null)).toBe(1);
  });

  it("should return a small journey progress when no start date", async () => {
    const { getJourneyProgress } = await import("../lib/timing");
    // No start date → day 1 → progress = round(1/56*100) = 2
    expect(getJourneyProgress(null)).toBe(2);
  });;

  it("should return journey day 1 when start date is today", async () => {
    const { getJourneyDay, getTodayDateString } = await import("../lib/timing");
    const today = getTodayDateString();
    expect(getJourneyDay(today)).toBe(1);
  });

  it("should cap journey progress at 100", async () => {
    const { getJourneyProgress } = await import("../lib/timing");
    // A date far in the past
    expect(getJourneyProgress("2020-01-01")).toBe(100);
  });
});
