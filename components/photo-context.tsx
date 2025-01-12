import React, { createContext, useContext, useState } from "react";
import { CameraCapturedPicture } from "expo-camera";

interface PhotoContextType {
  photo: CameraCapturedPicture | null;
  setPhoto: (photo: CameraCapturedPicture | null) => void;
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  return (
    <PhotoContext.Provider value={{ photo, setPhoto, photoUri, setPhotoUri }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhoto() {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error("usePhoto must be used within a PhotoProvider");
  }
  return context;
}
