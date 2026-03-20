import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function ProfileTab() {
  const router = useRouter();
  const colors = useColors();
  const { user, logout } = useAuth();

  const { data: userProfile } = trpc.user.me.useQuery();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your journal data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Not implemented", "Please contact support to delete your account.");
          },
        },
      ]
    );
  };

  const visionText = userProfile?.visionText ?? "";

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "30" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user?.name ?? "Wellness Journaler"}
          </Text>
          <Text style={[styles.email, { color: colors.muted }]}>{user?.email ?? ""}</Text>
        </View>

        {/* Vision */}
        {visionText ? (
          <View style={[styles.card, { backgroundColor: "#A8C4D830", borderColor: "#A8C4D8" }]}>
            <Text style={[styles.cardLabel, { color: colors.muted }]}>YOUR 4-WEEK VISION</Text>
            <Text style={[styles.visionText, { color: colors.foreground }]}>"{visionText}"</Text>
            <Pressable
              onPress={() => router.push("/onboarding/vision")}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.editLink, { color: colors.primary }]}>Edit vision →</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Journey info */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Journey Info</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Current Week</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {userProfile?.currentWeek === 0 ? "Prep Week" : `Week ${userProfile?.currentWeek ?? "—"}`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Journey Started</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {userProfile?.journeyStartDate
                ? new Date(String(userProfile.journeyStartDate)).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Not started"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Onboarding</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {userProfile?.onboardingComplete ? "Complete ✓" : "In progress"}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Actions</Text>

          <Pressable
            onPress={() => router.push("/milestone/export")}
            style={({ pressed }) => [
              styles.actionRow,
              { borderBottomColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={[styles.actionText, { color: colors.foreground }]}>Download Journey PDF</Text>
            <Text style={[styles.actionArrow, { color: colors.muted }]}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/onboarding/vision")}
            style={({ pressed }) => [
              styles.actionRow,
              { borderBottomColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={[styles.actionText, { color: colors.foreground }]}>Update My Vision</Text>
            <Text style={[styles.actionArrow, { color: colors.muted }]}>›</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.actionRow,
              { borderBottomWidth: 0 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={[styles.actionText, { color: colors.foreground }]}>Log Out</Text>
            <Text style={[styles.actionArrow, { color: colors.muted }]}>›</Text>
          </Pressable>
        </View>

        {/* Danger zone */}
        <Pressable
          onPress={handleDeleteAccount}
          style={({ pressed }) => [
            styles.deleteButton,
            { borderColor: colors.error },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete My Account</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.muted }]}>Wellness Matrix v1.0</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  visionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 8,
  },
  editLink: {
    fontSize: 13,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  actionIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  actionText: {
    flex: 1,
    fontSize: 15,
  },
  actionArrow: {
    fontSize: 20,
    fontWeight: "300",
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    marginBottom: 24,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  version: {
    fontSize: 12,
    textAlign: "center",
  },
});
