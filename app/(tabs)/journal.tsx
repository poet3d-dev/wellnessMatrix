import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { isMorningAvailable, isEveningAvailable, getTodayDateString } from "@/lib/timing";

export default function JournalTab() {
  const router = useRouter();
  const colors = useColors();
  const today = getTodayDateString();

  const { data: entries, isLoading } = trpc.journal.listEntries.useQuery();
  const { data: freeWrites } = trpc.freeWrite.list.useQuery();

  const morningAvailable = isMorningAvailable();
  const eveningAvailable = isEveningAvailable();

  const sortedEntries = [...(entries ?? [])].sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  );

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Journal</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Your daily reflections</Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <Pressable
            onPress={() => morningAvailable && router.push("/journal/morning")}
            style={({ pressed }) => [
              styles.quickButton,
              {
                backgroundColor: morningAvailable ? "#FFF8F0" : colors.surface,
                borderColor: morningAvailable ? "#E8C87A" : colors.border,
                opacity: morningAvailable ? 1 : 0.5,
              },
              pressed && morningAvailable && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.quickIcon}>☀️</Text>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Morning</Text>
          </Pressable>

          <Pressable
            onPress={() => eveningAvailable && router.push("/journal/evening")}
            style={({ pressed }) => [
              styles.quickButton,
              {
                backgroundColor: eveningAvailable ? "#F0F4FF" : colors.surface,
                borderColor: eveningAvailable ? "#8AA8D8" : colors.border,
                opacity: eveningAvailable ? 1 : 0.5,
              },
              pressed && eveningAvailable && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.quickIcon}>🌙</Text>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Evening</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/journal/free-write")}
            style={({ pressed }) => [
              styles.quickButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.quickIcon}>✍️</Text>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>Free Write</Text>
          </Pressable>
        </View>

        {/* Past entries */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Past Entries</Text>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Loading...</Text>
          </View>
        ) : sortedEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📓</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No entries yet</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Start your first journal entry above.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedEntries}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.entryCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryDate, { color: colors.foreground }]}>
                    {formatDate(item.entryDate)}
                  </Text>
                  <Text style={[styles.entryWeek, { color: colors.muted }]}>
                    Week {item.weekNum}
                  </Text>
                </View>
                <View style={styles.entryBadges}>
                  {item.morningCompleted && (
                    <View style={[styles.badge, { backgroundColor: "#FFF8F0", borderColor: "#E8C87A" }]}>
                      <Text style={styles.badgeText}>☀️ Morning</Text>
                    </View>
                  )}
                  {item.eveningCompleted && (
                    <View style={[styles.badge, { backgroundColor: "#F0F4FF", borderColor: "#8AA8D8" }]}>
                      <Text style={styles.badgeText}>🌙 Evening</Text>
                    </View>
                  )}
                  {item.practiceCompleted !== "pending" && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            item.practiceCompleted === "yes"
                              ? "#E8F5E9"
                              : item.practiceCompleted === "partly"
                              ? "#FFF8E1"
                              : "#FFEBEE",
                          borderColor:
                            item.practiceCompleted === "yes"
                              ? "#A5D6A7"
                              : item.practiceCompleted === "partly"
                              ? "#FFE082"
                              : "#EF9A9A",
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {item.practiceCompleted === "yes"
                          ? "✓ Practice done"
                          : item.practiceCompleted === "partly"
                          ? "~ Partly done"
                          : "✗ Not done"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  quickIcon: {
    fontSize: 22,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  entryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: "600",
  },
  entryWeek: {
    fontSize: 12,
  },
  entryBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
