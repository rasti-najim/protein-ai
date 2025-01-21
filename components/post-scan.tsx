import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CircularProgress } from "@/components/circular-progress";
import { useRouter } from "expo-router";

interface PostScanProps {
  foodName: string;
  proteinAmount: number;
  onEdit: () => void;
}

export const PostScan = ({
  foodName,
  proteinAmount,
  onEdit,
}: PostScanProps) => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Protein AI</Text>

      <View style={styles.content}>
        <CircularProgress
          progress={1}
          size={280}
          strokeWidth={12}
          progressColor="#4CAF50"
        >
          <View style={styles.progressContent}>
            <Text style={styles.proteinAmount}>{proteinAmount}g</Text>
            <Text style={styles.proteinLabel}>protein</Text>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="flash" size={32} color="#4CAF50" />
            </View>
          </View>
        </CircularProgress>

        <Text style={styles.foodName}>{foodName}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContent: {
    alignItems: "center",
  },
  proteinAmount: {
    fontSize: 64,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  proteinLabel: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  foodName: {
    fontSize: 32,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginTop: 40,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
  },
  button: {
    flex: 1,
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
  primaryButton: {
    backgroundColor: "#333333",
  },
  primaryButtonText: {
    color: "#FCE9BC",
  },
});
