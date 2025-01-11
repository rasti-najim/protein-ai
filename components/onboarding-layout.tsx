import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { CircularProgress } from "./circular-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
  showLayout?: boolean;
  hideBottomBar?: boolean;
}

export const OnboardingLayout = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isNextDisabled = false,
  nextButtonText = "Continue",
  showLayout = true,
  hideBottomBar = false,
}: OnboardingLayoutProps) => {
  if (!showLayout) {
    return <>{children}</>;
  }

  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/steak-dark.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
          <View
            style={[styles.modalView, { paddingBottom: safeAreaInsets.bottom }]}
          >
            {children}

            {!hideBottomBar && (
              <View style={styles.bottomBar}>
                <View style={styles.bottomContent}>
                  <CircularProgress
                    progress={(currentStep + 1) / totalSteps}
                    size={48}
                    color="#4CAF50"
                    backgroundColor="#E0E0E0"
                    strokeWidth={4}
                  >
                    <MaterialCommunityIcons
                      name="lightning-bolt"
                      size={24}
                      color="#4CAF50"
                    />
                  </CircularProgress>
                </View>

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isNextDisabled && styles.buttonDisabled,
                    hideBottomBar && { width: "100%" },
                  ]}
                  onPress={onNext}
                  disabled={isNextDisabled}
                >
                  <Text style={styles.continueButtonText}>
                    {hideBottomBar ? "Finish" : nextButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalView: {
    flex: 1,
    backgroundColor: "#FCE9BC",
    borderRadius: 40,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "90%",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#D9D0C7",
    borderRadius: 1.5,
    marginBottom: 32,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#513B2F",
    borderRadius: 1.5,
  },
  bottomBar: {
    marginTop: "auto",
    width: "100%",
    paddingHorizontal: 24,
  },
  bottomContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueButton: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    width: 160,
  },
  continueButtonText: {
    color: "#FCE9BC",
    fontSize: 20,
    fontFamily: "Platypi",
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
