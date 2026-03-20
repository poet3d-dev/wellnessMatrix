import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { WEEK_COLOR_MAP, WEEK_NAMES } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function ExportScreen() {
  const router = useRouter();
  const colors = useColors();

  const { data: userProfile } = trpc.user.me.useQuery();
  const { data: entries } = trpc.journal.listEntries.useQuery();
  const { data: reflections } = trpc.reflections.list.useQuery();
  const { data: practices } = trpc.practices.list.useQuery();

  const totalEntries = entries?.length ?? 0;
  const morningCount = entries?.filter((e) => e.morningCompleted).length ?? 0;
  const eveningCount = entries?.filter((e) => e.eveningCompleted).length ?? 0;
  const practiceYes = entries?.filter((e) => e.practiceCompleted === "yes").length ?? 0;
  const reflectionCount = reflections?.length ?? 0;

  const handleShareSummary = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const lines = [
      "🌟 My Wellness Matrix Journey Summary",
      "",
      `📅 Journey: ${totalEntries} days journaled`,
      `☀️ Morning journals: ${morningCount}`,
      `🌙 Evening journals: ${eveningCount}`,
      `🎯 Practice days: ${practiceYes}`,
      `📊 Weekly reflections: ${reflectionCount}`,
      "",
      "Practices:",
      ...(practices ?? []).map((p) => {
        const color = WEEK_COLOR_MAP[p.weekNum] ?? "blue";
        return `  Week ${p.weekNum} (${WEEK_NAMES[color]}): "${p.practiceText}"`;
      }),
      "",
      userProfile?.visionText ? `🎯 My Vision: "${userProfile.visionText}"` : "",
      "",
      "Created with Wellness Matrix",
    ];

    const text = lines.filter(Boolean).join("\n");

    try {
      await Share.share({ message: text, title: "My Wellness Matrix Journey" });
    } catch {
      Alert.alert("Error", "Could not share your summary.");
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Journey Summary</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: "#A8C4D820", borderColor: "#A8C4D8" }]}>
          <Text style={styles.heroEmoji}>🌟</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Your Wellness Matrix Journey
          </Text>
          {userProfile?.visionText ? (
            <Text style={[styles.heroVision, { color: colors.muted }]}>
              "{userProfile.visionText}"
            </Text>
          ) : null}
        </View>

        {/* Stats */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Journey Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: "#FFF8F0", borderColor: "#E8C87A" }]}>
              <Text style={styles.statValue}>{totalEntries}</Text>
              <Text style={styles.statLabel}>Days Journaled</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#F0F4FF", borderColor: "#8AA8D8" }]}>
              <Text style={styles.statValue}>{morningCount}</Text>
              <Text style={styles.statLabel}>Morning Journals</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" }]}>
              <Text style={styles.statValue}>{practiceYes}</Text>
              <Text style={styles.statLabel}>Practice Days</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#F5F0FF", borderColor: "#B8A8D8" }]}>
              <Text style={styles.statValue}>{reflectionCount}</Text>
              <Text style={styles.statLabel}>Reflections</Text>
            </View>
          </View>
        </View>

        {/* Practices */}
        {(practices ?? []).length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>My Practices</Text>
            {(practices ?? []).map((p) => {
              const color = WEEK_COLOR_MAP[p.weekNum] ?? "blue";
              const weekName = WEEK_NAMES[color];
              return (
                <View key={p.id} style={[styles.practiceRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.practiceWeek, { color: colors.muted }]}>W{p.weekNum}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.practiceName, { color: colors.foreground }]}>{weekName}</Text>
                    <Text style={[styles.practiceText, { color: colors.muted }]}>"{p.practiceText}"</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Reflections */}
        {(reflections ?? []).length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Weekly Reflections</Text>
            {(reflections as Array<{ weekNum: number; answer1?: string | null }>).map((r) => (
              <View key={r.weekNum} style={[styles.reflectionRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.reflectionWeek, { color: colors.primary }]}>Week {r.weekNum}</Text>
                {r.answer1 ? (
                  <Text style={[styles.reflectionAnswer, { color: colors.foreground }]} numberOfLines={3}>
                    {r.answer1}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Share button */}
        <Pressable
          onPress={handleShareSummary}
          style={({ pressed }) => [
            styles.shareButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Text style={styles.shareButtonText}>📤 Share My Journey Summary</Text>
        </Pressable>

        <Text style={[styles.note, { color: colors.muted }]}>
          Share your journey as text. PDF export coming soon.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backText: { fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  heroVision: { fontSize: 14, textAlign: "center", fontStyle: "italic", lineHeight: 20 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    width: "47%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 26, fontWeight: "800", color: "#333" },
  statLabel: { fontSize: 12, textAlign: "center", color: "#666" },
  practiceRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
  },
  practiceWeek: { fontSize: 12, fontWeight: "700", width: 30, paddingTop: 2 },
  practiceName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  practiceText: { fontSize: 13, fontStyle: "italic", lineHeight: 18 },
  reflectionRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  reflectionWeek: { fontSize: 13, fontWeight: "700" },
  reflectionAnswer: { fontSize: 14, lineHeight: 20 },
  shareButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  shareButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  note: { fontSize: 12, textAlign: "center" },
});
