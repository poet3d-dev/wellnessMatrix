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

export default function FreeWriteScreen() {
  const router = useRouter();
  const colors = useColors();
  const today = getTodayDateString();

  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: existingEntry } = trpc.freeWrite.getByDate.useQuery({ date: today });

  const utils = trpc.useUtils();
  const saveFreeWrite = trpc.freeWrite.save.useMutation({
    onSuccess: () => {
      utils.freeWrite.list.invalidate();
      utils.freeWrite.getByDate.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
    },
    onError: () => {
      Alert.alert("Error", "Could not save your free write. Please try again.");
    },
  });

  const handleSave = () => {
    if (content.trim().length < 3) {
      Alert.alert("Too short", "Please write at least a few words.");
      return;
    }
    saveFreeWrite.mutate({ date: today, content: content.trim() });
  };

  const charCount = content.length;

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>✕ Close</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>✍️ Free Write</Text>
        <Text style={[styles.charCountHeader, { color: colors.muted }]}>{charCount}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.prompt, { color: colors.muted }]}>
          Write freely — no prompts, no rules. Just let it flow.
        </Text>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surface,
              borderColor: content.length > 0 ? colors.primary : colors.border,
              color: colors.foreground,
            },
          ]}
          placeholder="Start writing here..."
          placeholderTextColor={colors.muted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus
          maxLength={3000}
        />

        {saved ? (
          <View style={[styles.savedBanner, { backgroundColor: colors.success + "20", borderColor: colors.success }]}>
            <Text style={[styles.savedText, { color: colors.success }]}>
              ✓ Saved! Your words are safe.
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.savedLink, { color: colors.primary }]}>Back to Home →</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={saveFreeWrite.isPending || content.trim().length < 3}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              (saveFreeWrite.isPending || content.trim().length < 3) && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.saveButtonText}>
              {saveFreeWrite.isPending ? "Saving..." : "Save Entry"}
            </Text>
          </Pressable>
        )}

        {/* Past free writes hint */}
        <View style={[styles.hintCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.hintText, { color: colors.muted }]}>
            💡 Free writing helps process emotions, spark creativity, and build self-awareness. Write without judgment.
          </Text>
        </View>
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
  charCountHeader: { fontSize: 13 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  prompt: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    lineHeight: 26,
    minHeight: 300,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  savedBanner: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  savedText: {
    fontSize: 15,
    fontWeight: "600",
  },
  savedLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  hintCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
