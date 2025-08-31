import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScanFrame } from "@/components/scan-frame";
import { useRouter } from "expo-router";
import { usePhoto } from "@/components/photo-context";

import { SafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function Page() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { setPhoto } = usePhoto();
  const posthog = usePostHog();

  // Animation values
  const captureScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  // Animated styles (must be before any conditional returns)
  const captureButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Button press animation
    captureScale.value = withSpring(0.8, { damping: 8 }, () => {
      captureScale.value = withSpring(1);
    });

    // Flash effect
    flashOpacity.value = withTiming(1, { duration: 100 }, () => {
      flashOpacity.value = withTiming(0, { duration: 200 });
    });

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
      });
      if (!photo) return;

      setPhoto(photo);
      posthog.capture("user_scanned_meal");

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      router.dismiss();
    } catch (error) {
      console.error("Error capturing photo", error);
      // Error haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <MaterialCommunityIcons
            name="camera-outline"
            size={80}
            color="#fae5d2"
            style={styles.permissionIcon}
          />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan your meals, we need access to your camera. Your photos are
            processed securely and never stored on our servers.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#333333"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash ? "on" : "off"}
      >
        {/* Flash overlay */}
        <Animated.View style={[styles.flashOverlay, flashAnimatedStyle]} />

        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="close" size={32} color="#fae5d2" />
            </TouchableOpacity>

            <Text style={styles.title}>Scan Meal</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.scanFrame}>
            <ScanFrame />
          </View>

          <View
            style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}
          >
            <TouchableOpacity
              style={[styles.flashButton, flash && styles.flashButtonActive]}
              onPress={() => setFlash(!flash)}
            >
              <MaterialCommunityIcons
                name={flash ? "flash" : "flash-off"}
                size={24}
                color={flash ? "#333333" : "#fae5d2"}
              />
            </TouchableOpacity>

            <Animated.View style={captureButtonAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && styles.captureButtonDisabled,
                ]}
                onPress={handleCapture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="large" color="#333333" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.buttonSpacer} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "#fae5d2",
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scanFrame: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(250, 229, 210, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fae5d2",
    shadowColor: "#fae5d2",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fae5d2",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  flashButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(51, 51, 51, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(250, 229, 210, 0.3)",
  },
  flashButtonActive: {
    backgroundColor: "#fae5d2",
    borderColor: "#fae5d2",
  },
  buttonSpacer: {
    width: 48,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(51, 51, 51, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(250, 229, 210, 0.3)",
  },
  headerSpacer: {
    width: 48,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    zIndex: 1000,
  },
  // Permission screen styles
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  permissionIcon: {
    marginBottom: 24,
    opacity: 0.8,
  },
  permissionTitle: {
    fontSize: 24,
    color: "#fae5d2",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: "rgba(250, 229, 210, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fae5d2",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButtonText: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "600",
  },
});
