/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Wellness Matrix shared types
export type WeekColor = "blue" | "yellow" | "green" | "red";
export type PracticeCompleted = "yes" | "partly" | "no" | "pending";
export type SubscriptionStatus = "none" | "active" | "cancelled";

export const WEEK_COLOR_MAP: Record<number, WeekColor> = {
  1: "blue",
  2: "yellow",
  3: "green",
  4: "red",
};

export const WEEK_NAMES: Record<WeekColor, string> = {
  blue: "Serotonin – Stability & Calm",
  yellow: "Endorphins – Relief & Joy",
  green: "Dopamine – Direction & Growth",
  red: "Oxytocin – Connection & Achievement",
};

export const WEEK_PRACTICE_IDEAS: Record<WeekColor, string[]> = {
  blue: [
    "3 mindful breaths (anytime)",
    "10min nature walk",
    "5min sunshine moment",
    "Help someone small",
    "Call a friend or family member",
    "5min mindful tea/coffee",
  ],
  yellow: [
    "Dance to one song",
    "10min creative activity",
    "Laugh at something funny",
    "Cook a meal you enjoy",
    "5min stretching",
    "Listen to uplifting music",
  ],
  green: [
    "Water a plant or tend garden",
    "Read 10 pages of a book",
    "Learn one new thing",
    "Spend time in nature",
    "Journal a growth moment",
    "Practice a new skill for 10min",
  ],
  red: [
    "Morning priority task first",
    "One thing off your to-do list",
    "5min planning session",
    "Complete a small challenge",
    "Declutter one space",
    "Set and achieve a micro-goal",
  ],
};

export const REFLECTION_QUESTIONS: Record<number, string[]> = {
  1: [
    "What did you learn about yourself this week?",
    "Which moments felt most aligned with your vision?",
    "What was your biggest challenge and how did you handle it?",
    "How did your Serotonin practice (Stability & Calm) feel?",
    "What would you do differently next week?",
    "What will keep this balanced going forward?",
  ],
  2: [
    "How did your energy and joy shift this week?",
    "What moments brought you the most happiness?",
    "How did your Endorphins practice (Relief & Joy) impact your days?",
    "What surprised you about yourself this week?",
    "What are you most proud of from this week?",
    "What will you carry forward into next week?",
  ],
  3: [
    "How have you grown this week?",
    "What new insight or skill did you develop?",
    "How did your Dopamine practice (Direction & Growth) feel?",
    "What connections did you notice between your habits and your vision?",
    "What challenged your growth and what did you learn from it?",
    "How will you build on this growth next week?",
  ],
  4: [
    "What did you achieve and focus on this week?",
    "How did your Oxytocin practice (Connection & Achievement) serve you?",
    "Looking back at your 4-week vision, how close are you?",
    "What habits feel most natural and sustainable now?",
    "What are you most grateful for from these 4 weeks?",
    "What will you commit to maintaining in the next 4 weeks?",
  ],
  5: [
    "What did you learn about yourself this week?",
    "Which moments felt most aligned with your vision?",
    "What was your biggest challenge and how did you handle it?",
    "How did your Serotonin practice feel in this second cycle?",
    "What would you do differently next week?",
    "What will keep this balanced going forward?",
  ],
  6: [
    "How did your energy and joy evolve this week?",
    "What moments brought you the most happiness?",
    "How has your Yellow practice deepened over time?",
    "What surprised you about yourself this week?",
    "What are you most proud of from this week?",
    "What will you carry forward into next week?",
  ],
  7: [
    "How have you continued to grow this week?",
    "What new insight or skill did you develop?",
    "How has your Green practice evolved?",
    "What connections did you notice between your habits and your vision?",
    "What challenged your growth and what did you learn from it?",
    "How will you build on this growth next week?",
  ],
  8: [
    "What have you achieved across these 8 weeks?",
    "How has your Red practice shaped your focus?",
    "Looking back at your original vision, how have you transformed?",
    "Which habits feel fully embedded in your life now?",
    "What are you most grateful for from this entire journey?",
    "How will you continue to nurture your Wellness Matrix going forward?",
  ],
};
