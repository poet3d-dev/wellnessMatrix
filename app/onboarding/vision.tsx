import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function VisionScreen() {
  const router = useRouter();
  const colors = useColors();
  const [visionText, setVisionText] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setConfirmed(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        router.replace("/onboarding/prep-week");
      }, 1500);
    },
    onError: () => {
      Alert.alert("Error", "Could not save your vision. Please try again.");
    },
  });

  const handleSave = () => {
    if (visionText.trim().length < 10) {
      Alert.alert("Too short", "Please write at least a few words about your vision.");
      return;
    }
    updateProfile.mutate({ visionText: visionText.trim() });
  };

  const charCount = visionText.length;
  const maxChars = 500;

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>STEP 1 OF 1</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Set Your 4-Week Vision
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Over these next 4 weeks, how do you want to feel and show up?
          </Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            multiline
            numberOfLines={8}
            placeholder="I want to feel more energised, present and connected. I want to show up as someone who..."
            placeholderTextColor={colors.muted}
            value={visionText}
            onChangeText={(t) => setVisionText(t.slice(0, maxChars))}
            textAlignVertical="top"
            returnKeyType="default"
          />
          <Text style={[styles.charCount, { color: charCount > maxChars * 0.9 ? colors.error : colors.muted }]}>
            {charCount}/{maxChars}
          </Text>
        </View>

        {confirmed ? (
          <View style={[styles.confirmBanner, { backgroundColor: colors.success + "20", borderColor: colors.success }]}>
            <Text style={[styles.confirmText, { color: colors.success }]}>
              ✓ Vision anchored! Starting your prep week...
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={updateProfile.isPending || visionText.trim().length < 10}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              (updateProfile.isPending || visionText.trim().length < 10) && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.saveButtonText}>
              {updateProfile.isPending ? "Anchoring..." : "Anchor My Vision"}
            </Text>
          </Pressable>
        )}

        <View style={[styles.tipCard, { backgroundColor: colors.blue + "20", borderColor: colors.blue }]}>
          <Text style={[styles.tipTitle, { color: colors.foreground }]}>💡 Vision tips</Text>
          <Text style={[styles.tipText, { color: colors.muted }]}>
            Focus on how you want to feel, not just what you want to do. Use "I want to feel..." or "I want to be someone who..."
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
    paddingTop: 48,
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 180,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    marginTop: 6,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  confirmBanner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
