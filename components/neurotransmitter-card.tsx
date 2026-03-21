import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { getNeurotransmitterInfo } from "@/shared/neurotransmitters";

interface NeurotransmitterCardProps {
  color: string;
  showBenefits?: boolean;
}

export function NeurotransmitterCard({ color, showBenefits = false }: NeurotransmitterCardProps) {
  const colors = useColors();
  const info = getNeurotransmitterInfo(color);

  if (!info) return null;

  return (
    <View style={[styles.card, { backgroundColor: info.color + "15", borderColor: info.color }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{info.emoji}</Text>
        <View style={styles.titleSection}>
          <Text style={[styles.name, { color: colors.foreground }]}>{info.name}</Text>
          <Text style={[styles.shortDesc, { color: colors.muted }]}>{info.shortDescription}</Text>
        </View>
      </View>

      {/* Full description */}
      <Text style={[styles.fullDesc, { color: colors.foreground }]}>{info.fullDescription}</Text>

      {/* Benefits (if requested) */}
      {showBenefits && (
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitSection}>
            <Text style={[styles.benefitTitle, { color: colors.foreground }]}>🧠 Mental Health</Text>
            {info.mentalHealthBenefits.map((benefit, idx) => (
              <Text key={`mental-${idx}`} style={[styles.benefitItem, { color: colors.muted }]}>
                • {benefit}
              </Text>
            ))}
          </View>

          <View style={styles.benefitSection}>
            <Text style={[styles.benefitTitle, { color: colors.foreground }]}>💪 Physical Health</Text>
            {info.physicalHealthBenefits.map((benefit, idx) => (
              <Text key={`physical-${idx}`} style={[styles.benefitItem, { color: colors.muted }]}>
                • {benefit}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
    marginTop: 2,
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  shortDesc: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  fullDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsContainer: {
    marginTop: 12,
    gap: 12,
  },
  benefitSection: {
    gap: 6,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  benefitItem: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 4,
  },
});
