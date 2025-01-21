import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/auth-context";

export default function Login() {
  GoogleSignin.configure({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });
  const router = useRouter();
  const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo?.data?.idToken) {
        // Check if user exists in auth.users
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("email")
          .eq("email", userInfo.data.user.email)
          .limit(1)
          .single();

        if (!existingUser) {
          Alert.alert(
            "Account Not Found",
            "No account exists with this email. Please create a new account instead.",
            [{ text: "OK" }]
          );
          return;
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        if (!error && user) {
          router.replace("/home");
        }
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      console.log("Apple credential:", credential);

      if (credential.identityToken) {
        // Get email from either credential or decode JWT token
        // let email = credential.email;

        // if (!email) {
        //   // If email is null, try to get it from the JWT token
        //   const tokenParts = credential.identityToken.split(".");
        //   const payload = JSON.parse(atob(tokenParts[1]));
        //   email = payload.email;
        //   console.log("Email from JWT:", email);
        // }

        // if (!email) {
        //   console.error("Could not get email from Apple sign in");
        //   return;
        // }

        // // Check if user exists in auth.users
        // const { data: existingUsers, error: checkError } = await supabase
        //   .from("users")
        //   .select("email")
        //   .eq("email", email)
        //   .limit(1)
        //   .single();

        // console.log("Existing user check result:", {
        //   existingUsers,
        //   checkError,
        // });

        // if (!existingUsers) {
        //   Alert.alert(
        //     "Account Not Found",
        //     "No account exists with this email. Please create a new account instead.",
        //     [{ text: "OK" }]
        //   );
        //   return;
        // }

        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });

        console.log("Sign in result:", { user, error });

        if (!error && user) {
          router.replace("/home");
        }
      }
    } catch (error: any) {
      console.error("Apple sign in error:", error);
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome6 name="chevron-left" size={24} color="#FCE9BC" />
        </TouchableOpacity>

        <Text style={styles.title}>Welcome{"\n"}Back</Text>

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
            cornerRadius={16}
            style={[styles.authButton, { height: 54 }]}
            onPress={handleAppleSignIn}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
  },
  content: {
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(51, 51, 51, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontFamily: "Platypi",
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 20,
    marginTop: "auto",
    marginBottom: 40,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(42, 42, 42, 0.1)",
  },
  authButtonText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
});
