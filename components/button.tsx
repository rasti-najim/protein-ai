import { StyleSheet, Text, Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  style?: any;
  textStyle?: any;
  hapticFeedback?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  style,
  textStyle,
  hapticFeedback = true,
  onPress,
  ...props
}: ButtonProps) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    "worklet";
    scale.value = withSpring(0.95, {
      damping: 10,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    "worklet";
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 400,
    });
  };

  const handlePress = async () => {
    if (hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#333333",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(42, 42, 42, 0.1)",
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  text: {
    fontFamily: "Platypi",
    fontWeight: "600",
  },
  primaryText: {
    color: "#FCE9BC",
  },
  secondaryText: {
    color: "#2A2A2A",
  },
  smallText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 20,
  },
  largeText: {
    fontSize: 24,
  },
});
