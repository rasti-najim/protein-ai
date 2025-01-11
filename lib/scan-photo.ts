import { ImagePicker } from "expo-image-picker";

export const scanPhoto = async (image: Image) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
};



