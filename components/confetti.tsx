import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
  count?: number;
}

export function Confetti({ isActive, onComplete, count = 30 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPieces([]);
      return;
    }

    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.2,
        duration: 2 + Math.random() * 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
      });
    }

    setPieces(newPieces);

    // Trigger completion after animation duration
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isActive, count, onComplete]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece }: { piece: ConfettiPiece }) {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.delay(piece.delay * 1000),
      Animated.timing(animation, {
        toValue: 1,
        duration: piece.duration * 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animation, piece.delay, piece.duration]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0],
  });

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${piece.rotation * 2}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: `${piece.left}%`,
          width: piece.size,
          height: piece.size,
          backgroundColor: piece.color,
          transform: [{ translateY }, { rotate }],
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    pointerEvents: "none",
  },
  piece: {
    position: "absolute",
    borderRadius: 50,
  },
});
