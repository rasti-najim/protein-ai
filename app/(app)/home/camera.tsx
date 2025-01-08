import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

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
      <CameraView style={styles.camera} facing="back">
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          <Text style={styles.title}>Scan Meal or Barcode</Text>

          <View style={styles.scanFrame}>
            <Image
              //   source={require("@/assets/images/scan-frame.png")}
              style={styles.frameImage}
              contentFit="contain"
            />
          </View>

          <TouchableOpacity style={styles.flashButton}>
            <MaterialCommunityIcons name="flash" size={24} color="#FCE9BC" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
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
  flashButton: {
    position: "absolute",
    bottom: 40,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
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
});
