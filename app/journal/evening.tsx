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

type Step = 0 | 1 | 2 | 3;

const PRACTICE_OPTIONS = [
  { value: "yes", label: "Yes, I did it!", emoji: "✅", bg: "#E8F5E9", border: "#A5D6A7" },
  { value: "partly", label: "Partly", emoji: "🟡", bg: "#FFF8E1", border: "#FFE082" },
  { value: "no", label: "Not today", emoji: "❌", bg: "#FFEBEE", border: "#EF9A9A" },
];

export default function EveningJournalScreen() {
  const router = useRouter();
  const colors = useColors();
  const today = getTodayDateString();

  const [step, setStep] = useState<Step>(0);
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [bestMoment, setBestMoment] = useState("");
  const [learned, setLearned] = useState("");
  const [practiceCompleted, setPracticeCompleted] = useState<string>("pending");
  const [practiceFeeling, setPracticeFeeling] = useState("");

  const { data: practices } = trpc.practices.list.useQuery();
  const { data: userProfile } = trpc.user.me.useQuery();

  const utils = trpc.useUtils();
  const saveEvening = trpc.journal.saveEvening.useMutation({
    onSuccess: () => {
      utils.journal.getEntry.invalidate();
      utils.journal.listEntries.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(3);
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
    setStep((prev) => Math.min(3, prev + 1) as Step);
  };

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((prev) => Math.max(0, prev - 1) as Step);
  };

  const handleSave = () => {
    saveEvening.mutate({
      date: today,
      weekNum: currentWeek,
      dayNum: 1,
      gratitude1: gratitude[0].trim(),
      gratitude2: gratitude[1].trim(),
      gratitude3: gratitude[2].trim(),
      moment: bestMoment.trim(),
      learned: learned.trim(),
      practiceCompleted: practiceCompleted as "yes" | "partly" | "no" | "pending",
      practiceFeeling: practiceFeeling.trim(),
      completed: true,
    });
  };

  const totalSteps = 3;
  const progressPct = (step / totalSteps) * 100;

  if (step === 3) {
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>🌙</Text>
          <Text style={[styles.completionTitle, { color: colors.foreground }]}>
            Evening journal complete!
          </Text>
          <Text style={[styles.completionSubtitle, { color: colors.muted }]}>
            Rest well. You showed up for yourself today.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: "#8AA8D8" },
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
          <Text style={[styles.backText, { color: "#8AA8D8" }]}>
            {step === 0 ? "✕ Close" : "← Back"}
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>🌙 Evening Journal</Text>
        <Text style={[styles.stepIndicator, { color: colors.muted }]}>
          {step + 1}/{totalSteps}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: "#8AA8D8", width: `${progressPct}%` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0: Gratitude */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              What are you grateful for today?
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              Reflect on the good moments, however small.
            </Text>
            {[0, 1, 2].map((i) => (
              <TextInput
                key={i}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: gratitude[i].length > 0 ? "#8AA8D8" : colors.border,
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
                { backgroundColor: "#8AA8D8" },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                gratitude.filter((g) => g.trim()).length === 0 && { opacity: 0.4 },
              ]}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* Step 1: Reflection */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Reflect on your day
            </Text>
            <Text style={[styles.stepSubtitle, { color: colors.muted }]}>
              What stood out? What did you learn?
            </Text>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Best moment of today
            </Text>
            <TextInput
              style={[
                styles.textInputMulti,
                {
                  backgroundColor: colors.surface,
                  borderColor: bestMoment.length > 0 ? "#8AA8D8" : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="The best part of today was..."
              placeholderTextColor={colors.muted}
              value={bestMoment}
              onChangeText={setBestMoment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              What did I learn today?
            </Text>
            <TextInput
              style={[
                styles.textInputMulti,
                {
                  backgroundColor: colors.surface,
                  borderColor: learned.length > 0 ? "#8AA8D8" : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Today I learned..."
              placeholderTextColor={colors.muted}
              value={learned}
              onChangeText={setLearned}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={300}
            />
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: "#8AA8D8" },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.nextButtonText}>Continue →</Text>
            </Pressable>
          </View>
        )}

        {/* Step 2: Practice check-in */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Practice check-in
            </Text>
            {currentPractice ? (
              <View style={[styles.practiceCard, { backgroundColor: "#A8C4D830", borderColor: "#A8C4D8" }]}>
                <Text style={[styles.practiceLabel, { color: colors.muted }]}>THIS WEEK'S PRACTICE</Text>
                <Text style={[styles.practiceText, { color: colors.foreground }]}>
                  "{currentPractice.practiceText}"
                </Text>
              </View>
            ) : null}
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Did you do your practice today?
            </Text>
            <View style={styles.practiceOptions}>
              {PRACTICE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setPracticeCompleted(opt.value);
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    styles.practiceOption,
                    {
                      backgroundColor: practiceCompleted === opt.value ? opt.bg : colors.surface,
                      borderColor: practiceCompleted === opt.value ? opt.border : colors.border,
                      borderWidth: practiceCompleted === opt.value ? 2 : 1,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.practiceOptionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.practiceOptionLabel, { color: colors.foreground }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
            {practiceCompleted !== "pending" && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                  How did it feel?
                </Text>
                <TextInput
                  style={[
                    styles.textInputMulti,
                    {
                      backgroundColor: colors.surface,
                      borderColor: practiceFeeling.length > 0 ? "#8AA8D8" : colors.border,
                      color: colors.foreground,
                    },
                  ]}
                  placeholder="It felt..."
                  placeholderTextColor={colors.muted}
                  value={practiceFeeling}
                  onChangeText={setPracticeFeeling}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={300}
                />
              </>
            )}
            <Pressable
              onPress={handleSave}
              disabled={saveEvening.isPending}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: "#8AA8D8" },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                saveEvening.isPending && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.nextButtonText}>
                {saveEvening.isPending ? "Saving..." : "Complete Evening Journal ✓"}
              </Text>
            </Pressable>
          </View>
        )}
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
  stepTitle: { fontSize: 24, fontWeight: "700", lineHeight: 32 },
  stepSubtitle: { fontSize: 15, lineHeight: 22, marginTop: -8 },
  fieldLabel: { fontSize: 16, fontWeight: "600" },
  textInput: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 15, lineHeight: 22 },
  textInputMulti: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 15, lineHeight: 22, minHeight: 100 },
  practiceCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  practiceLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 },
  practiceText: { fontSize: 15, lineHeight: 22, fontStyle: "italic" },
  practiceOptions: { flexDirection: "row", gap: 10 },
  practiceOption: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  practiceOptionEmoji: { fontSize: 22 },
  practiceOptionLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  nextButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  nextButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  completionContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, gap: 16 },
  completionEmoji: { fontSize: 64, marginBottom: 8 },
  completionTitle: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  completionSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  doneButton: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, marginTop: 8 },
  doneButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
