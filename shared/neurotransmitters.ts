/**
 * Neurotransmitter science data for educational explainer cards
 */

export interface NeurotransmitterInfo {
  name: string;
  color: string;
  emoji: string;
  shortDescription: string;
  fullDescription: string;
  mentalHealthBenefits: string[];
  physicalHealthBenefits: string[];
  icon: string;
}

export const NEUROTRANSMITTER_DATA: Record<string, NeurotransmitterInfo> = {
  blue: {
    name: "Serotonin",
    color: "#A8C4D8",
    emoji: "🧘",
    shortDescription: "The stability neurotransmitter that regulates mood, sleep, and emotional balance.",
    fullDescription:
      "Serotonin is often called the 'happiness molecule.' It plays a crucial role in regulating mood, sleep-wake cycles, and appetite. Low serotonin is linked to depression and anxiety, while balanced levels promote emotional stability and calm.",
    mentalHealthBenefits: [
      "Improves mood and reduces depression",
      "Enhances emotional stability",
      "Promotes better sleep quality",
      "Reduces anxiety and worry",
    ],
    physicalHealthBenefits: [
      "Regulates appetite and digestion",
      "Supports immune function",
      "Improves pain tolerance",
      "Enhances bone health",
    ],
    icon: "🧘",
  },
  yellow: {
    name: "Endorphins",
    color: "#E8D5A3",
    emoji: "⚡",
    shortDescription: "The relief neurotransmitter that creates feelings of pleasure and reduces pain.",
    fullDescription:
      "Endorphins are natural painkillers and mood elevators. They're released during exercise, laughter, and enjoyable activities. Often called 'feel-good' chemicals, endorphins create a sense of relief, euphoria, and wellbeing.",
    mentalHealthBenefits: [
      "Creates feelings of pleasure and joy",
      "Reduces stress and tension",
      "Boosts confidence and self-esteem",
      "Enhances social connection",
    ],
    physicalHealthBenefits: [
      "Natural pain relief",
      "Reduces inflammation",
      "Boosts immune response",
      "Increases energy and vitality",
    ],
    icon: "⚡",
  },
  green: {
    name: "Dopamine",
    color: "#B8D5A3",
    emoji: "🌱",
    shortDescription: "The direction neurotransmitter that drives motivation, focus, and goal achievement.",
    fullDescription:
      "Dopamine is the 'motivation molecule.' It's essential for focus, goal-setting, and the reward system. Dopamine drives us to take action, learn new things, and pursue meaningful goals. It's key to feeling purposeful and driven.",
    mentalHealthBenefits: [
      "Increases motivation and drive",
      "Enhances focus and concentration",
      "Promotes goal-oriented behavior",
      "Creates sense of purpose and meaning",
    ],
    physicalHealthBenefits: [
      "Improves motor control and coordination",
      "Enhances memory formation",
      "Supports cardiovascular health",
      "Regulates sleep and wakefulness",
    ],
    icon: "🌱",
  },
  red: {
    name: "Oxytocin",
    color: "#F4C2C2",
    emoji: "🎯",
    shortDescription: "The connection neurotransmitter that builds trust, empathy, and social bonds.",
    fullDescription:
      "Oxytocin is the 'bonding hormone.' It's released during social connection, touch, and acts of kindness. Oxytocin builds trust, enhances empathy, and creates feelings of belonging. It's essential for meaningful relationships and community.",
    mentalHealthBenefits: [
      "Strengthens social bonds and belonging",
      "Increases empathy and compassion",
      "Reduces fear and anxiety in social settings",
      "Enhances trust and cooperation",
    ],
    physicalHealthBenefits: [
      "Lowers blood pressure and stress hormones",
      "Reduces inflammation",
      "Supports wound healing",
      "Enhances immune function",
    ],
    icon: "🎯",
  },
};

/**
 * Get neurotransmitter info by color
 */
export function getNeurotransmitterInfo(color: string): NeurotransmitterInfo | null {
  return NEUROTRANSMITTER_DATA[color] ?? null;
}
