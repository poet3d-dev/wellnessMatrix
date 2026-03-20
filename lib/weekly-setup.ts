

export type QuadrantColor = "blue" | "yellow" | "green" | "red";

export interface WeeklySetupConfig {
  week: number;
  availableQuadrants: QuadrantColor[];
  mandatoryQuadrant: QuadrantColor;
  optionalQuadrants: QuadrantColor[];
  title: string;
  description: string;
}

/**
 * Get the weekly setup configuration for a given week.
 * Weeks 1-4 have progressive quadrant reveals.
 * Week 5+ allows any quadrant selection.
 */
export function getWeeklySetupConfig(week: number): WeeklySetupConfig {
  if (week === 1) {
    return {
      week: 1,
      availableQuadrants: ["blue"],
      mandatoryQuadrant: "blue",
      optionalQuadrants: [],
      title: "Week 1: Connection & Calm",
      description:
        "Start your journey with practices focused on inner peace and grounding.",
    };
  }

  if (week === 2) {
    return {
      week: 2,
      availableQuadrants: ["yellow", "blue"],
      mandatoryQuadrant: "yellow",
      optionalQuadrants: ["blue"],
      title: "Week 2: Energy & Joy",
      description:
        "Build on your foundation with energy and joy practices. Blue practices remain optional.",
    };
  }

  if (week === 3) {
    return {
      week: 3,
      availableQuadrants: ["green", "yellow", "blue"],
      mandatoryQuadrant: "green",
      optionalQuadrants: ["yellow", "blue"],
      title: "Week 3: Growth & Nature",
      description:
        "Expand your practice with growth and nature. Previous practices remain optional.",
    };
  }

  if (week === 4) {
    return {
      week: 4,
      availableQuadrants: ["red", "green", "yellow", "blue"],
      mandatoryQuadrant: "red",
      optionalQuadrants: ["green", "yellow", "blue"],
      title: "Week 4: Focus & Achievement",
      description:
        "Complete the matrix with focus and achievement. All quadrants are now available.",
    };
  }

  // Week 5+ - flexible selection
  return {
    week,
    availableQuadrants: ["blue", "yellow", "green", "red"],
    mandatoryQuadrant: "blue", // Placeholder - user will choose
    optionalQuadrants: ["yellow", "green", "red"],
    title: "Choose Your Practice",
    description:
      "Select at least one quadrant for this week. You can choose multiple practices.",
  };
}

/**
 * Get the color for a quadrant
 */
export function getQuadrantColor(quadrant: QuadrantColor): string {
  const colorMap: Record<QuadrantColor, string> = {
    blue: "#A8C4D8",
    yellow: "#E8D5A3",
    green: "#B8D5A3",
    red: "#F4C2C2",
  };
  return colorMap[quadrant];
}

/**
 * Get the emoji for a quadrant
 */
export function getQuadrantEmoji(quadrant: QuadrantColor): string {
  const emojiMap: Record<QuadrantColor, string> = {
    blue: "🧘",
    yellow: "⚡",
    green: "🌱",
    red: "🎯",
  };
  return emojiMap[quadrant];
}

/**
 * Get the label for a quadrant
 */
export function getQuadrantLabel(quadrant: QuadrantColor): string {
  const labelMap: Record<QuadrantColor, string> = {
    blue: "Connection & Calm",
    yellow: "Energy & Joy",
    green: "Growth & Nature",
    red: "Focus & Achievement",
  };
  return labelMap[quadrant];
}

/**
 * Calculate weekly performance feedback based on completion rate
 */
export function getWeeklyFeedback(daysCompleted: number): {
  level: "excellent" | "success" | "effort" | "reconnect";
  message: string;
  emoji: string;
} {
  if (daysCompleted >= 6) {
    return {
      level: "excellent",
      message: "Excellent Commitment! 🌟",
      emoji: "🌟",
    };
  }

  if (daysCompleted === 5) {
    return {
      level: "success",
      message: "Success! ✓",
      emoji: "✓",
    };
  }

  if (daysCompleted >= 3) {
    return {
      level: "effort",
      message: "Making an Effort 💪",
      emoji: "💪",
    };
  }

  return {
    level: "reconnect",
    message: "Check your overall goal for the 28 days and reconnect with what is meaningful.",
    emoji: "🔄",
  };
}
