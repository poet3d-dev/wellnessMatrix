import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function PrepWeekScreen() {
  const router = useRouter();
  const colors = useColors();

  const { data: userProfile } = trpc.user.me.useQuery();
  const { data: practices } = trpc.practices.list.useQuery();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      router.replace("/(tabs)");
    },
  });

  const hasWeek1Practice = practices?.some((p) => p.weekNum === 1);
  const visionPreview = userProfile?.visionText
    ? userProfile.visionText.slice(0, 80) + (userProfile.visionText.length > 80 ? "..." : "")
    : "";

  const handleBegin = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile.mutate({ onboardingComplete: true, currentWeek: 0 });
  };

  const handleChoosePractice = () => {
    router.push("/practice/choose?week=1");
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.muted }]}>Welcome</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Prep Week</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Get ready for your 8-week Wellness Matrix journey.
          </Text>
        </View>

        {/* Vision preview */}
        {visionPreview ? (
          <View style={[styles.visionCard, { backgroundColor: colors.blue + "20", borderColor: colors.blue }]}>
            <Text style={[styles.visionLabel, { color: colors.muted }]}>YOUR 4-WEEK VISION</Text>
            <Text style={[styles.visionText, { color: colors.foreground }]}>"{visionPreview}"</Text>
          </View>
        ) : null}

        {/* Checklist */}
        <View style={styles.checklist}>
          <Text style={[styles.checklistTitle, { color: colors.foreground }]}>Your prep checklist</Text>

          <View style={[styles.checkItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <View style={styles.checkContent}>
              <Text style={[styles.checkTitle, { color: colors.foreground }]}>Set your vision</Text>
              <Text style={[styles.checkDesc, { color: colors.muted }]}>Your 4-week intention is anchored</Text>
            </View>
          </View>

          <Pressable
            onPress={handleChoosePractice}
            style={({ pressed }) => [
              styles.checkItem,
              {
                backgroundColor: colors.surface,
                borderColor: hasWeek1Practice ? colors.success : colors.primary,
                borderWidth: hasWeek1Practice ? 1 : 2,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View
              style={[
                styles.checkCircle,
                { backgroundColor: hasWeek1Practice ? colors.success : colors.border },
              ]}
            >
              <Text style={styles.checkMark}>{hasWeek1Practice ? "✓" : "○"}</Text>
            </View>
            <View style={styles.checkContent}>
              <Text style={[styles.checkTitle, { color: colors.foreground }]}>
                Choose Week 1 practice
              </Text>
              <Text style={[styles.checkDesc, { color: colors.muted }]}>
                {hasWeek1Practice ? "Blue practice set!" : "Tap to choose your Blue List practice →"}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* What to expect */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>What to expect</Text>
          <View style={styles.infoItems}>
            {[
              "📓 Morning journal (before 12pm)",
              "🌙 Evening journal (after 6pm)",
              "✍️ Free write (anytime)",
              "🎯 Weekly practice check-in",
              "📊 Sunday reflections",
            ].map((item, i) => (
              <Text key={i} style={[styles.infoItem, { color: colors.muted }]}>{item}</Text>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleBegin}
          disabled={updateProfile.isPending}
          style={({ pressed }) => [
            styles.beginButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            updateProfile.isPending && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.beginButtonText}>
            {updateProfile.isPending ? "Starting..." : "Begin My Journey →"}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 48,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  visionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  visionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  visionText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  checklist: {
    marginBottom: 24,
    gap: 12,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  checkContent: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  checkDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoItems: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  beginButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  beginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
