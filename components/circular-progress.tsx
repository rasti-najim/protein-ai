import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, CircleProps } from "react-native-svg";
import { Animated } from "react-native";

interface CircularProgressProps {
  progress: number | Animated.Value;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  children?: React.ReactNode;
  goalText?: string;
  startAngle?: number;
  icon?: React.ReactNode;
  gapDegrees?: number;
}

export const CircularProgress = ({
  progress,
  size = 48,
  strokeWidth = 4,
  color = "#7FEA71",
  backgroundColor = "#E0E0E0",
  children,
  goalText,
  startAngle = 120,
  icon,
  gapDegrees = 30,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const arcLength = (360 - gapDegrees) / 360; // Proportion of the circle to draw

  const clampedProgress =
    typeof progress === "number"
      ? Math.min(1, Math.max(0, progress))
      : progress;

  const progressOffset =
    typeof clampedProgress === "number"
      ? clampedProgress === 0
        ? circumference * arcLength
        : circumference - clampedProgress * circumference * arcLength
      : circumference -
        (clampedProgress as unknown as number) * circumference * arcLength;

  const commonCircleProps: CircleProps = {
    fill: "none",
    cx: size / 2,
    cy: size / 2,
    r: radius,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    transform: `rotate(${startAngle} ${size / 2} ${size / 2})`,
  };

  // Calculate icon position in the gap
  const gapAngle = startAngle + (360 - gapDegrees) / 2; // Middle of the gap
  const gapRadian = (gapAngle * Math.PI) / 180;
  const iconLeft = size / 2 + (radius + strokeWidth / 2) * Math.cos(gapRadian);
  const iconTop = size / 2 + (radius + strokeWidth / 2) * Math.sin(gapRadian);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          {...commonCircleProps}
          stroke={backgroundColor}
          strokeDasharray={`${circumference * arcLength} ${circumference}`}
          strokeDashoffset={circumference * (1 - arcLength)}
        />
        <Circle
          {...commonCircleProps}
          stroke={color}
          strokeDasharray={`${circumference * arcLength} ${circumference}`}
          strokeDashoffset={progressOffset}
        />
      </Svg>
      <View style={[styles.childrenContainer, { width: size, height: size }]}>
        {children}
      </View>
      {goalText && (
        <View style={[styles.goalTextContainer, { width: size }]}>
          <Text style={styles.goalText}>{goalText}</Text>
        </View>
      )}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              left: iconLeft,
              top: iconTop,
            },
          ]}
        >
          {icon}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  childrenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  goalTextContainer: {
    position: "absolute",
    bottom: "5%",
    alignItems: "center",
  },
  goalText: {
    fontSize: 20,
    fontFamily: "Platypi",
  },
  iconContainer: {
    position: "absolute",
    width: 24, // Add default width for icon container
    height: 24, // Add default height for icon container
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -12 }, { translateY: -12 }], // Center the icon
  },
});
