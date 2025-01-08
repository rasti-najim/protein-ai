import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { CircularProgress } from "@/components/circular-progress";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, useMemo, useState } from "react";
import { Streak } from "@/components/streak";
import { BlurOverlay } from "@/components/blur-overlay";
import { BlurView } from "expo-blur";

interface Meal {
  name: string;
  protein: number;
}

export default function Index() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["70%"], []);

  const dailyGoal = 200;
  const currentProtein = 115;
  const progress = currentProtein / dailyGoal;

  const meals: Meal[] = [
    { name: "Teriyaki Beef Bowl", protein: 61 },
    { name: "Protein Bar", protein: 18 },
    { name: "Scrambled Eggs", protein: 36 },
  ];

  const handleBadgePress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setIsBottomSheetVisible(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Protein AI</Text>
          <TouchableOpacity onPress={handleBadgePress}>
            <View style={styles.badge}>
              <Text style={styles.badgeNumber}>1</Text>
              <FontAwesome5 name="seedling" size={12} color="#4CAF50" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Today</Text>
        <MaterialCommunityIcons
          name="lightning-bolt"
          size={16}
          color="#4CAF50"
          style={styles.lightningIcon}
        />

        <View style={styles.progressContainer}>
          <CircularProgress
            progress={progress}
            size={200}
            strokeWidth={8}
            color="#4CAF50"
            backgroundColor="#E0E0E0"
          >
            <View style={styles.progressContent}>
              <Text style={styles.progressNumber}>{currentProtein}g</Text>
              <Text style={styles.progressLabel}>protein</Text>
              <Text style={styles.progressGoal}>{dailyGoal}g</Text>
            </View>
          </CircularProgress>
        </View>

        <Text style={styles.sectionTitle}>Meals</Text>
        <View style={styles.mealsList}>
          {meals.map((meal, index) => (
            <View key={index} style={styles.mealItem}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealProtein}>({meal.protein}g)</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>This Week</Text>
        <Text style={styles.placeholderText}>
          Ideally, we can show a graph here, but for now this just displays the
          blur mask
        </Text>
      </ScrollView>

      {/* <BlurOverlay visible={isBottomSheetVisible} /> */}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        // onChange={handleSheetChanges}
        index={0}
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={BlurOverlay}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Streak
            currentStreak={1}
            daysToNextLevel={2}
            onClose={() => {
              setIsBottomSheetVisible(false);
              bottomSheetRef.current?.close();
            }}
          />
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  badgeNumber: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 16,
  },
  lightningIcon: {
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressContent: {
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 48,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  progressLabel: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  progressGoal: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    marginTop: 4,
  },
  mealsList: {
    marginBottom: 32,
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(42, 42, 42, 0.1)",
  },
  mealName: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  mealProtein: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#666666",
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    fontStyle: "italic",
  },
  contentContainer: {
    flex: 1,
  },
  bottomSheetBackground: {
    backgroundColor: "#333333",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});
