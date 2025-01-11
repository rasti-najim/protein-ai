import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Pressable,
  useWindowDimensions,
  LayoutChangeEvent,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { CircularProgress } from "@/components/circular-progress";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, useMemo, useState } from "react";
import { Streak } from "@/components/streak";
import { BlurOverlay } from "@/components/blur-overlay";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

interface Meal {
  name: string;
  protein: number;
}

export default function Index() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["70%"], []);
  const { width: screenWidth } = useWindowDimensions();
  const menuWidth = Math.min(screenWidth * 0.6, 250); // 60% of screen width, max 250px
  const [menuItemWidths, setMenuItemWidths] = useState<{
    [key: string]: number;
  }>({});

  const dailyGoal = 200;
  const currentProtein = 115;
  const progress = currentProtein / dailyGoal;

  const meals: Meal[] = [
    { name: "Teriyaki Beef Bowl", protein: 61 },
    { name: "Protein Bar", protein: 18 },
    { name: "Scrambled Eggs", protein: 36 },
  ];

  const handleBadgePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.expand();
    // router.push("/(app)/(tabs)/home/streak");
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setIsBottomSheetVisible(false);
    }
  }, []);

  const toggleMenu = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFabExpanded ? 0 : 1;
    setIsFabExpanded(!isFabExpanded);
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const onTextLayout = (event: LayoutChangeEvent, key: string) => {
    const { width } = event.nativeEvent.layout;
    setMenuItemWidths((prev) => ({
      ...prev,
      [key]: width + 80, // Add padding for icon and spacing
    }));
  };

  const getMenuItemStyle = (key: string) => ({
    ...styles.fabMenuItem,
    width: menuItemWidths[key] || "auto",
    minWidth: Math.min(screenWidth * 0.4, 200), // Minimum width
  });

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Navigate to upload screen with the selected image
    }
  };

  const renderFloatingButton = () => (
    <>
      {isFabExpanded && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: menuAnimation,
              zIndex: 0,
            },
          ]}
        >
          <BlurView
            intensity={10}
            tint="dark"
            style={{
              position: "absolute",
              top: -100, // Extend beyond screen bounds
              left: 0,
              right: 0,
              bottom: -100, // Extend beyond screen bounds
            }}
          />
        </Animated.View>
      )}
      <View style={[styles.fabContainer, { zIndex: 2 }]}>
        <Animated.View
          style={[
            styles.fabMenu,
            {
              opacity: menuAnimation,
              transform: [
                {
                  translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            style={getMenuItemStyle("manual") as ViewStyle}
            onPress={() => {
              toggleMenu();
              router.push("/(app)/(tabs)/home/manual" as any);
            }}
          >
            <Text
              style={styles.menuItemText}
              onLayout={(e) => onTextLayout(e, "manual")}
            >
              Enter Manually
            </Text>
            <FontAwesome6 name="pencil" size={24} color="#2A2A2A" />
          </Pressable>

          <Pressable
            style={getMenuItemStyle("upload") as ViewStyle}
            onPress={async () => {
              toggleMenu();
              await handleImagePick();
            }}
          >
            <Text
              style={styles.menuItemText}
              onLayout={(e) => onTextLayout(e, "upload")}
            >
              Upload Photo
            </Text>
            <FontAwesome6 name="image" size={24} color="#2A2A2A" />
          </Pressable>

          <Pressable
            style={getMenuItemStyle("camera") as ViewStyle}
            onPress={() => {
              toggleMenu();
              router.push("/home/camera");
            }}
          >
            <Text
              style={styles.menuItemText}
              onLayout={(e) => onTextLayout(e, "camera")}
            >
              Take Photo
            </Text>
            <FontAwesome6 name="camera" size={24} color="#2A2A2A" />
          </Pressable>
        </Animated.View>

        <Pressable style={styles.fab} onPress={toggleMenu}>
          <FontAwesome6
            name={isFabExpanded ? "minus" : "plus"}
            size={32}
            color="#FCE9BC"
          />
        </Pressable>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <Image
        source={require("@/assets/images/background.png")}
        style={styles.background}
        contentFit="cover"
      /> */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Protein AI</Text>
          <Pressable onPress={handleBadgePress}>
            <View style={styles.badge}>
              <Text style={styles.badgeNumber}>1 🌱</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Today</Text>
        <FontAwesome6
          name="bolt"
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

      {!isBottomSheetVisible && renderFloatingButton()}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        index={-1}
        backgroundStyle={styles.bottomSheetBackground}
        backdropComponent={BlurOverlay}
        enablePanDownToClose
        style={{
          zIndex: 3, // Higher than tab bar
        }}
        handleIndicatorStyle={{
          backgroundColor: "#FCE9BC",
        }}
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
  background: {
    ...StyleSheet.absoluteFillObject,
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
    padding: 20,
  },
  bottomSheetBackground: {
    backgroundColor: "#333333",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 10,
    alignItems: "center",
  },
  fabBackground: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    transform: [{ scale: 1.1 }],
  },
  fab: {
    backgroundColor: "#333333",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  fabMenu: {
    position: "absolute",
    bottom: 60,
    right: 0,
    gap: 8,
  },
  fabMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    backgroundColor: "#FCE9BC",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItemText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
  },
  blurOverlay: {
    position: "absolute",
    top: -100,
    left: 0,
    right: 0,
    bottom: -100,
    zIndex: 1,
  },
});
