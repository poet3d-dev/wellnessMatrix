// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for Wellness Matrix app.
 */
const MAPPING = {
  // Tab bar icons
  "house.fill": "home",
  "book.fill": "menu-book",
  "chart.bar.fill": "bar-chart",
  "person.fill": "person",
  // Navigation
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "chevron.left.forwardslash.chevron.right": "code",
  "paperplane.fill": "send",
  // Journal
  "pencil": "edit",
  "sun.max.fill": "wb-sunny",
  "moon.fill": "nightlight-round",
  "star.fill": "star",
  // Actions
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "lock.fill": "lock",
  "trash.fill": "delete",
  "square.and.arrow.down": "download",
  "gearshape.fill": "settings",
  "bell.fill": "notifications",
  "heart.fill": "favorite",
  "leaf.fill": "eco",
  "flame.fill": "local-fire-department",
  "sparkles": "auto-awesome",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
