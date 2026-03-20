import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Trigger a celebration with haptic feedback and audio cue
 * This is used when users complete journal entries
 */
export async function triggerCelebration(type: "success" | "milestone" = "success") {
  if (Platform.OS === "web") return;

  try {
    // Haptic feedback
    if (type === "milestone") {
      // Longer celebration for milestones
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Standard success celebration
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (error) {
    console.log("Celebration trigger error:", error);
  }
}

/**
 * Generate confetti animation parameters
 * Returns an array of confetti pieces with random properties
 */
export function generateConfettiPieces(count: number = 30) {
  const pieces = [];
  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];

  for (let i = 0; i < count; i++) {
    pieces.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
    });
  }

  return pieces;
}

/**
 * Get celebration message based on completion type
 */
export function getCelebrationMessage(type: "morning" | "evening" | "reflection" | "freewrite"): string {
  const messages = {
    morning: [
      "Great start to your day! 🌅",
      "You're setting yourself up for success! ✨",
      "Beautiful intention for today! 💫",
      "Your morning practice is complete! 🙏",
    ],
    evening: [
      "Wonderful reflection on your day! 🌙",
      "You're building amazing habits! 💪",
      "Evening practice complete! 🌟",
      "Great work closing your day mindfully! 🌙",
    ],
    reflection: [
      "Insightful reflection! 🎯",
      "You're deepening your practice! 📖",
      "Weekly reflection complete! 🌈",
      "Beautiful insights this week! ✨",
    ],
    freewrite: [
      "Your thoughts matter! 📝",
      "Creative expression unlocked! 🎨",
      "Free writing complete! 💭",
      "You're expressing yourself beautifully! ✍️",
    ],
  };

  const typeMessages = messages[type];
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}
