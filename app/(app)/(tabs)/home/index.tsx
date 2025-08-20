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
  Alert,
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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import supabase from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import { DateTime } from "luxon";
import { useAuth } from "@/components/auth-context";
import { MealSkeleton } from "@/components/meals-skeleton";
import { GoalReached } from "@/components/goal-reached";
import { MealDetails, type MealDetailsData } from "@/components/meal-details";
import * as StoreReview from "expo-store-review";
import { usePhoto } from "@/components/photo-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@/components/button";
import Superwall from "@superwall/react-native-superwall";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue } from "react-native-reanimated";
import { useAnimatedStyle } from "react-native-reanimated";
import { usePostHog } from "posthog-react-native";
import { useStreakQuery } from "@/hooks/useStreakQuery";

export interface Meal {
  id?: number;
  name: string;
  protein: number;
  scanned?: boolean; // Keep for backward compatibility
  logging_method?: 'photo_scan' | 'manual_entry';
  created_at: string;
}

// StreakData interface removed - now using useStreakQuery hook

export default function Index() {
  const { user } = useAuth();
  const posthog = usePostHog();
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
  const [selectedMeal, setSelectedMeal] = useState<MealDetailsData | null>(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const { photo: scannedPhoto } = usePhoto();
  const { data: streakData } = useStreakQuery();
  const currentStreak = streakData?.length || 0;
  const progressPulseAnim = useRef(new Animated.Value(1)).current;

  const checkIfWeShouldResetGoalMessage = async () => {
    try {
      const storedDate = await AsyncStorage.getItem("goalMessageDate");
      const today = DateTime.now().toFormat("yyyy-MM-dd");

      if (!storedDate || storedDate !== today) {
        // If there's no stored date or it's a different day, reset
        setShowGoalReached(false);
        await AsyncStorage.setItem("goalMessageDate", today);
        await AsyncStorage.setItem("hasShownGoalReached", "false");
      } else {
        // Same day, so don't show the message if it was already shown
        const seenMsg = await AsyncStorage.getItem("hasShownGoalReached");
        setShowGoalReached(false);
      }
    } catch (e) {
      console.error("Failed to check or reset goal message status", e);
    }
  };

  const checkForFirstMealReview = async () => {
    try {
      const hasShownReview = await AsyncStorage.getItem("hasShownStoreReview");
      const nextPromptDate = await AsyncStorage.getItem("storeReviewNextPrompt");
      const mealCount = await AsyncStorage.getItem("totalMealsLogged");
      
      if (__DEV__) {
        console.log('🔍 Review Check:', {
          hasShownReview,
          nextPromptDate,
          mealCount,
          currentTime: DateTime.now().toISO(),
        });
      }
      
      // TESTING: Force show review prompt (remove this for production)
      if (__DEV__ && false) { // Set to true to test
        setTimeout(() => {
          setShowStoreReview(true);
        }, 1000);
        return;
      }
      
      // Don't show if user already rated the app
      if (hasShownReview === "true") {
        return;
      }
      
      // Check if it's time to show again after "Maybe Later"
      if (nextPromptDate) {
        const now = DateTime.now();
        const nextPrompt = DateTime.fromISO(nextPromptDate);
        if (now < nextPrompt) {
          return; // Not time yet
        }
      }
      
      const mealCountNum = parseInt(mealCount || "0");
      
      // Show review prompt only after meaningful usage (3+ meals) OR if it's time for retry
      const shouldShowForUsage = mealCountNum >= 3;
      const shouldShowForRetry = nextPromptDate && DateTime.now() >= DateTime.fromISO(nextPromptDate);
      
      if (shouldShowForUsage || shouldShowForRetry) {
        setTimeout(async () => {
          try {
            if (await StoreReview.hasAction()) {
              await StoreReview.requestReview();
              await AsyncStorage.setItem("hasShownStoreReview", "true");
              posthog.capture("store_review_requested");
            }
          } catch (error) {
            console.error("Error requesting review:", error);
          }
        }, 2000); // Show after 2 seconds delay to not interrupt user flow
      }
    } catch (e) {
      console.error("Failed to check store review status", e);
    }
  };

  useEffect(() => {
    checkIfWeShouldResetGoalMessage();
    checkForFirstMealReview(); // Also check if we should show review on app load
  }, []);

  // Streak data is now handled by useStreakQuery hook

  useFocusEffect(
    useCallback(() => {
      const fetchDailyGoal = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user?.id!);
        setDailyGoal(data?.[0]?.daily_protein_target || 200);
        // setCurrentProtein(data?.[0]?. || 115);
      };
      fetchDailyGoal();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
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
              id: meal.id,
              name: meal.name,
              protein: meal.protein_amount,
              scanned: meal.logging_method === 'photo_scan', // Keep for backward compatibility
              logging_method: meal.logging_method,
              created_at: meal.created_at || "",
            }))
          );
          
          // Update total meal count and check for review prompt
          try {
            const storedCount = await AsyncStorage.getItem("totalMealsLogged");
            const currentStoredCount = storedCount ? parseInt(storedCount) : 0;
            
            if (data.length > currentStoredCount) {
              await AsyncStorage.setItem("totalMealsLogged", data.length.toString());
              // Check if we should show review after meaningful usage (could be from manual entry)
              if (currentStoredCount < 3 && data.length >= 3) {
                checkForFirstMealReview();
              }
            }
          } catch (e) {
            console.error("Failed to update meal count from fetch", e);
          }
        }
      };
      fetchMeals();
    }, [])
  );

  useEffect(() => {
    const checkGoalReached = async () => {
      const seenMsg = await AsyncStorage.getItem("hasShownGoalReached");
      const today = DateTime.now().toFormat("yyyy-MM-dd");
      const storedDate = await AsyncStorage.getItem("goalMessageDate");

      if (
        currentProtein >= dailyGoal &&
        currentProtein > 0 &&
        seenMsg !== "true" &&
        storedDate === today
      ) {
        // Haptic feedback for goal completion
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Progress circle celebration animation
        Animated.sequence([
          Animated.timing(progressPulseAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(progressPulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(progressPulseAnim, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(progressPulseAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        
        setShowGoalReached(true);
        await AsyncStorage.setItem("hasShownGoalReached", "true");
        await AsyncStorage.setItem("goalMessageDate", today);
        
        // Streak data will be automatically updated by React Query
        
        // Analytics tracking
        posthog.capture("daily_protein_goal_reached", {
          protein_amount: currentProtein,
          goal_amount: dailyGoal,
          excess_protein: currentProtein - dailyGoal,
        });
      }
    };
    checkGoalReached();
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
    posthog.capture("user_viewed_streak");
    router.push({
      pathname: "/home/streak",
      params: {
        streak: JSON.stringify({
          current_streak: currentStreak,
          max_streak: 0, // Can be updated if you have this data
          days_to_next_level: 0, // Can be updated if you have this data
        }),
      },
    });
  }, [currentStreak]);

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
    Superwall.shared.register("upload_photo").then(async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        posthog.capture("user_uploaded_meal");
        // Navigate to upload screen with the selected image
        await handleUpload(result.assets[0]);
      }
    });
  };

  const handleUpload = async (photo: ImagePicker.ImagePickerAsset) => {
    setIsScanning(true);
    // Add temporary loading state to meals
    const tempId = DateTime.now().toMillis();

    // Add artificial delay for consistency
    await new Promise((resolve) => setTimeout(resolve, 500));

    setMeals((prev) => [
      {
        name: "",
        protein: 0,
        scanned: true,
        logging_method: 'photo_scan',
        id: tempId,
        created_at: DateTime.now().toUTC().toISO(),
      },
      ...prev,
    ]);

    try {
      if (!photo?.base64) return;

      // Add minimum loading time for consistency
      const uploadStartTime = Date.now();

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

      // Ensure minimum loading time of 1.5 seconds
      const elapsedTime = Date.now() - uploadStartTime;
      if (elapsedTime < 1500) {
        await new Promise((resolve) => setTimeout(resolve, 1500 - elapsedTime));
      }

      if (scanError) {
        console.error(scanError);
        return;
      }

      // Remove the loading skeleton
      setMeals((prev) => prev.filter((meal) => meal.id !== tempId));

      // Check if the image is not a meal
      if (scanData.not_a_meal) {
        Alert.alert(
          "Not a Meal",
          "The image you uploaded doesn't appear to be a meal. Please try again with a different photo."
        );
        return;
      }

      // If it is a meal, update the UI with the meal data
      setMeals((prev) => [
        {
          name: scanData.meal_name,
          protein: scanData.protein_g,
          scanned: true,
          logging_method: 'photo_scan',
          created_at: DateTime.now().toUTC().toISO(),
        },
        ...prev,
      ]);

      // Update current protein intake
      setCurrentProtein((prev) => prev + scanData.protein_g);
      
      // Track meal count for store review
      try {
        const currentCount = await AsyncStorage.getItem("totalMealsLogged");
        const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
        await AsyncStorage.setItem("totalMealsLogged", newCount.toString());
        
        // Check if we should show store review after meaningful usage (3+ meals)
        if (newCount === 3) {
          checkForFirstMealReview();
        }
      } catch (e) {
        console.error("Failed to update meal count", e);
      }
      
      posthog.capture("meal_scanned", {
        meal_name: scanData.meal_name,
        protein_amount: scanData.protein_g,
        current_streak: scanData.currentStreak,
        streak_extended: scanData.streakExtended,
      });
    } catch (error) {
      console.error(error);
      // Remove the loading skeleton in case of error
      setMeals((prev) => prev.filter((meal) => meal.id !== tempId));
      posthog.capture("meal_scan_failed");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualPress = () => {
    Superwall.shared.register("manual_entry").then(() => {
      router.push({
        pathname: "/(app)/(tabs)/home/manual",
        // params: {
        //   setMeals: setMeals,
        //   setCurrentProtein: setCurrentProtein,
        // },
      });
    });
    toggleMenu();
  };

  const handleCameraPress = () => {
    Superwall.shared.register("scan_entry").then(() => {
      router.push("/home/camera");
    });
    toggleMenu();
  };

  const handleMealPress = async (meal: Meal) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMeal({
      id: meal.id,
      name: meal.name,
      protein: meal.protein,
      scanned: meal.scanned,
      logging_method: meal.logging_method,
      created_at: meal.created_at,
    });
    setShowMealDetails(true);
  };

  const handleMealUpdated = (updatedMeal: MealDetailsData) => {
    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.id === updatedMeal.id 
          ? { ...meal, name: updatedMeal.name, protein: updatedMeal.protein }
          : meal
      )
    );
    
    // Update current protein total
    const proteinDifference = updatedMeal.protein - (selectedMeal?.protein || 0);
    setCurrentProtein(prev => prev + proteinDifference);
    
    // Update selected meal for the modal
    setSelectedMeal(updatedMeal);
  };

  const handleDeleteMeal = async (meal: MealDetailsData) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      "Delete Meal",
      `Are you sure you want to delete "${meal.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (meal.id) {
                const { error } = await supabase
                  .from("meals")
                  .delete()
                  .eq("id", meal.id);

                if (error) {
                  console.error("Error deleting meal:", error);
                  Alert.alert("Error", "Failed to delete meal. Please try again.");
                  return;
                }

                // Update local state
                setMeals((prev) => prev.filter((m) => m.id !== meal.id));
                setCurrentProtein((prev) => prev - meal.protein);
                
                // Close modal
                setShowMealDetails(false);
                setSelectedMeal(null);

                // Analytics
                posthog.capture("meal_deleted", {
                  meal_name: meal.name,
                  protein_amount: meal.protein,
                });

                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error("Error deleting meal:", error);
              Alert.alert("Error", "Failed to delete meal. Please try again.");
            }
          },
        },
      ]
    );
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
              zIndex: 1,
            },
          ]}
          pointerEvents={isFabExpanded ? "auto" : "none"}
        >
          <BlurView
            intensity={10}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
      <View style={[styles.fabContainer]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.fabMenu,
            {
              opacity: menuAnimation,
              transform: [
                {
                  translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
                {
                  scale: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={isFabExpanded ? "auto" : "none"}
        >
          {[
            {
              text: "Enter Manually",
              icon: "pencil",
              onPress: handleManualPress,
            },
            {
              text: "Upload Photo",
              icon: "image",
              onPress: async () => {
                toggleMenu();
                await handleImagePick();
              },
            },
            { text: "Take Photo", icon: "camera", onPress: handleCameraPress },
          ].map((item, index) => (
            <Animated.View
              key={item.text}
              style={{
                transform: [
                  {
                    translateX: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
                opacity: menuAnimation,
              }}
            >
              <Button
                style={[
                  styles.fabMenuItem,
                  {
                    marginBottom: index === 2 ? 0 : 12,
                  },
                ]}
                onPress={item.onPress}
              >
                <Text style={styles.menuItemText}>{item.text}</Text>
                <FontAwesome6 name={item.icon} size={24} color="#2A2A2A" />
              </Button>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View
          style={[
            styles.fab,
            {
              transform: [
                {
                  rotate: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "45deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable onPress={toggleMenu} style={styles.fabButton}>
            <FontAwesome6 name="plus" size={32} color="#FCE9BC" />
          </Pressable>
        </Animated.View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {__DEV__ && (
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Pressable 
                  onPress={async () => {
                    try {
                      if (await StoreReview.hasAction()) {
                        await StoreReview.requestReview();
                      }
                    } catch (error) {
                      console.error("Error requesting review:", error);
                    }
                  }}
                  style={{
                    backgroundColor: '#FF6B35',
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#2A2A2A',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#FCE9BC', fontFamily: 'Platypi' }}>Review</Text>
                </Pressable>
                <Pressable 
                  onPress={async () => {
                    await AsyncStorage.multiRemove([
                      'hasShownStoreReview', 
                      'storeReviewNextPrompt', 
                      'totalMealsLogged'
                    ]);
                    console.log('🧹 Reset review state');
                  }}
                  style={{
                    backgroundColor: '#7FEA71',
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#2A2A2A',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#2A2A2A', fontFamily: 'Platypi' }}>Reset</Text>
                </Pressable>
              </View>
            )}
            <Pressable onPress={handleBadgePress}>
              <View style={styles.badge}>
                <Text style={styles.badgeNumber}>{currentStreak}</Text>
                <FontAwesome6 name="fire" size={16} color="#FF6B35" />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.todayContainer}>
          <Text style={styles.sectionTitle}>Today</Text>
          <FontAwesome6
            name="fire"
            size={20}
            color="#FF6B35"
            style={styles.streakIcon}
          />
          <FontAwesome6
            name="bolt"
            size={16}
            color="#7FEA71"
            style={styles.lightningIcon}
          />
        </View>

        <Animated.View 
          style={[
            styles.progressContainer,
            {
              transform: [{ scale: progressPulseAnim }],
            },
          ]}
        >
          <CircularProgress
            progress={progress}
            size={200}
            strokeWidth={8}
            color={currentProtein >= dailyGoal ? "#7FEA71" : "#FF6B6B"}
            backgroundColor="#E0E0E0"
            goalText={`${dailyGoal}g`}
          >
            <View style={styles.progressContent}>
              <Text style={styles.progressNumber}>{currentProtein}g</Text>
              <Text style={styles.progressLabel}>protein</Text>
            </View>
          </CircularProgress>
        </Animated.View>

        <Text style={styles.sectionTitle}>Meals</Text>
        <View style={styles.mealsList}>
          {meals.length === 0 ? (
            <Text style={styles.placeholderText}>
              No meals logged today. Tap + to add your first meal!
            </Text>
          ) : (
            meals.map((meal, index) => {
              if (isScanning && !meal.scanned) {
                return <MealSkeleton key={index} showCalculating={true} />;
              }
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.mealItem}
                  onPress={() => handleMealPress(meal)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mealInfo}>
                    <Text
                      style={styles.mealName}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
                    </Text>
                    <View style={styles.proteinBadge}>
                      <Text style={styles.mealProtein}>{meal.protein}g</Text>
                    </View>
                  </View>
                  <View style={styles.mealMeta}>
                    {meal.created_at && (
                      <Text style={styles.mealTime}>
                        {DateTime.fromISO(meal.created_at).toFormat("h:mm a")}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {renderFloatingButton()}

      {showGoalReached && (
        <GoalReached
          onClose={() => {
            setShowGoalReached(false);
            setHasShownGoalReached(true);
          }}
        />
      )}

      <MealDetails
        meal={selectedMeal}
        visible={showMealDetails}
        onClose={() => {
          setShowMealDetails(false);
          setSelectedMeal(null);
        }}
        onDelete={handleDeleteMeal}
        onMealUpdated={handleMealUpdated}
      />

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
    zIndex: 0,
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
  streakIcon: {
    marginBottom: 8,
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
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(42, 42, 42, 0.1)",
  },
  mealInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 8,
  },
  mealName: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    flex: 1,
    lineHeight: 24,
  },
  proteinBadge: {
    backgroundColor: "#333333",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealProtein: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    fontWeight: "600",
  },
  mealMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mealTime: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    flexShrink: 0,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
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
    bottom: 20,
    right: 20,
    alignItems: "flex-end",
    pointerEvents: "box-none",
    zIndex: 2,
  },
  fabMenu: {
    marginBottom: 16,
    alignItems: "flex-end",
  },
  fab: {
    backgroundColor: "#333333",
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fabMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    backgroundColor: "#FCE9BC",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#2A2A2A",
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
