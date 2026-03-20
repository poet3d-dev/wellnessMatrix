import { View, Text, Pressable, ScrollView, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { startOAuthLogin } from "@/constants/oauth";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const handleLogin = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void startOAuthLogin();
  };

  const handleSignUp = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void startOAuthLogin();
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + "30" }]}>
            <Text style={[styles.logoText, { color: colors.primary }]}>WM</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Wellness Matrix</Text>
          <Text style={[styles.tagline, { color: colors.muted }]}>
            Build your self-care habits,{"\n"}one week at a time.
          </Text>
        </View>

        {/* Matrix Visual */}
        <View style={styles.matrixContainer}>
          <View style={styles.matrixGrid}>
            <View style={[styles.quadrant, { backgroundColor: colors.blue + "60" }]}>
              <Text style={[styles.quadrantLabel, { color: colors.foreground }]}>🔵</Text>
              <Text style={[styles.quadrantText, { color: colors.foreground }]}>Connection{"\n"}& Calm</Text>
            </View>
            <View style={[styles.quadrant, { backgroundColor: colors.yellow + "60" }]}>
              <Text style={[styles.quadrantLabel, { color: colors.foreground }]}>🟡</Text>
              <Text style={[styles.quadrantText, { color: colors.foreground }]}>Energy{"\n"}& Joy</Text>
            </View>
            <View style={[styles.quadrant, { backgroundColor: colors.green + "60" }]}>
              <Text style={[styles.quadrantLabel, { color: colors.foreground }]}>🟢</Text>
              <Text style={[styles.quadrantText, { color: colors.foreground }]}>Growth{"\n"}& Nature</Text>
            </View>
            <View style={[styles.quadrant, { backgroundColor: colors.red + "60" }]}>
              <Text style={[styles.quadrantLabel, { color: colors.foreground }]}>🔴</Text>
              <Text style={[styles.quadrantText, { color: colors.foreground }]}>Focus{"\n"}& Achievement</Text>
            </View>
          </View>
          <Text style={[styles.matrixCaption, { color: colors.muted }]}>
            Your personalised 8-week self-care journey
          </Text>
        </View>

        {/* Feature highlights */}
        <View style={styles.features}>
          {[
            { icon: "📓", text: "Daily morning & evening journals" },
            { icon: "🎯", text: "4 personalised weekly practices" },
            { icon: "📊", text: "Progress tracking & reflections" },
            { icon: "📄", text: "Download your full journey as PDF" },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureText, { color: colors.foreground }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttons}>
          <Pressable
            onPress={handleSignUp}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: "#fff" }]}>
              Begin My Journey
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
              Already started? Log in
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.disclaimer, { color: colors.muted }]}>
          Your data is private and secure. Delete anytime.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingTop: 48,
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 2,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  matrixContainer: {
    width: "100%",
    marginBottom: 32,
    alignItems: "center",
  },
  matrixGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 280,
    gap: 8,
    marginBottom: 12,
  },
  quadrant: {
    width: 132,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  quadrantLabel: {
    fontSize: 20,
    marginBottom: 4,
  },
  quadrantText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  matrixCaption: {
    fontSize: 13,
    textAlign: "center",
  },
  features: {
    width: "100%",
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  featureText: {
    fontSize: 15,
    lineHeight: 22,
  },
  buttons: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
  },
});
