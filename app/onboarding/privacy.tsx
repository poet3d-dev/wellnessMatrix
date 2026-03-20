import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const PRIVACY_POINTS = [
  {
    icon: "🔒",
    title: "Your data is private",
    desc: "Your vision, journals, and practices are completely private. Only you can see them.",
  },
  {
    icon: "📄",
    title: "Download anytime",
    desc: "You can download your full journey as a PDF at any time — it belongs to you.",
  },
  {
    icon: "🗑️",
    title: "Delete anytime",
    desc: "You can delete your account and all associated data at any time from your profile.",
  },
  {
    icon: "🛡️",
    title: "Secure storage",
    desc: "All data is encrypted and stored securely. We never sell or share your personal information.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const colors = useColors();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      router.replace("/onboarding/vision");
    },
  });

  const handleAccept = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile.mutate({ privacyAccepted: true });
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Your Privacy</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Before we begin, here's how we protect your journey.
          </Text>
        </View>

        <View style={styles.points}>
          {PRIVACY_POINTS.map((point, i) => (
            <View
              key={i}
              style={[styles.pointCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={styles.pointIcon}>{point.icon}</Text>
              <View style={styles.pointContent}>
                <Text style={[styles.pointTitle, { color: colors.foreground }]}>{point.title}</Text>
                <Text style={[styles.pointDesc, { color: colors.muted }]}>{point.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleAccept}
            disabled={updateProfile.isPending}
            style={({ pressed }) => [
              styles.acceptButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              updateProfile.isPending && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.acceptButtonText}>
              {updateProfile.isPending ? "Saving..." : "Understood, keep my data safe"}
            </Text>
          </Pressable>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  points: {
    gap: 16,
    marginBottom: 40,
  },
  pointCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  pointIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  pointContent: {
    flex: 1,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  pointDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    gap: 12,
  },
  acceptButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
