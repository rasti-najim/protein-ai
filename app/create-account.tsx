import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import supabase from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface CreateAccountProps {
  title: string;
  onGoogleSignIn: (user: User) => void;
  onAppleSignIn: (user: User) => void;
  type: "login" | "signup";
  onBack: () => void;
}

export const CreateAccount = ({
  title,
  onGoogleSignIn,
  onAppleSignIn,
  type,
  onBack,
}: CreateAccountProps) => {
  GoogleSignin.configure({
    scopes: ["email", "profile"],
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);

      if (userInfo?.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });
        console.log(error, data);
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const {
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        console.log(JSON.stringify({ error, user }, null, 2));
        if (!error) {
          // User is signed in.
        }
      } else {
        throw new Error("No identityToken.");
      }
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/images/steak-dark.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <SafeAreaView style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome6 name="chevron-left" size={24} color="#FCE9BC" />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleGoogleSignIn}
          >
            <FontAwesome6 name="google" size={24} color="#2A2A2A" />
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={5}
            style={{ width: 200, height: 44 }}
            // style={styles.button}
            onPress={async () => {
              try {
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
                // signed in
              } catch (e: any) {
                if (e.code === "ERR_REQUEST_CANCELED") {
                  // handle that the user canceled the sign-in flow
                } else {
                  // handle other errors
                }
              }
            }}
          />

          <TouchableOpacity
            style={styles.authButton}
            onPress={handleAppleSignIn}
          >
            <FontAwesome6 name="apple" size={24} color="#2A2A2A" />
            <Text style={styles.authButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 42,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: "#FCE9BC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  authButtonText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  termsText: {
    fontSize: 14,
    fontFamily: "Platypi",
    color: "#FCE9BC",
    textAlign: "center",
    opacity: 0.8,
  },
});
