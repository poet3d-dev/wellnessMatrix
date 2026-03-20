import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { WEEK_COLOR_MAP, WEEK_NAMES, WEEK_PRACTICE_IDEAS } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const QUADRANT_COLORS: Record<string, string> = {
  blue: "#A8C4D8",
  yellow: "#E8D5A3",
  green: "#B8D5A3",
  red: "#F4C2C2",
};

const WEEK_EMOJIS: Record<string, string> = {
  blue: "🔵",
  yellow: "🟡",
  green: "🟢",
  red: "🔴",
};

const WEEK_SCIENCE: Record<string, string> = {
  blue: "Oxytocin – the bonding hormone. Connection and calm practices boost your sense of belonging.",
  yellow: "Dopamine – the reward hormone. Joy and energy practices lift your mood and motivation.",
  green: "Serotonin – the wellbeing hormone. Growth and nature practices build lasting contentment.",
  red: "Adrenaline & Endorphins – the achievement hormones. Focus practices build confidence and drive.",
};

export default function PracticeChooseScreen() {
  const router = useRouter();
  const colors = useColors();
  const { week } = useLocalSearchParams<{ week: string }>();
  const weekNum = parseInt(week ?? "1", 10);
  const weekColor = WEEK_COLOR_MAP[weekNum] ?? "blue";
  const accentColor = QUADRANT_COLORS[weekColor];
  const ideas = WEEK_PRACTICE_IDEAS[weekColor] ?? [];

  const [practiceText, setPracticeText] = useState("");
  const [saved, setSaved] = useState(false);

  const utils = trpc.useUtils();
  const savePractice = trpc.practices.save.useMutation({
    onSuccess: () => {
      setSaved(true);
      utils.practices.list.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: () => {
      Alert.alert("Error", "Could not save your practice. Please try again.");
    },
  });

  const handleSelectIdea = (idea: string) => {
    setPracticeText(idea);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    if (practiceText.trim().length < 3) {
      Alert.alert("Too short", "Please describe your practice in a few words.");
      return;
    }
    savePractice.mutate({
      weekNum,
      practiceText: practiceText.trim(),
      weekColor,
    });
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.eyebrow, { color: colors.muted }]}>WEEK {weekNum} PRACTICE</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Choose Your Practice
          </Text>
        </View>

        {/* Quadrant card */}
        <View style={[styles.quadrantCard, { backgroundColor: accentColor + "30", borderColor: accentColor }]}>
          <View style={styles.quadrantHeader}>
            <Text style={styles.quadrantEmoji}>{WEEK_EMOJIS[weekColor]}</Text>
            <View style={styles.quadrantInfo}>
              <Text style={[styles.quadrantName, { color: colors.foreground }]}>
                {WEEK_NAMES[weekColor]}
              </Text>
              <Text style={[styles.quadrantScience, { color: colors.muted }]}>
                {WEEK_SCIENCE[weekColor]}
              </Text>
            </View>
          </View>
        </View>

        {/* Ideas */}
        <View style={styles.ideasSection}>
          <Text style={[styles.ideasTitle, { color: colors.foreground }]}>Ideas to inspire you</Text>
          <View style={styles.ideasGrid}>
            {ideas.map((idea, i) => (
              <Pressable
                key={i}
                onPress={() => handleSelectIdea(idea)}
                style={({ pressed }) => [
                  styles.ideaChip,
                  {
                    backgroundColor:
                      practiceText === idea ? accentColor + "60" : colors.surface,
                    borderColor:
                      practiceText === idea ? accentColor : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.ideaText, { color: colors.foreground }]}>{idea}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Custom input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>
            My Week {weekNum} practice:
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: practiceText.length > 0 ? accentColor : colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Type your own practice or tap an idea above..."
            placeholderTextColor={colors.muted}
            value={practiceText}
            onChangeText={setPracticeText}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={[styles.charCount, { color: colors.muted }]}>
            {practiceText.length}/200
          </Text>
        </View>

        {/* Save button */}
        {saved ? (
          <View style={[styles.savedBanner, { backgroundColor: colors.success + "20", borderColor: colors.success }]}>
            <Text style={[styles.savedText, { color: colors.success }]}>
              ✓ Practice saved! It will show on your daily screen.
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={savePractice.isPending || practiceText.trim().length < 3}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: accentColor },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              (savePractice.isPending || practiceText.trim().length < 3) && { opacity: 0.5 },
            ]}
          >
            <Text style={[styles.saveButtonText, { color: colors.foreground }]}>
              {savePractice.isPending ? "Saving..." : "Save & Commit"}
            </Text>
          </Pressable>
        )}

        {/* Commitment note */}
        <View style={[styles.commitNote, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.commitNoteText, { color: colors.muted }]}>
            💪 Committing to one small practice each week is the foundation of lasting change. You've got this.
          </Text>
        </View>
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
    paddingTop: 20,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  quadrantCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  quadrantHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  quadrantEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  quadrantInfo: {
    flex: 1,
  },
  quadrantName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  quadrantScience: {
    fontSize: 13,
    lineHeight: 18,
  },
  ideasSection: {
    marginBottom: 24,
  },
  ideasTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  ideasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ideaChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  ideaText: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 90,
  },
  charCount: {
    textAlign: "right",
    fontSize: 11,
    marginTop: 4,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  savedBanner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "center",
  },
  savedText: {
    fontSize: 15,
    fontWeight: "600",
  },
  commitNote: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  commitNoteText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
