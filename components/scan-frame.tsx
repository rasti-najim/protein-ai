import { View, StyleSheet } from "react-native";

export const ScanFrame = () => {
  return (
    <View style={styles.container}>
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderColor: "#FCE9BC",
    borderWidth: 8,
    // borderRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
});
