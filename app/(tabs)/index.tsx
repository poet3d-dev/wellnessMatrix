import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { NeurotransmitterCard } from "@/components/neurotransmitter-card";
import { NeurotransmitterUnlockModal } from "@/components/neurotransmitter-unlock-modal";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import {
  getGreeting,
  getTodayDateString,
  isMorningAvailable,
  isEveningAvailable,
  isSunday,
  getJourneyDay,
  getJourneyWeek,
  getWeekProgress,
  calculateStreak,
  getStreakMessage,
} from "@/lib/timing";
import { WEEK_COLOR_MAP, WEEK_NAMES } from "@/shared/types";
import { checkWeekUnlock } from "@/lib/unlock-detection";

const QUADRANT_COLORS: Record<string, string> = {
  blue: "#A8C4D8",
  yellow: "#E8D5A3",
  green: "#B8D5A3",
  red: "#F4C2C2",
};

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const today = getTodayDateString();

  const { data: userProfile, isLoading } = trpc.user.me.useQuery();
  const { data: practices } = trpc.practices.list.useQuery();
  const { data: todayEntry } = trpc.journal.getEntry.useQuery({ date: today });
  const { data: progress } = trpc.progress.get.useQuery();
  const { data: entries } = trpc.journal.listEntries.useQuery();

  const streak = calculateStreak(
    (entries ?? []).map((e) => ({
      entryDate: typeof e.entryDate === "string" ? e.entryDate : e.entryDate.toISOString().split("T")[0],
      morningCompleted: e.morningCompleted,
      eveningCompleted: e.eveningCompleted,
    }))
  );
  const streakMessage = getStreakMessage(streak);

  const [morningAvailable, setMorningAvailable] = useState(isMorningAvailable());
  const [eveningAvailable, setEveningAvailable] = useState(isEveningAvailable());
  const [sunday, setSunday] = useState(isSunday());
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedColor, setUnlockedColor] = useState<string | null>(null);
  const [shownUnlocks, setShownUnlocks] = useState<Set<number>>(new Set());

  // Refresh timing every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMorningAvailable(isMorningAvailable());
      setEveningAvailable(isEveningAvailable());
      setSunday(isSunday());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check for week unlocks (must be before loading check to maintain hook order)
  useEffect(() => {
    if (isLoading) return; // Guard the effect body instead of returning early
    if (!userProfile || !entries) return;
    
    const currentWeek = userProfile.currentWeek ?? 0;
    if (currentWeek <= 0 || shownUnlocks.has(currentWeek)) return;
    
    const weekColor = WEEK_COLOR_MAP[currentWeek] ?? "blue";
    const weekEntries = entries.filter((e) => e.weekNum === currentWeek);
    
    if (checkWeekUnlock(currentWeek, weekEntries.map((e) => ({
      morningCompleted: e.morningCompleted,
      eveningCompleted: e.eveningCompleted,
    })))) {
      setUnlockedColor(weekColor);
      setShowUnlockModal(true);
      setShownUnlocks((prev) => new Set([...prev, currentWeek]));
    }
  }, [isLoading, userProfile, entries, shownUnlocks]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const startDate = userProfile?.journeyStartDate
    ? String(userProfile.journeyStartDate)
    : null;
  const currentWeek = userProfile?.currentWeek ?? 0;
  const journeyDay = getJourneyDay(startDate);
  const weekNum = currentWeek > 0 ? currentWeek : 0;
  const weekProgress = getWeekProgress(startDate);
  const isPrepWeek = currentWeek === 0;

  // Get current week's practice
  const weekColor = WEEK_COLOR_MAP[weekNum] ?? "blue";
  const currentPractice = practices?.find((p) => p.weekNum === weekNum);
  const week1Practice = practices?.find((p) => p.weekNum === 1);

  // Check if Sunday reflection is available
  const reflectionAvailable = sunday && currentWeek > 0;

  // Check if practice chooser should be shown (Sunday, weeks 1-4 not yet set)
  const showPracticeChooser =
    sunday && currentWeek >= 1 && currentWeek <= 4 && !currentPractice;

  const visionPreview = userProfile?.visionText
    ? userProfile.visionText.slice(0, 80) +
      (userProfile.visionText.length > 80 ? "..." : "")
    : "";

  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const accentColor = QUADRANT_COLORS[weekColor] ?? colors.primary;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.muted }]}>{greeting},</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{firstName}</Text>
        </View>

        {/* Streak counter */}
        <View style={[styles.streakCard, { backgroundColor: "#FFE082", borderColor: "#FBC02D" }]}>
          <View style={styles.streakContent}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakText}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
          </View>
          <Text style={styles.streakMessage}>{streakMessage}</Text>
        </View>

        {/* Vision card */}
        {visionPreview ? (
          <View style={[styles.visionCard, { backgroundColor: accentColor + "30", borderColor: accentColor }]}>
            <Text style={[styles.visionLabel, { color: colors.muted }]}>YOUR 4-WEEK VISION</Text>
            <Text style={[styles.visionText, { color: colors.foreground }]}>"{visionPreview}"</Text>
          </View>
        ) : null}

        {/* Week progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>
              {isPrepWeek ? "Prep Week" : `Week ${weekNum} of 8`}
              {!isPrepWeek && ` · Day ${journeyDay}`}
            </Text>
            <Text style={[styles.progressPercent, { color: colors.muted }]}>
              {weekProgress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: accentColor, width: `${weekProgress}%` },
              ]}
            />
          </View>
        </View>

        {/* Today's practice */}
        {currentPractice ? (
          <View style={[styles.practiceCard, { backgroundColor: accentColor + "20", borderColor: accentColor }]}>
            <Text style={[styles.practiceWeekLabel, { color: colors.muted }]}>
              WEEK {weekNum} – {WEEK_NAMES[weekColor]}
            </Text>
            <Text style={[styles.practiceText, { color: colors.foreground }]}>
              "{currentPractice.practiceText}"
            </Text>
            {todayEntry?.practiceIntended && (
              <View style={[styles.practiceBadge, { backgroundColor: colors.success + "20" }]}>
                <Text style={[styles.practiceBadgeText, { color: colors.success }]}>
                  ✓ Intended for today
                </Text>
              </View>
            )}
          </View>
        ) : isPrepWeek && !week1Practice ? (
          <Pressable
            onPress={() => router.push("/practice/choose?week=1")}
            style={({ pressed }) => [
              styles.practiceCard,
              { backgroundColor: colors.primary + "15", borderColor: colors.primary, borderStyle: "dashed" },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.practiceWeekLabel, { color: colors.muted }]}>WEEK 1 PRACTICE</Text>
            <Text style={[styles.practiceText, { color: colors.primary }]}>
              Tap to choose your Week 1 practice →
            </Text>
          </Pressable>
        ) : null}

        {/* Neurotransmitter science card */}
        {!isPrepWeek && currentPractice && (
          <NeurotransmitterCard color={weekColor} showBenefits={false} />
        )}

        {/* Sunday practice chooser prompt */}
        {showPracticeChooser && (
          <Pressable
            onPress={() => router.push(`/practice/choose?week=${weekNum}`)}
            style={({ pressed }) => [
              styles.sundayCard,
              { backgroundColor: accentColor + "20", borderColor: accentColor },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.sundayTitle, { color: colors.foreground }]}>
              🎯 Choose Week {weekNum} Practice
            </Text>
            <Text style={[styles.sundayDesc, { color: colors.muted }]}>
              It's Sunday — time to set your {WEEK_NAMES[weekColor]} practice for this week.
            </Text>
          </Pressable>
        )}

        {/* Journal buttons */}
        <View style={styles.journalSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Journal</Text>

          <View style={styles.journalButtons}>
            {/* Morning */}
            <Pressable
              onPress={() => morningAvailable && router.push("/journal/morning")}
              style={({ pressed }) => [
                styles.journalButton,
                {
                  backgroundColor: morningAvailable
                    ? "#FFF8F0"
                    : colors.surface,
                  borderColor: morningAvailable ? "#E8C87A" : colors.border,
                  opacity: morningAvailable ? 1 : 0.5,
                },
                pressed && morningAvailable && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.journalButtonIcon}>☀️</Text>
              <Text style={[styles.journalButtonTitle, { color: colors.foreground }]}>Morning</Text>
              <Text style={[styles.journalButtonSub, { color: colors.muted }]}>
                {morningAvailable
                  ? todayEntry?.morningCompleted
                    ? "Done ✓"
                    : "Before 12pm"
                  : "Locked after 12pm"}
              </Text>
            </Pressable>

            {/* Evening */}
            <Pressable
              onPress={() => eveningAvailable && router.push("/journal/evening")}
              style={({ pressed }) => [
                styles.journalButton,
                {
                  backgroundColor: eveningAvailable ? "#F0F4FF" : colors.surface,
                  borderColor: eveningAvailable ? "#8AA8D8" : colors.border,
                  opacity: eveningAvailable ? 1 : 0.5,
                },
                pressed && eveningAvailable && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.journalButtonIcon}>🌙</Text>
              <Text style={[styles.journalButtonTitle, { color: colors.foreground }]}>Evening</Text>
              <Text style={[styles.journalButtonSub, { color: colors.muted }]}>
                {eveningAvailable
                  ? todayEntry?.eveningCompleted
                    ? "Done ✓"
                    : "After 6pm"
                  : "Available after 6pm"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.journalButtonsRow}>
            {/* Free Write */}
            <Pressable
              onPress={() => router.push("/journal/free-write")}
              style={({ pressed }) => [
                styles.journalButtonWide,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.journalButtonIcon}>✍️</Text>
              <Text style={[styles.journalButtonTitle, { color: colors.foreground }]}>Free Write</Text>
              <Text style={[styles.journalButtonSub, { color: colors.muted }]}>Always available</Text>
            </Pressable>

            {/* Reflection */}
            <Pressable
              onPress={() => reflectionAvailable && router.push({ pathname: "/reflection/week", params: { week: weekNum } })}
              style={({ pressed }) => [
                styles.journalButtonWide,
                {
                  backgroundColor: reflectionAvailable ? "#F5F0FF" : colors.surface,
                  borderColor: reflectionAvailable ? "#B8A8D8" : colors.border,
                  opacity: reflectionAvailable ? 1 : 0.5,
                },
                pressed && reflectionAvailable && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.journalButtonIcon}>📊</Text>
              <Text style={[styles.journalButtonTitle, { color: colors.foreground }]}>Reflection</Text>
              <Text style={[styles.journalButtonSub, { color: colors.muted }]}>
                {reflectionAvailable ? "Sunday available" : "Sundays only"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Timing hint */}
        <View style={[styles.timingHint, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.timingHintText, { color: colors.muted }]}>
            {!morningAvailable && !eveningAvailable
              ? "⏰ Morning journal available before 12pm · Evening journal after 6pm"
              : morningAvailable
              ? "⏰ Morning journal available now until 12pm"
              : "⏰ Evening journal available now"}
          </Text>
        </View>
      </ScrollView>

      {/* Neurotransmitter Unlock Modal */}
      {unlockedColor && (
        <NeurotransmitterUnlockModal
          visible={showUnlockModal}
          neurotransmitterColor={unlockedColor}
          onClose={() => setShowUnlockModal(false)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
  },
  visionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  visionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  visionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  practiceCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  practiceWeekLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  practiceText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  practiceBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  practiceBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sundayCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  sundayTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sundayDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  journalSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  journalButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  journalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  journalButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  journalButtonWide: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  journalButtonIcon: {
    fontSize: 24,
  },
  journalButtonTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  journalButtonSub: {
    fontSize: 11,
    textAlign: "center",
  },
  timingHint: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  timingHintText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  streakCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    gap: 8,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakText: {
    gap: 2,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F57C00",
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E65100",
  },
  streakMessage: {
    fontSize: 13,
    fontWeight: "500",
    color: "#E65100",
    fontStyle: "italic",
  },
});
