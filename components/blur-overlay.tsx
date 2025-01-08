import { StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

export const BlurOverlay = ({
  animatedIndex,
  style,
}: BottomSheetBackdropProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView intensity={20} tint="dark" style={styles.blur} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
});
