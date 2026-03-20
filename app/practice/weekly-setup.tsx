import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import {
  getWeeklySetupConfig,
  getQuadrantColor,
  getQuadrantEmoji,
  getQuadrantLabel,
  type QuadrantColor,
} from "@/lib/weekly-setup";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function WeeklySetupScreen() {
  const router = useRouter();
  const colors = useColors();
  const { week: weekParam } = useLocalSearchParams();
  const week = parseInt(weekParam as string) || 1;

  const config = getWeeklySetupConfig(week);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedQuadrants, setSelectedQuadrants] = useState<QuadrantColor[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const utils = trpc.useUtils();
  const savePractice = trpc.practices.save.useMutation({
    onSuccess: () => {
      utils.practices.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success", "Your weekly practices have been saved!");
      router.back();
    },
    onError: () => {
      Alert.alert("Error", "Could not save your practices. Please try again.");
    },
  });

  const handleSelectQuadrant = (quadrant: QuadrantColor) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (week <= 4) {
      // Weeks 1-4: Single selection per week
      setSelectedQuadrants([quadrant]);
      handleNext();
    } else {
      // Week 5+: Multiple selection
      setSelectedQuadrants((prev) =>
        prev.includes(quadrant)
          ? prev.filter((q) => q !== quadrant)
          : [...prev, quadrant]
      );
    }
  };

  const handleNext = () => {
    if (week <= 4 && selectedQuadrants.length === 0) {
      Alert.alert("Please select a practice", "Choose a quadrant to continue.");
      return;
    }

    if (currentStep < config.availableQuadrants.length - 1) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    if (selectedQuadrants.length === 0) {
      Alert.alert("Please select at least one practice", "");
      return;
    }

    const quadrantToSave = week <= 4 ? config.mandatoryQuadrant : selectedQuadrants[0];
    savePractice.mutate({
      weekNum: week,
      practiceText: `Week ${week} practice`,
      weekColor: quadrantToSave,
    });
  };

  const currentQuadrant = config.availableQuadrants[currentStep];
  const isMandatory = currentQuadrant === config.mandatoryQuadrant;
  const isSelected = selectedQuadrants.includes(currentQuadrant);

  const quadrantColor = getQuadrantColor(currentQuadrant);
  const quadrantEmoji = getQuadrantEmoji(currentQuadrant);
  const quadrantLabel = getQuadrantLabel(currentQuadrant);

  const totalSteps = config.availableQuadrants.length;
  const progressPct = ((currentStep + 1) / totalSteps) * 100;

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            {currentStep === 0 ? "✕ Close" : "← Back"}
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {config.title}
        </Text>
        <Text style={[styles.stepIndicator, { color: colors.muted }]}>
          {currentStep + 1}/{totalSteps}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: quadrantColor, width: `${progressPct}%` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step description */}
        <View style={styles.stepContainer}>
          <Text style={[styles.stepDescription, { color: colors.muted }]}>
            {config.description}
          </Text>

          {/* Current quadrant card */}
          <View
            style={[
              styles.quadrantCard,
              {
                backgroundColor: quadrantColor + "30",
                borderColor: quadrantColor,
                borderWidth: 2,
              },
            ]}
          >
            <Text style={styles.quadrantEmoji}>{quadrantEmoji}</Text>
            <Text style={[styles.quadrantTitle, { color: colors.foreground }]}>
              {quadrantLabel}
            </Text>
            {isMandatory && (
              <View style={[styles.mandatoryBadge, { backgroundColor: quadrantColor }]}>
                <Text style={styles.mandatoryText}>Mandatory</Text>
              </View>
            )}
          </View>

          {/* Selection buttons */}
          <View style={styles.buttonGroup}>
            <Pressable
              onPress={() => handleSelectQuadrant(currentQuadrant)}
              style={({ pressed }) => [
                styles.selectButton,
                {
                  backgroundColor: isSelected ? quadrantColor : colors.surface,
                  borderColor: quadrantColor,
                  borderWidth: 2,
                },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  { color: isSelected ? "#fff" : colors.foreground },
                ]}
              >
                {isSelected ? "✓ Selected" : "Select This Practice"}
              </Text>
            </Pressable>

            {!isMandatory && week <= 4 && (
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.skipButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text style={[styles.skipButtonText, { color: colors.muted }]}>
                  Skip (Optional)
                </Text>
              </Pressable>
            )}
          </View>

          {/* Suggestions dropdown */}
          <Pressable
            onPress={() => setShowSuggestions(!showSuggestions)}
            style={({ pressed }) => [
              styles.suggestionsButton,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.suggestionsButtonText, { color: colors.primary }]}>
              {showSuggestions ? "Hide Suggestions" : "Show Suggestions"} ▼
            </Text>
          </Pressable>

          {showSuggestions && (
            <View style={[styles.suggestionsBox, { backgroundColor: colors.surface }]}>
              <Text style={[styles.suggestionsTitle, { color: colors.foreground }]}>
                Example Practices:
              </Text>
              <Text style={[styles.suggestionItem, { color: colors.muted }]}>
                • 10-minute meditation
              </Text>
              <Text style={[styles.suggestionItem, { color: colors.muted }]}>
                • Breathing exercise
              </Text>
              <Text style={[styles.suggestionItem, { color: colors.muted }]}>
                • Journaling prompt
              </Text>
              <Text style={[styles.suggestionItem, { color: colors.muted }]}>
                • Gratitude reflection
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          disabled={week <= 4 && selectedQuadrants.length === 0}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            week <= 4 && selectedQuadrants.length === 0 && { opacity: 0.4 },
          ]}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps - 1 ? "Complete Setup" : "Next →"}
          </Text>
        </Pressable>
      </View>
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
    paddingVertical: 20,
  },
  stepContainer: {
    gap: 20,
  },
  stepDescription: { fontSize: 14, lineHeight: 20 },
  quadrantCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  quadrantEmoji: { fontSize: 48 },
  quadrantTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  mandatoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  mandatoryText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  buttonGroup: { gap: 12 },
  selectButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonText: { fontSize: 16, fontWeight: "700" },
  skipButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  skipButtonText: { fontSize: 14, fontWeight: "600" },
  suggestionsButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  suggestionsButtonText: { fontSize: 14, fontWeight: "600" },
  suggestionsBox: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  suggestionsTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  suggestionItem: { fontSize: 13, lineHeight: 18 },
  footer: { paddingHorizontal: 20, paddingBottom: 20 },
  nextButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
