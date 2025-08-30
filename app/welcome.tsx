import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { usePostHog } from "posthog-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(contentOffset / width);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
    }
  };

  useEffect(() => {
    // Initial animations
    titleOpacity.value = withTiming(1, { duration: 800 });
    subtitleOpacity.value = withTiming(1, { duration: 1000 });
  }, [titleOpacity, subtitleOpacity]);

  useEffect(() => {
    dotScale.value = withSequence(
      withTiming(1.4, { duration: 200 }),
      withTiming(1, { duration: 150 })
    );
  }, [currentStep, dotScale]);

  const onboardingSteps = [
    {
      title: "Track Protein, Not Calories",
      subtitle: "Focus on what matters most:",
      description:
        "• Build lean muscle\n• Burn fat naturally\n• Recover faster\n• Stay energized all day",
      icon: "food-apple" as const,
    },
    {
      title: "Your Personal Plan",
      subtitle: "AI-powered nutrition tailored to you:",
      description:
        "We calculate your optimal daily protein goal based on your body, goals, and lifestyle.",
      icon: "account-star" as const,
    },
    {
      title: "Effortless Tracking",
      subtitle: "Just snap and go:",
      description:
        "Our AI instantly recognizes your meals and tracks protein content in seconds.",
      icon: "camera-plus" as const,
    },
  ];

  const StepIndicator = ({ index }: { index: number }) => {
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
        style={[
          styles.stepDot,
          {
            backgroundColor:
              currentStep === index ? "#333333" : "rgba(51, 51, 51, 0.3)",
          },
          animatedStyle,
        ]}
      />
    );
  };

  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {onboardingSteps.map((_, index) => (
          <StepIndicator key={index} index={index} />
        ))}
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
            onMomentumScrollEnd={handleScroll}
            decelerationRate="fast"
            snapToAlignment="center"
            contentContainerStyle={{ alignItems: "center" }}
          >
            {onboardingSteps.map((step, index) => (
              <View key={index} style={[styles.modalContent, { width: width }]}>
                <View style={styles.contentWrapper}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name={step.icon}
                      size={48}
                      color="#333333"
                    />
                  </View>
                  <Text style={styles.tagline}>{step.title}</Text>
                  <Text style={styles.subtitle}>{step.subtitle}</Text>
                  <Text style={styles.description}>{step.description}</Text>
                </View>
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

            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/login");
              }}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#fae5d2" }]}>
      <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerContent}>
            <Animated.Text
              style={[
                styles.title,
                {
                  transform: [{ scale: logoScale }],
                  opacity: titleOpacity,
                },
              ]}
            >
              Protein AI
            </Animated.Text>
            <Animated.Text
              style={[styles.heroSubtitle, { opacity: subtitleOpacity }]}
            >
              Your AI-powered protein tracking companion
            </Animated.Text>
          </View>
        </View>
        <Modal />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 52,
    color: "#333333",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(51, 51, 51, 0.7)",
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 280,
  },
  tagline: {
    fontSize: 26,
    color: "#333333",
    marginBottom: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(51, 51, 51, 0.8)",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    color: "rgba(51, 51, 51, 0.7)",
    lineHeight: 22,
    textAlign: "center",
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
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: "#fae5d2",
    fontWeight: "600",
  },
  modalCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fae5d2",
    height: Math.min(Math.max(height * 0.65, 520), 680),
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(51, 51, 51, 0.1)",
    borderBottomWidth: 0,
  },
  modalView: {
    flex: 1,
    paddingTop: 24,
  },
  modalContent: {
    width: width,
    paddingHorizontal: 32,
    paddingVertical: 20,
    justifyContent: "center",
    flex: 1,
  },
  contentWrapper: {
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginVertical: 24,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeStepDot: {
    backgroundColor: "#2A2A2A",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#fae5d2",
  },
  buttonTextDisabled: {
    color: "#CCCCCC",
  },
  buttonGroup: {
    gap: 16,
    marginHorizontal: 24,
    marginTop: "auto",
    marginBottom: 32,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "rgba(51, 51, 51, 0.7)",
    textAlign: "center",
    fontWeight: "600",
  },
});
