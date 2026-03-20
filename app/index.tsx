import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const colors = useColors();

  const { data: userProfile, isLoading: profileLoading } = trpc.user.me.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (authLoading) return;
    if (profileLoading && isAuthenticated) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
      return;
    }

    if (!userProfile) {
      router.replace("/(auth)/welcome");
      return;
    }

    // Route based on onboarding state
    if (!userProfile.privacyAccepted) {
      router.replace("/onboarding/privacy");
      return;
    }

    if (!userProfile.visionText) {
      router.replace("/onboarding/vision");
      return;
    }

    if (!userProfile.onboardingComplete) {
      router.replace("/onboarding/prep-week");
      return;
    }

    router.replace("/(tabs)");
  }, [authLoading, isAuthenticated, profileLoading, userProfile, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
