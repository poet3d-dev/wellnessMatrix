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
import { WEEK_COLOR_MAP, WEEK_NAMES, REFLECTION_QUESTIONS } from "@/shared/types";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const QUADRANT_COLORS: Record<string, string> = {
  blue: "#A8C4D8",
  yellow: "#E8D5A3",
  green: "#B8D5A3",
  red: "#F4C2C2",
};

export default function WeekReflectionScreen() {
  const router = useRouter();
  const { week } = useLocalSearchParams<{ week: string }>();
  const weekNum = parseInt(week ?? "1", 10);
  const colors = useColors();

  const weekColor = WEEK_COLOR_MAP[weekNum] ?? "blue";
  const accentColor = QUADRANT_COLORS[weekColor];
  const questions = REFLECTION_QUESTIONS[weekNum] ?? REFLECTION_QUESTIONS[1];

  const [answers, setAnswers] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const utils = trpc.useUtils();
  const saveReflection = trpc.reflections.save.useMutation({
    onSuccess: () => {
      utils.reflections.list.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCompleted(true);
    },
    onError: () => {
      Alert.alert("Error", "Could not save your reflection. Please try again.");
    },
  });

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSave = () => {
    const filledAnswers = answers.filter((a) => a.trim().length > 0);
    if (filledAnswers.length === 0) {
      Alert.alert("Almost there", "Please answer at least one question.");
      return;
    }
    saveReflection.mutate({
      weekNum,
      answer1: answers[0].trim(),
      answer2: answers[1].trim(),
      answer3: answers[2].trim(),
      answer4: answers[3].trim(),
      answer5: answers[4].trim(),
      answer6: answers[5].trim(),
      completed: true,
    });
  };

  if (completed) {
    const isWeek4 = weekNum === 4;
    const isWeek8 = weekNum === 8;
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>{isWeek8 ? "🎉" : isWeek4 ? "🎁" : "📊"}</Text>
          <Text style={[styles.completionTitle, { color: colors.foreground }]}>
            {isWeek8
              ? "Journey Complete!"
              : isWeek4
              ? "Halfway Milestone!"
              : `Week ${weekNum} Reflection Complete`}
          </Text>
          <Text style={[styles.completionSubtitle, { color: colors.muted }]}>
            {isWeek8
              ? "You've completed your 8-week Wellness Matrix journey. What an achievement!"
              : isWeek4
              ? "You've completed 4 weeks! Your next 4 weeks begin with a fresh set of practices."
              : "Great reflection. See you next Sunday for Week " + (weekNum + 1) + "."}
          </Text>
          {isWeek8 && (
            <Pressable
              onPress={() => router.push("/milestone/export")}
              style={({ pressed }) => [
                styles.milestoneButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.milestoneButtonText}>Download My Journey PDF →</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.doneButton,
              { borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.doneButtonText, { color: colors.foreground }]}>Back to Home</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const progressPct = (step / questions.length) * 100;

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.backText, { color: accentColor }]}>
            {step === 0 ? "✕ Close" : "← Back"}
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Week {weekNum} Reflection
        </Text>
        <Text style={[styles.stepIndicator, { color: colors.muted }]}>
          {step + 1}/{questions.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: accentColor, width: `${progressPct}%` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepContainer}>
          <View style={[styles.weekBadge, { backgroundColor: accentColor + "30", borderColor: accentColor }]}>
            <Text style={[styles.weekBadgeText, { color: colors.foreground }]}>
              {WEEK_NAMES[weekColor]}
            </Text>
          </View>

          <Text style={[styles.questionText, { color: colors.foreground }]}>
            {questions[step]}
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: answers[step].length > 0 ? accentColor : colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Write your reflection here..."
            placeholderTextColor={colors.muted}
            value={answers[step]}
            onChangeText={(t) => handleAnswerChange(step, t)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={[styles.charCount, { color: colors.muted }]}>
            {answers[step].length}/500
          </Text>

          {step < questions.length - 1 ? (
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStep((s) => s + 1);
              }}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: accentColor },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={[styles.nextButtonText, { color: colors.foreground }]}>
                Next Question →
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSave}
              disabled={saveReflection.isPending}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: accentColor },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                saveReflection.isPending && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.nextButtonText, { color: colors.foreground }]}>
                {saveReflection.isPending ? "Saving..." : "Complete Reflection ✓"}
              </Text>
            </Pressable>
          )}

          {/* Skip option */}
          <Pressable
            onPress={() => {
              if (step < questions.length - 1) {
                setStep((s) => s + 1);
              } else {
                handleSave();
              }
            }}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.skipText, { color: colors.muted }]}>Skip this question</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backText: { fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  stepIndicator: { fontSize: 13, fontWeight: "600" },
  progressBar: { height: 4, marginHorizontal: 20, borderRadius: 2, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 2 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  stepContainer: { paddingTop: 24, gap: 16 },
  weekBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  weekBadgeText: { fontSize: 13, fontWeight: "600" },
  questionText: { fontSize: 22, fontWeight: "700", lineHeight: 30 },
  textInput: { borderWidth: 1.5, borderRadius: 16, padding: 16, fontSize: 15, lineHeight: 24, minHeight: 160 },
  charCount: { textAlign: "right", fontSize: 11, marginTop: -8 },
  nextButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  nextButtonText: { fontSize: 17, fontWeight: "700" },
  skipText: { fontSize: 14, textAlign: "center" },
  completionContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, gap: 16 },
  completionEmoji: { fontSize: 64, marginBottom: 8 },
  completionTitle: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  completionSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  milestoneButton: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, marginTop: 8 },
  milestoneButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  doneButton: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 16, borderWidth: 1.5 },
  doneButtonText: { fontSize: 16, fontWeight: "600" },
});
