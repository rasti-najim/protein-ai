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
import { FontAwesome6 } from "@expo/vector-icons";
import { CircularProgress } from "@/components/circular-progress";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { Streak } from "@/components/streak";
import { BlurOverlay } from "@/components/blur-overlay";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import supabase from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import { DateTime } from "luxon";
import { useAuth } from "@/components/auth-context";
import { MealSkeleton } from "@/components/meals-skeleton";
import { GoalReached } from "@/components/goal-reached";
import { usePhoto } from "@/components/photo-context";

export interface Meal {
  name: string;
  protein: number;
  scanned: boolean;
  // created_at: string;
}

interface StreakData {
  current_streak: number;
  max_streak: number;
  streak_name: string;
  streak_emoji: string;
}

export default function Index() {
  const { user } = useAuth();
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
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(200);
  const [currentProtein, setCurrentProtein] = useState<number>(115);
  const progress = currentProtein / dailyGoal;
  const [isScanning, setIsScanning] = useState(false);
  const [showGoalReached, setShowGoalReached] = useState(false);
  const [hasShownGoalReached, setHasShownGoalReached] = useState(false);
  const { photo: scannedPhoto } = usePhoto();
  const [streak, setStreak] = useState<StreakData>({
    current_streak: 0,
    max_streak: 0,
    streak_name: "",
    streak_emoji: "",
  });

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const { data, error } = await supabase
          .from("user_streak_view")
          .select("*")
          .eq("user_id", user?.id!);
        setStreak({
          current_streak: data?.[0]?.current_streak || 0,
          max_streak: data?.[0]?.max_streak || 0,
          streak_name: data?.[0]?.streak_name || "",
          streak_emoji: data?.[0]?.streak_emoji || "",
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStreak();
  }, [user?.id]);

  useEffect(() => {
    const fetchDailyGoal = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id!);
      setDailyGoal(data?.[0]?.daily_protein_target || 200);
      // setCurrentProtein(data?.[0]?. || 115);
    };
    fetchDailyGoal();
  }, [user?.id]);

  useEffect(() => {
    const fetchMeals = async () => {
      // Get today's date at midnight in UTC
      const today = DateTime.now().startOf("day").toISO();

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user?.id!)
        .gte("created_at", today)
        .order("created_at", { ascending: false });

      if (data) {
        // Calculate total protein intake for today
        const todaysTotalProtein = data.reduce(
          (sum, meal) => sum + meal.protein_amount,
          0
        );
        setCurrentProtein(todaysTotalProtein);

        // Set meals data
        setMeals(
          data.map((meal) => ({
            name: meal.name,
            protein: meal.protein_amount,
            scanned: true,
            created_at: meal.created_at || "",
          }))
        );
      }
    };
    fetchMeals();
  }, [user?.id]);

  useEffect(() => {
    if (currentProtein >= dailyGoal && !hasShownGoalReached) {
      setShowGoalReached(true);
      setHasShownGoalReached(true);
      setStreak((prev) => ({
        ...prev,
        current_streak: prev.current_streak + 1,
      }));
    }
  }, [currentProtein, dailyGoal]);

  useEffect(() => {
    if (scannedPhoto) {
      console.log("uploading photo", scannedPhoto.uri);
      handleUpload({
        uri: scannedPhoto.uri,
        fileName: `photo.${scannedPhoto.uri?.split(".")[1]}`,
        width: scannedPhoto.width,
        height: scannedPhoto.height,
        base64: scannedPhoto.base64,
      });
    }
  }, [scannedPhoto]);

  const handleBadgePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // bottomSheetRef.current?.expand();
    router.push({
      pathname: "/home/streak",
      params: { streak: JSON.stringify(streak) },
    });
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
    minWidth: Math.min(screenWidth * 0.45, 220), // Increased minimum width
  });

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      // Navigate to upload screen with the selected image
      await handleUpload(result.assets[0]);
    }
  };

  const handleUpload = async (photo: ImagePicker.ImagePickerAsset) => {
    setIsScanning(true);
    setMeals((prev) => [
      {
        name: "",
        protein: 0,
        scanned: false,
      },
      ...prev,
    ]);
    try {
      if (!photo?.base64) return;
      const { data, error } = await supabase.storage
        .from("temp")
        .upload(
          `${user?.id}/${DateTime.now().toISO()}.${
            photo?.fileName?.split(".")[1]
          }`,
          decode(photo?.base64),
          {
            contentType: `${photo?.mimeType}`,
          }
        );

      if (error) {
        console.error(error);
        return;
      }

      const { data: scanData, error: scanError } =
        await supabase.functions.invoke("scan-photo", {
          body: {
            imagePath: data.path,
            createdAt: DateTime.now().toUTC().toISO(),
          },
        });

      if (scanError) {
        console.error(scanError);
        return;
      }

      // Remove the loading skeleton and update with actual data
      setMeals((prev) => {
        const filteredMeals = prev.filter((meal) => meal.scanned);
        return [
          {
            name: scanData.meal_name,
            protein: scanData.protein_g,
            scanned: true,
          },
          ...filteredMeals,
        ];
      });

      // Update current protein intake
      setCurrentProtein((prev) => prev + scanData.protein_g);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualPress = () => {
    router.push({
      pathname: "/(app)/(tabs)/home/manual",
      // params: {
      //   setMeals: setMeals,
      //   setCurrentProtein: setCurrentProtein,
      // },
    });
  };

  const handleCameraPress = () => {
    router.push("/home/camera");
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
            onPress={handleManualPress}
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
            onPress={handleCameraPress}
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
      <Image
        source={require("@/assets/images/background.png")}
        style={styles.background}
        contentFit="cover"
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Protein AI</Text>
          <Pressable onPress={handleBadgePress}>
            <View style={styles.badge}>
              <Text style={styles.badgeNumber}>
                {streak.current_streak} {streak.streak_emoji}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.todayContainer}>
          <Text style={styles.sectionTitle}>Today</Text>
          <FontAwesome6
            name="bolt"
            size={16}
            color="#7FEA71"
            style={styles.lightningIcon}
          />
        </View>

        <View style={styles.progressContainer}>
          <CircularProgress
            progress={progress}
            size={200}
            strokeWidth={8}
            color="#7FEA71"
            backgroundColor="#E0E0E0"
            goalText={`${dailyGoal}g`}
          >
            <View style={styles.progressContent}>
              <Text style={styles.progressNumber}>{currentProtein}g</Text>
              <Text style={styles.progressLabel}>protein</Text>
            </View>
          </CircularProgress>
        </View>

        <Text style={styles.sectionTitle}>Meals</Text>
        <View style={styles.mealsList}>
          {meals.map((meal, index) => {
            if (isScanning && !meal.scanned) {
              return <MealSkeleton key={index} />;
            }
            return (
              <View key={index} style={styles.mealItem}>
                <Text style={styles.mealName}>
                  {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
                </Text>
                <Text style={styles.mealProtein}>({meal.protein}g)</Text>
              </View>
            );
          })}
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

      {showGoalReached && (
        <GoalReached onClose={() => setShowGoalReached(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#FCE9BC",
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
  todayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    bottom: 80, // Increased bottom spacing
    right: 0,
    gap: 12, // Increased gap between items
  },
  fabMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16, // Increased gap between text and icon
    backgroundColor: "#FCE9BC",
    paddingVertical: 16, // Increased vertical padding
    paddingHorizontal: 20, // Increased horizontal padding
    borderRadius: 20, // Increased border radius
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, // Increased shadow offset
    },
    shadowOpacity: 0.2,
    shadowRadius: 6, // Increased shadow radius
    elevation: 8, // Increased elevation for Android
    borderWidth: 2, // Added border
    borderColor: "#2A2A2A", // Added border color
  },
  menuItemText: {
    fontSize: 22, // Increased font size
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
