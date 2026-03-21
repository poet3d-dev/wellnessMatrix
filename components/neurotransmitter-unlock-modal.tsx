import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, Pressable, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { getNeurotransmitterInfo } from "@/shared/neurotransmitters";
import { Confetti } from "@/components/confetti";

interface NeurotransmitterUnlockModalProps {
  visible: boolean;
  neurotransmitterColor: string;
  onClose: () => void;
}

export function NeurotransmitterUnlockModal({
  visible,
  neurotransmitterColor,
  onClose,
}: NeurotransmitterUnlockModalProps) {
  const colors = useColors();
  const info = getNeurotransmitterInfo(neurotransmitterColor);
  const [confettiKey, setConfettiKey] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 200);
      }

      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 12,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Trigger confetti
      setConfettiKey((k) => k + 1);
    }
  }, [visible]);

  if (!info) return null;

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
        {/* Confetti */}
        <Confetti key={confettiKey} isActive={true} />

        {/* Unlock card */}
        <Animated.View style={[styles.card, animatedStyle, { backgroundColor: info.color + "20", borderColor: info.color }]}>
          {/* Icon */}
          <Text style={styles.icon}>{info.emoji}</Text>

          {/* Title */}
          <Text style={[styles.title, { color: colors.foreground }]}>
            🎉 {info.name} Unlocked!
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.muted }]}>
            You've completed your first week of {info.name} practices. Great work!
          </Text>

          {/* Description */}
          <View style={[styles.descriptionBox, { backgroundColor: info.color + "30" }]}>
            <Text style={[styles.descriptionText, { color: colors.foreground }]}>
              {info.shortDescription}
            </Text>
          </View>

          {/* Benefits preview */}
          <View style={styles.benefitsPreview}>
            <Text style={[styles.benefitsTitle, { color: colors.foreground }]}>
              Week 1 Benefits:
            </Text>
            {info.mentalHealthBenefits.slice(0, 2).map((benefit, idx) => (
              <Text key={`benefit-${idx}`} style={[styles.benefitItem, { color: colors.muted }]}>
                ✓ {benefit}
              </Text>
            ))}
          </View>

          {/* Close button */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onClose();
            }}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: info.color },
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.closeButtonText}>Continue Your Journey →</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  descriptionBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  benefitsPreview: {
    width: "100%",
    marginBottom: 20,
    gap: 6,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  benefitItem: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 4,
  },
  closeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
