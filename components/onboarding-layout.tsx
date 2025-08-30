import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";

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
  const safeAreaInsets = useSafeAreaInsets();

  if (!showLayout) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: "#fae5d2" }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <FontAwesome6 name="chevron-left" size={20} color="#333333" />
            </TouchableOpacity>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentStep + 1) / totalSteps) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {totalSteps}
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <View
            style={[styles.content, { paddingBottom: safeAreaInsets.bottom }]}
          >
            {children}

            {!hideBottomBar && (
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isNextDisabled && styles.buttonDisabled,
                  ]}
                  onPress={onNext}
                  disabled={isNextDisabled}
                >
                  <Text style={styles.continueButtonText}>
                    {hideBottomBar ? "Finish" : nextButtonText}
                  </Text>
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={20}
                    color="#fae5d2"
                    style={styles.buttonIcon}
                  />
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
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(51, 51, 51, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(51, 51, 51, 0.1)",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#333333",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  bottomBar: {
    marginTop: "auto",
    paddingTop: 24,
    paddingBottom: 16,
  },
  continueButton: {
    backgroundColor: "#333333",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "#fae5d2",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
