import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

export default function Page() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const modalSlide = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(modalSlide, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 90,
    }).start();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(contentOffset / width);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
    }
  };

  const scrollToStep = (step: number) => {
    scrollViewRef.current?.scrollTo({
      x: step * width,
      animated: true,
    });
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(modalSlide, {
        toValue: 0,
        duration: 800,
        delay: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, modalSlide]);

  const onboardingSteps = [
    {
      title: "No more calorie counting.",
      subtitle: "A high-protein diet helps with:",
      benefits: [
        "Lean Muscle Growth",
        "Fat Loss",
        "Quicker Recovery",
        "All-Day Energy",
      ],
    },
    {
      title: "No more calorie counting.",
      subtitle: "A high-protein diet helps with:",
      benefits: [
        "Lean Muscle Growth",
        "Fat Loss",
        "Quicker Recovery",
        "All-Day Energy",
      ],
    },
    {
      title: "No more calorie counting.",
      subtitle: "A high-protein diet helps with:",
      benefits: [
        "Lean Muscle Growth",
        "Fat Loss",
        "Quicker Recovery",
        "All-Day Energy",
      ],
    },
  ];

  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {onboardingSteps.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stepDot,
              {
                backgroundColor: currentStep === index ? "#007AFF" : "#D1D1D6",
                transform: [
                  {
                    scale:
                      currentStep === index
                        ? fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          })
                        : 1,
                  },
                ],
              },
            ]}
          />
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
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
          >
            {onboardingSteps.map((step, index) => (
              <View key={index} style={styles.modalContent}>
                <Text style={styles.tagline}>{step.title}</Text>
                <Text style={styles.subtitle}>{step.subtitle}</Text>
                <View style={styles.benefitsList}>
                  {step.benefits.map((benefit, index) => (
                    <Text style={styles.benefit} key={index}>
                      {benefit}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          {renderStepIndicators()}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={() => {
                const prevStep = Math.max(0, currentStep - 1);
                scrollToStep(prevStep);
              }}
              disabled={currentStep === 0}
            >
              <Text
                style={[
                  styles.buttonText,
                  currentStep === 0 && styles.buttonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button]}
              onPress={async () => {
                if (currentStep < onboardingSteps.length - 1) {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  scrollToStep(currentStep + 1);
                } else {
                  await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  // router.push("/sign-up");
                  router.push("/onboarding");
                }
              }}
            >
              <Text style={[styles.buttonText]}>
                {currentStep === onboardingSteps.length - 1
                  ? "Get Started"
                  : "Next"}
              </Text>
            </TouchableOpacity>
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
        <Text style={styles.title}>Protein AI</Text>
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
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#FCE9BC", // Warm cream color
    marginBottom: "50%",
    fontWeight: "bold",
  },
  tagline: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 24,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 24,
  },
  benefitsList: {
    marginBottom: 32,
  },
  benefit: {
    fontSize: 32,
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
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
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
    backgroundColor: "#D9D0C7",
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
});
