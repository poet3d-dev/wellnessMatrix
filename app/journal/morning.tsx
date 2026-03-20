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
import { Confetti } from "@/components/confetti";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { getTodayDateString } from "@/lib/timing";
import { triggerCelebration, getCelebrationMessage } from "@/lib/celebrations";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
  const [betterMoments, setBetterMoments] = useState(["", "", "", "", ""]);
  const [focus, setFocus] = useState("");
  const [important, setImportant] = useState("");
  const [practiceIntended, setPracticeIntended] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  const { data: practices } = trpc.practices.list.useQuery();
  const { data: userProfile } = trpc.user.me.useQuery();

  const utils = trpc.useUtils();
  const saveMorning = trpc.journal.saveMorning.useMutation({
    onSuccess: () => {
      utils.journal.getEntry.invalidate();
      utils.journal.listEntries.invalidate();
      triggerCelebration("success");
      setCelebrationMessage(getCelebrationMessage("morning"));
      setShowConfetti(true);
      setTimeout(() => setStep(6), 500);
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

  const handleBetterMomentsChange = (index: number, value: string) => {
    const updated = [...betterMoments];
    updated[index] = value;
    setBetterMoments(updated);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((prev) => Math.min(6, prev + 1) as Step);
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
    const filledMoments = betterMoments.filter((m) => m.trim().length > 0);
    if (filledMoments.length === 0) {
      Alert.alert("Almost there", "Please add at least one better moment you'd like to create.");
      return;
    }
    if (!important.trim()) {
      Alert.alert("Almost there", "Please share what's most important to you today.");
      return;
    }

    saveMorning.mutate({
      date: today,
      weekNum: currentWeek,
      dayNum: 1,
      gratitude1: gratitude[0].trim(),
      gratitude2: gratitude[1].trim(),
      gratitude3: gratitude[2].trim(),
      focus: focus.trim(),
      important: important.trim(),
      betterMoments: filledMoments.join(" | "),
      practiceIntended,
      completed: true,
    });
  };

  const totalSteps = 6;
  const progressPct = (step / totalSteps) * 100;

  if (step === 6) {
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]}>
        <Confetti isActive={showConfetti} />
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>☀️</Text>
          <Text style={[styles.completionTitle, { color: colors.foreground }]}>
            Morning journal complete!
          </Text>
          <Text style={[styles.completionSubtitle, { color: colors.muted }]}>
            {celebrationMessage}
          </Text>
          <Pressable
            onPress={() => {
              setShowConfetti(false);
              router.back();
            }}
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
      <Confetti isActive={false} />
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

        {/* Step 2: 5 Better Moments */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              5 Better Moments
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              What 5 moments would you like to create today? (At least 1 required)
            </Text>
            {[0, 1, 2, 3, 4].map((i) => (
              <TextInput
                key={i}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: betterMoments[i].length > 0 ? "#B8A8D8" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder={`Better moment ${i + 1}...`}
                placeholderTextColor={colors.muted}
                value={betterMoments[i]}
                onChangeText={(t) => handleBetterMomentsChange(i, t)}
                returnKeyType="next"
                maxLength={150}
              />
            ))}
            <Pressable
              onPress={handleNext}
              disabled={betterMoments.filter((m) => m.trim()).length === 0}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                betterMoments.filter((m) => m.trim()).length === 0 && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* Step 3: Most Important Thing */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              What's most important to you today?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              Your one priority. What matters most?
            </Text>
            <TextInput
              style={[
                styles.textAreaInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: important.length > 0 ? "#A5D6A7" : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="What's most important today?"
              placeholderTextColor={colors.muted}
              value={important}
              onChangeText={setImportant}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <Pressable
              onPress={handleNext}
              disabled={!important.trim()}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                !important.trim() && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* Step 4: Focus */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              What will you focus on?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              Your intention for today. (Optional)
            </Text>
            <TextInput
              style={[
                styles.textAreaInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: focus.length > 0 ? "#A8C4D8" : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Your intention for today..."
              placeholderTextColor={colors.muted}
              value={focus}
              onChangeText={setFocus}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
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

        {/* Step 5: Practice Intent */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Will you practice today?
            </Text>
            {currentPractice ? (
              <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
                This week's practice: "{currentPractice.practiceText}"
              </Text>
            ) : (
              <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
                Do you intend to practice your chosen practice today?
              </Text>
            )}
            <View style={styles.practiceChoices}>
              <Pressable
                onPress={() => {
                  setPracticeIntended(true);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  styles.practiceButton,
                  {
                    backgroundColor: practiceIntended ? "#B8D5A3" : colors.surface,
                    borderColor: practiceIntended ? "#7CB342" : colors.border,
                    borderWidth: practiceIntended ? 2 : 1,
                  },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Text style={styles.practiceEmoji}>✓</Text>
                <Text style={[styles.practiceLabel, { color: colors.foreground }]}>Yes, I will</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setPracticeIntended(false);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  styles.practiceButton,
                  {
                    backgroundColor: !practiceIntended ? "#F4C2C2" : colors.surface,
                    borderColor: !practiceIntended ? "#E57373" : colors.border,
                    borderWidth: !practiceIntended ? 2 : 1,
                  },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Text style={styles.practiceEmoji}>—</Text>
                <Text style={[styles.practiceLabel, { color: colors.foreground }]}>Not today</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={handleSave}
              disabled={saveMorning.isPending}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                saveMorning.isPending && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.nextButtonText}>
                {saveMorning.isPending ? "Saving..." : "Save & Complete"}
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
  headerTitle: { fontSize: 17, fontWeight: "700" },
  stepIndicator: { fontSize: 13, fontWeight: "600" },
  progressBar: { height: 4, marginHorizontal: 20, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    gap: 16,
  },
  stepTitle: { fontSize: 22, fontWeight: "700", marginTop: 20 },
  stepSubtitle: { fontSize: 15, lineHeight: 22 },
  moodRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  moodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "System",
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "System",
    minHeight: 120,
    textAlignVertical: "top",
  },
  nextButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  nextButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  practiceChoices: { flexDirection: "row", gap: 12 },
  practiceButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  practiceEmoji: { fontSize: 28 },
  practiceLabel: { fontSize: 14, fontWeight: "600" },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  completionEmoji: { fontSize: 64 },
  completionTitle: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  completionSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  doneButton: { paddingVertical: 14, borderRadius: 12, alignItems: "center", width: "100%", marginTop: 20 },
  doneButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
