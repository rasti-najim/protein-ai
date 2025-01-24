import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScanFrame } from "@/components/scan-frame";
import { useRouter } from "expo-router";
import { usePhoto } from "@/components/photo-context";
import { Button } from "@/components/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

export default function Page() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { setPhoto } = usePhoto();
  const posthog = usePostHog();
  const handleCapture = async () => {
    if (!cameraRef.current) return;

    console.log("Capture pressed");
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
      });
      if (!photo) return;
      console.log(photo);
      setPhoto(photo);
      posthog.capture("user_scanned_meal");
      router.dismiss();
    } catch (error) {
      console.error("Error capturing photo", error);
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
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
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="close" size={32} color="#FCE9BC" />
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
              style={styles.flashButton}
              onPress={() => setFlash(!flash)}
            >
              <MaterialCommunityIcons
                name={flash ? "flash" : "flash-off"}
                size={24}
                color="#FCE9BC"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
  },
  scanFrame: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginVertical: 40,
  },
  frameImage: {
    width: "100%",
    height: "100%",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(252, 233, 188, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FCE9BC",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FCE9BC",
  },
  text: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#333333",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  buttonText: {
    color: "#FCE9BC",
    fontSize: 20,
    fontFamily: "Platypi",
    fontWeight: "600",
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
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSpacer: {
    width: 48, // Same as flashButton width for symmetry
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSpacer: {
    width: 48, // Same width as closeButton for symmetry
  },
});
