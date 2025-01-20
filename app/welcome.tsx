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

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

export default function Page() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const logoScale = useSharedValue(0.8);
  const modalSlide = useSharedValue(height);
  const dotScale = useSharedValue(1);

  useEffect(() => {
    modalSlide.value = withSequence(
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
      }),
      withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
    );

    logoScale.value = withSpring(1, {
      damping: 20,
      stiffness: 90,
    });
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(contentOffset / width);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
    }
  };

  useEffect(() => {
    modalSlide.value = withSequence(
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
      }),
      withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
    );
  }, [logoScale, modalSlide]);

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
            // scrollEventThrottle={16}
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
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    marginTop: 40,
    marginBottom: 40,
  },
  tagline: {
    fontSize: 40,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 16,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginTop: 32,
    marginBottom: 16,
  },
  description: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginVertical: 8,
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
    padding: 16,
    borderRadius: 32,
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 24,
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
    height: height * 0.7,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  modalView: {
    flex: 1,
  },
  modalContent: {
    width: width,
    padding: 24,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    gap: 16,
    marginHorizontal: 24,
    marginBottom: 24,
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
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    opacity: 0.8,
  },
});
