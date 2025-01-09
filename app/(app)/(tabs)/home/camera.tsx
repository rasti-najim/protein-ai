import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScanFrame } from "@/components/scan-frame";
import { useRouter } from "expo-router";
import { PostScan } from "@/components/post-scan";

export default function Page() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPostScan, setIsPostScan] = useState(false);

  const handleCapture = async () => {
    console.log("Capture pressed");
    const photo = await cameraRef.current?.takePictureAsync();
    console.log(photo);
    setPhoto(photo?.uri ?? null);
    setIsScanning(true);
    setIsPostScan(true);
    // TODO: Implement camera capture
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

  if (isPostScan) {
    return <PostScan foodName="Chicken" proteinAmount={20} onEdit={() => {}} />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flash ? "on" : "off"}
      >
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="close" size={32} color="#FCE9BC" />
          </TouchableOpacity>

          <Text style={styles.title}>Scan Meal or Barcode</Text>

          <View style={styles.scanFrame}>
            <ScanFrame />
          </View>

          <View style={styles.buttonContainer}>
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
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    marginBottom: 40,
    textAlign: "center",
  },
  scanFrame: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  buttonText: {
    color: "#FCE9BC",
    fontSize: 20,
    fontFamily: "Platypi",
    fontWeight: "600",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
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
    position: "absolute",
    top: 20,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
