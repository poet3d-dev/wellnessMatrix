import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { WEEK_COLOR_MAP, WEEK_NAMES } from "@/shared/types";
import { getJourneyDay, getJourneyProgress } from "@/lib/timing";

const QUADRANT_COLORS: Record<string, string> = {
  blue: "#A8C4D8",
  yellow: "#E8D5A3",
  green: "#B8D5A3",
  red: "#F4C2C2",
};

export default function ProgressTab() {
  const router = useRouter();
  const colors = useColors();

  const { data: userProfile } = trpc.user.me.useQuery();
  const { data: entries } = trpc.journal.listEntries.useQuery();
  const { data: reflections } = trpc.reflections.list.useQuery();
  const { data: practices } = trpc.practices.list.useQuery();

  const startDate = userProfile?.journeyStartDate
    ? String(userProfile.journeyStartDate)
    : null;
  const currentWeek = userProfile?.currentWeek ?? 0;
  const journeyDay = getJourneyDay(startDate);
  const journeyProgress = getJourneyProgress(startDate);

  const totalEntries = entries?.length ?? 0;
  const morningCount = entries?.filter((e) => e.morningCompleted).length ?? 0;
  const eveningCount = entries?.filter((e) => e.eveningCompleted).length ?? 0;
  const practiceYes = entries?.filter((e) => e.practiceCompleted === "yes").length ?? 0;
  const practicePartly = entries?.filter((e) => e.practiceCompleted === "partly").length ?? 0;

  const reflectionCount = reflections?.length ?? 0;

  const weeks = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Your 8-week journey</Text>
        </View>

        {/* Journey progress */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Journey Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{journeyDay}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Day</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{currentWeek}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{journeyProgress}%</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Complete</Text>
            </View>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${journeyProgress}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.muted }]}>
            {journeyProgress}% of 8-week journey complete
          </Text>
        </View>

        {/* Journal stats */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Journal Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: "#FFF8F0", borderColor: "#E8C87A" }]}>
              <Text style={styles.statBoxValue}>{morningCount}</Text>
              <Text style={styles.statBoxLabel}>☀️ Morning{"\n"}journals</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#F0F4FF", borderColor: "#8AA8D8" }]}>
              <Text style={styles.statBoxValue}>{eveningCount}</Text>
              <Text style={styles.statBoxLabel}>🌙 Evening{"\n"}journals</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" }]}>
              <Text style={styles.statBoxValue}>{practiceYes + practicePartly}</Text>
              <Text style={styles.statBoxLabel}>🎯 Practice{"\n"}days</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#F5F0FF", borderColor: "#B8A8D8" }]}>
              <Text style={styles.statBoxValue}>{reflectionCount}</Text>
              <Text style={styles.statBoxLabel}>📊 Weekly{"\n"}reflections</Text>
            </View>
          </View>
        </View>

        {/* Week-by-week */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Week by Week</Text>
          {weeks.map((w) => {
            const weekColor = WEEK_COLOR_MAP[w] ?? "blue";
            const accent = QUADRANT_COLORS[weekColor];
            const practice = practices?.find((p) => p.weekNum === w);
            const weekEntries = entries?.filter((e) => e.weekNum === w) ?? [];
            const weekReflection = reflections?.find((r: { weekNum: number }) => r.weekNum === w);
            const isCompleted = w < currentWeek;
            const isCurrent = w === currentWeek;
            const isLocked = w > currentWeek;

            return (
              <View
                key={w}
                style={[
                  styles.weekRow,
                  {
                    backgroundColor: isCurrent ? accent + "20" : colors.background,
                    borderColor: isCurrent ? accent : colors.border,
                    borderWidth: isCurrent ? 1.5 : 1,
                    opacity: isLocked ? 0.4 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.weekBadge,
                    { backgroundColor: isCompleted ? colors.success : isCurrent ? accent : colors.border },
                  ]}
                >
                  <Text style={styles.weekBadgeText}>
                    {isCompleted ? "✓" : `W${w}`}
                  </Text>
                </View>
                <View style={styles.weekInfo}>
                  <Text style={[styles.weekName, { color: colors.foreground }]}>
                    {WEEK_NAMES[weekColor]}
                  </Text>
                  {practice ? (
                    <Text style={[styles.weekPractice, { color: colors.muted }]} numberOfLines={1}>
                      "{practice.practiceText}"
                    </Text>
                  ) : (
                    <Text style={[styles.weekPractice, { color: colors.muted }]}>
                      {isLocked ? "Not started yet" : "No practice set"}
                    </Text>
                  )}
                </View>
                <View style={styles.weekStats}>
                  <Text style={[styles.weekStatText, { color: colors.muted }]}>
                    {weekEntries.length}d
                  </Text>
                  {weekReflection && (
                    <Text style={[styles.weekReflectionDot, { color: colors.success }]}>●</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "47%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statBoxValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
  },
  statBoxLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    lineHeight: 16,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  weekBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  weekBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  weekInfo: {
    flex: 1,
  },
  weekName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  weekPractice: {
    fontSize: 12,
    lineHeight: 16,
  },
  weekStats: {
    alignItems: "flex-end",
    gap: 2,
  },
  weekStatText: {
    fontSize: 12,
    fontWeight: "600",
  },
  weekReflectionDot: {
    fontSize: 10,
  },
});
