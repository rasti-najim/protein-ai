import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { DateTime } from "luxon";
import supabase from "@/lib/supabase";

export interface MealDetailsData {
  id?: number;
  name: string;
  protein: number;
  scanned?: boolean; // Keep for backward compatibility
  logging_method?: 'photo_scan' | 'manual_entry';
  created_at: string;
}

interface MealDetailsProps {
  meal: MealDetailsData | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: (meal: MealDetailsData) => void;
  onDelete: (meal: MealDetailsData) => void;
  onMealUpdated?: (updatedMeal: MealDetailsData) => void;
}

export const MealDetails = ({ meal, visible, onClose, onEdit, onDelete, onMealUpdated }: MealDetailsProps) => {
  // Helper function to determine if meal is photo-based
  const isPhotoMeal = (meal: MealDetailsData) => {
    // Use new logging_method field if available, fallback to scanned for backward compatibility
    if (meal.logging_method) {
      return meal.logging_method === 'photo_scan';
    }
    return meal.scanned || false;
  };
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedProtein, setEditedProtein] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && meal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setEditedName(meal.name);
      setEditedProtein(meal.protein.toString());
      setIsEditMode(false);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
      setIsEditMode(false);
    }
  }, [visible, meal]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleEdit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (meal && !isEditMode) {
      setIsEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!meal || !editedName.trim() || isNaN(Number(editedProtein))) return;
    
    setIsSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const { error } = await supabase
        .from("meals")
        .update({
          name: editedName.trim(),
          protein_amount: Number(editedProtein),
        })
        .eq("id", meal.id);
      
      if (error) {
        Alert.alert("Error", "Failed to update meal. Please try again.");
        return;
      }
      
      const updatedMeal = {
        ...meal,
        name: editedName.trim(),
        protein: Number(editedProtein),
      };
      
      if (onMealUpdated) {
        onMealUpdated(updatedMeal);
      }
      
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating meal:", error);
      Alert.alert("Error", "Failed to update meal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditedName(meal?.name || "");
    setEditedProtein(meal?.protein.toString() || "");
    setIsEditMode(false);
  };

  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (meal) {
      onDelete(meal);
    }
  };

  if (!meal) return null;

  const formatTime = (dateString: string) => {
    try {
      return DateTime.fromISO(dateString).toFormat("h:mm a");
    } catch {
      return "Unknown time";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = DateTime.fromISO(dateString);
      const today = DateTime.now().startOf('day');
      const mealDate = date.startOf('day');
      
      if (mealDate.equals(today)) {
        return "Today";
      } else if (mealDate.equals(today.minus({ days: 1 }))) {
        return "Yesterday";
      } else {
        return date.toFormat("MMM d, yyyy");
      }
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.mealIconContainer}>
              <FontAwesome6 
                name={isPhotoMeal(meal) ? "camera" : "pen"} 
                size={24} 
                color="#FF6B35" 
              />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <FontAwesome6 name="xmark" size={20} color="#2A2A2A" />
            </TouchableOpacity>
          </View>

          {/* Meal Info */}
          <View style={styles.content}>
            {isEditMode ? (
              <View style={styles.editContainer}>
                <Text style={styles.editLabel}>Meal Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter meal name"
                  placeholderTextColor="#666666"
                />
                
                <Text style={styles.editLabel}>Protein Amount</Text>
                <View style={styles.proteinInputContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editedProtein}
                    onChangeText={setEditedProtein}
                    placeholder="0"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                  <Text style={styles.proteinUnit}>g</Text>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.mealName}>{meal.name}</Text>
                
                <View style={styles.proteinContainer}>
                  <View style={styles.proteinBadge}>
                    <FontAwesome6 name="dumbbell" size={16} color="#FCE9BC" />
                    <Text style={styles.proteinAmount}>{meal.protein}g</Text>
                  </View>
                  <Text style={styles.proteinLabel}>protein</Text>
                </View>
              </>
            )}

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <FontAwesome6 name="clock" size={14} color="#666666" />
                <Text style={styles.metaText}>{formatTime(meal.created_at)}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <FontAwesome6 name="calendar" size={14} color="#666666" />
                <Text style={styles.metaText}>{formatDate(meal.created_at)}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <FontAwesome6 
                  name={isPhotoMeal(meal) ? "camera" : "pen"} 
                  size={14} 
                  color="#666666" 
                />
                <Text style={styles.metaText}>
                  {isPhotoMeal(meal) ? "Photo scanned" : "Manual entry"}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          {isEditMode ? (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={isSaving}
              >
                <FontAwesome6 name="xmark" size={16} color="#FF6B6B" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton, 
                  (!editedName.trim() || isNaN(Number(editedProtein)) || isSaving) && styles.buttonDisabled
                ]} 
                onPress={handleSave}
                disabled={!editedName.trim() || isNaN(Number(editedProtein)) || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FCE9BC" />
                ) : (
                  <>
                    <FontAwesome6 name="check" size={16} color="#FCE9BC" />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <FontAwesome6 name="trash" size={16} color="#FF6B6B" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <FontAwesome6 name="pen" size={16} color="#2A2A2A" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.okButton} onPress={handleClose}>
                <Text style={styles.okButtonText}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#FCE9BC",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  mealIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(42, 42, 42, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 24,
  },
  mealName: {
    fontSize: 28,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  proteinContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  proteinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#333333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#2A2A2A",
    marginBottom: 8,
  },
  proteinAmount: {
    fontSize: 24,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    fontWeight: "600",
  },
  proteinLabel: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    fontWeight: "500",
  },
  metaInfo: {
    gap: 12,
    width: "100%",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(42, 42, 42, 0.05)",
    borderRadius: 12,
  },
  metaText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#666666",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#FF6B6B",
    fontWeight: "600",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(42, 42, 42, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  okButton: {
    backgroundColor: "#7FEA71",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  okButtonText: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  editContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 24,
  },
  editLabel: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: "rgba(42, 42, 42, 0.05)",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  proteinInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proteinUnit: {
    fontSize: 18,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#FF6B6B",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7FEA71",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2A2A2A",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});