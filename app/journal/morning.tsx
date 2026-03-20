import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { getTodayDateString } from "@/lib/timing";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

type Step = 0 | 1 | 2 | 3 | 4;

const MOOD_OPTIONS = [
  { emoji: "😴", label: "Tired" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙂", label: "Okay" },
  { emoji: "😊", label: "Good" },
  { emoji: "🤩", label: "Great" },
];

export default function MorningJournalScreen() {
  const router = useRouter();
  const colors = useColors();
  const today = getTodayDateString();

  const [step, setStep] = useState<Step>(0);
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [intention, setIntention] = useState("");
  const [practiceIntended, setPracticeIntended] = useState(false);

  const { data: practices } = trpc.practices.list.useQuery();
  const { data: userProfile } = trpc.user.me.useQuery();

  const utils = trpc.useUtils();
  const saveMorning = trpc.journal.saveMorning.useMutation({
    onSuccess: () => {
      utils.journal.getEntry.invalidate();
      utils.journal.listEntries.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(4);
    },
    onError: () => {
      Alert.alert("Error", "Could not save your journal. Please try again.");
    },
  });

  const currentWeek = userProfile?.currentWeek ?? 1;
  const currentPractice = practices?.find((p) => p.weekNum === currentWeek);

  const handleGratitudeChange = (index: number, value: string) => {
    const updated = [...gratitude];
    updated[index] = value;
    setGratitude(updated);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((prev) => Math.min(4, prev + 1) as Step);
  };

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((prev) => Math.max(0, prev - 1) as Step);
  };

  const handleSave = () => {
    const filledGratitude = gratitude.filter((g) => g.trim().length > 0);
    if (filledGratitude.length === 0) {
      Alert.alert("Almost there", "Please add at least one thing you're grateful for.");
      return;
    }
    saveMorning.mutate({
      date: today,
      weekNum: currentWeek,
      dayNum: 1,
      gratitude1: gratitude[0].trim(),
      gratitude2: gratitude[1].trim(),
      gratitude3: gratitude[2].trim(),
      focus: intention.trim(),
      practiceIntended,
      completed: true,
    });
  };

  const totalSteps = 4;
  const progressPct = (step / totalSteps) * 100;

  if (step === 4) {
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>☀️</Text>
          <Text style={[styles.completionTitle, { color: colors.foreground }]}>
            Morning journal complete!
          </Text>
          <Text style={[styles.completionSubtitle, { color: colors.muted }]}>
            You've set a beautiful intention for today.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.doneButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (step === 0 ? router.back() : handleBack())}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            {step === 0 ? "✕ Close" : "← Back"}
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>☀️ Morning Journal</Text>
        <Text style={[styles.stepIndicator, { color: colors.muted }]}>
          {step + 1}/{totalSteps}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: "#E8C87A", width: `${progressPct}%` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0: Mood */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              How are you feeling this morning?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              No judgment — just check in with yourself.
            </Text>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((mood, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    setMoodRating(i + 1);
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    styles.moodButton,
                    {
                      backgroundColor: moodRating === i + 1 ? "#FFF8F0" : colors.surface,
                      borderColor: moodRating === i + 1 ? "#E8C87A" : colors.border,
                      borderWidth: moodRating === i + 1 ? 2 : 1,
                    },
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: colors.muted }]}>{mood.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={handleNext}
              disabled={moodRating === null}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                moodRating === null && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* Step 1: Gratitude */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              What are you grateful for today?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              List up to 3 things — big or small.
            </Text>
            {[0, 1, 2].map((i) => (
              <TextInput
                key={i}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: gratitude[i].length > 0 ? "#E8C87A" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder={`Gratitude ${i + 1}...`}
                placeholderTextColor={colors.muted}
                value={gratitude[i]}
                onChangeText={(t) => handleGratitudeChange(i, t)}
                returnKeyType="next"
                maxLength={200}
              />
            ))}
            <Pressable
              onPress={handleNext}
              disabled={gratitude.filter((g) => g.trim()).length === 0}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                gratitude.filter((g) => g.trim()).length === 0 && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* Step 2: Intention */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              What is your intention for today?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              How do you want to show up today?
            </Text>
            <TextInput
              style={[
                styles.textInputMulti,
                {
                  backgroundColor: colors.surface,
                  borderColor: intention.length > 0 ? "#E8C87A" : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Today I intend to..."
              placeholderTextColor={colors.muted}
              value={intention}
              onChangeText={setIntention}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={[styles.charCount, { color: colors.muted }]}>
              {intention.length}/300
            </Text>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* Step 3: Practice */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Your practice for today
            </Text>
            {currentPractice ? (
              <View style={[styles.practiceCard, { backgroundColor: "#A8C4D830", borderColor: "#A8C4D8" }]}>
                <Text style={[styles.practiceLabel, { color: colors.muted }]}>THIS WEEK'S PRACTICE</Text>
                <Text style={[styles.practiceText, { color: colors.foreground }]}>
                  "{currentPractice.practiceText}"
                </Text>
              </View>
            ) : null}
            <Text style={[styles.questionLabel, { color: colors.foreground }]}>
              Do you intend to do your practice today?
            </Text>
            <View style={styles.practiceToggle}>
              <Pressable
                onPress={() => setPracticeIntended(true)}
                style={({ pressed }) => [
                  styles.toggleButton,
                  {
                    backgroundColor: practiceIntended ? "#E8F5E9" : colors.surface,
                    borderColor: practiceIntended ? "#A5D6A7" : colors.border,
                    borderWidth: practiceIntended ? 2 : 1,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.toggleEmoji}>✅</Text>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={() => setPracticeIntended(false)}
                style={({ pressed }) => [
                  styles.toggleButton,
                  {
                    backgroundColor: !practiceIntended ? "#FFF8F0" : colors.surface,
                    borderColor: !practiceIntended ? "#E8C87A" : colors.border,
                    borderWidth: !practiceIntended ? 2 : 1,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.toggleEmoji}>🔄</Text>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Maybe later</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={handleSave}
              disabled={saveMorning.isPending}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: "#E8C87A" },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                saveMorning.isPending && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.nextButtonText, { color: "#5A4A00" }]}>
                {saveMorning.isPending ? "Saving..." : "Complete Morning Journal ✓"}
              </Text>
            </Pressable>
          </View>
        )}
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
  headerTitle: { fontSize: 16, fontWeight: "700" },
  stepIndicator: { fontSize: 13, fontWeight: "600" },
  progressBar: { height: 4, marginHorizontal: 20, borderRadius: 2, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 2 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  stepContainer: { paddingTop: 24, gap: 16 },
  stepTitle: { fontSize: 24, fontWeight: "700", lineHeight: 32 },
  stepSubtitle: { fontSize: 15, lineHeight: 22, marginTop: -8 },
  moodRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  moodButton: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, fontWeight: "600" },
  textInput: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 15, lineHeight: 22 },
  textInputMulti: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 15, lineHeight: 22, minHeight: 120 },
  charCount: { textAlign: "right", fontSize: 11, marginTop: -8 },
  practiceCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  practiceLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 },
  practiceText: { fontSize: 15, lineHeight: 22, fontStyle: "italic" },
  questionLabel: { fontSize: 16, fontWeight: "600" },
  practiceToggle: { flexDirection: "row", gap: 12 },
  toggleButton: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  toggleEmoji: { fontSize: 24 },
  toggleLabel: { fontSize: 13, fontWeight: "600" },
  nextButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  nextButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  completionContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, gap: 16 },
  completionEmoji: { fontSize: 64, marginBottom: 8 },
  completionTitle: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  completionSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  doneButton: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, marginTop: 8 },
  doneButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
