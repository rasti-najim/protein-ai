import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Button,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import Animated, {
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from "react-native-reanimated";
import { usePostHog } from "posthog-react-native";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

export default function Page() {
  const router = useRouter();
  const posthog = usePostHog();
  const [currentStep, setCurrentStep] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const logoScale = useSharedValue(1);
  const modalSlide = useSharedValue(0);
  const dotScale = useSharedValue(1);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(contentOffset / width);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
    }
  };

  useEffect(() => {
    dotScale.value = withSequence(
      withTiming(1.4, { duration: 200 }),
      withTiming(1, { duration: 150 })
    );
  }, [currentStep]);

  const onboardingSteps = [
    {
      title: "No more calorie counting.",
      subtitle: "A high-protein diet helps with:",
      description:
        "Lean Muscle Growth\nFat Loss\nQuick Recovery\nAll-Day Energy",
    },
    {
      title: "A Personalized Protein Plan",
      subtitle: "Based on your profile,",
      description:
        "We select the optimal amount of protein for you to eat every day.",
    },
    {
      title: "Less Than 5 Minutes a Day",
      subtitle: "With our AI scanning software,",
      description:
        "We streamline your journey to a lean, high-protein, and nutrient-dense diet.",
    },
  ];

  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {onboardingSteps.map((_, index) => {
          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [
                {
                  scale: currentStep === index ? dotScale.value : 1,
                },
              ],
            };
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    currentStep === index ? "#333333" : "#D1D1D6",
                },
                animatedStyle,
              ]}
            />
          );
        })}
      </View>
    );
  };

  const Modal = () => {
    return (
      <Animated.View
        style={[styles.modalCard, { transform: [{ translateY: modalSlide }] }]}
      >
        <View style={styles.modalView}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            // onMomentumScrollEnd={handleScroll}
          >
            {onboardingSteps.map((step, index) => (
              <View key={index} style={[styles.modalContent, { width: width }]}>
                <Text style={styles.tagline}>{step.title}</Text>
                <Text style={styles.subtitle}>{step.subtitle}</Text>
                <Text style={styles.description}>{step.description}</Text>
              </View>
            ))}
          </ScrollView>
          {renderStepIndicators()}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                posthog.capture("onboarding_started");
                router.push("/onboarding");
              }}
            >
              <Text style={[styles.buttonText]}>Get Started</Text>
            </TouchableOpacity>

            <Button
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/login");
              }}
              title="Already have an account? Log in"
              color="#333333"
            />
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <Image
        source={require("../assets/images/steak-dark.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <SafeAreaView style={styles.content}>
        <Animated.Text
          style={[styles.title, { transform: [{ scale: logoScale }] }]}
        >
          Protein AI
        </Animated.Text>
      </SafeAreaView>
      <Modal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: width * 0.05,
  },
  title: {
    fontSize: Math.min(width * 0.12, 48),
    fontFamily: "Platypi",
    color: "#FCE9BC",
    marginTop: height * 0.05,
    marginBottom: height * 0.05,
  },
  tagline: {
    fontSize: Math.min(Math.max(width * 0.08, 32), 36),
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: height * 0.015,
    lineHeight: Math.min(Math.max(width * 0.1, 40), 44),
  },
  subtitle: {
    fontSize: Math.min(Math.max(width * 0.045, 18), 20),
    fontWeight: "700",
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },
  description: {
    fontSize: Math.min(Math.max(width * 0.045, 18), 20),
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginVertical: height * 0.01,
    lineHeight: Math.min(Math.max(width * 0.06, 24), 28),
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9D0C7",
  },
  activeDot: {
    backgroundColor: "#2A2A2A",
  },
  button: {
    backgroundColor: "#333333",
    padding: width * 0.04,
    borderRadius: Math.min(width * 0.08, 32),
    alignItems: "center",
    marginHorizontal: width * 0.06,
    marginBottom: height * 0.03,
  },
  buttonText: {
    fontSize: Math.min(width * 0.06, 24),
    fontFamily: "Platypi",
    color: "#FCE9BC",
    fontWeight: "600",
  },
  modalCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FCE9BC",
    height: Math.min(Math.max(height * 0.55, 500), 600),
    borderTopLeftRadius: Math.min(width * 0.08, 30),
    borderTopRightRadius: Math.min(width * 0.08, 30),
    overflow: "hidden",
  },
  modalView: {
    flex: 1,
  },
  modalContent: {
    width: width,
    padding: width * 0.05,
    justifyContent: "space-between",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: width * 0.02,
    marginVertical: height * 0.03,
  },
  stepDot: {
    width: width * 0.02,
    height: width * 0.02,
    borderRadius: width * 0.01,
  },
  activeStepDot: {
    backgroundColor: "#2A2A2A",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#FCE9BC",
  },
  buttonTextDisabled: {
    color: "#CCCCCC",
  },
  buttonGroup: {
    gap: height * 0.015,
    marginHorizontal: width * 0.06,
    marginTop: "auto",
    marginBottom: height * 0.03,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#333333",
  },
  secondaryButtonText: {
    color: "#333333",
  },
  loginText: {
    fontSize: Math.min(width * 0.04, 16),
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    opacity: 0.8,
  },
});
