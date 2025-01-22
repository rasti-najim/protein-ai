import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
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
import { User } from "@supabase/supabase-js";

interface CreateAccountProps {
  title: string;
  onGoogleSignIn: (user: User) => void;
  onAppleSignIn: (user: User) => void;
  type: "login" | "signup";
  onBack: () => void;
}

export default function CreateAccount({
  title,
  onGoogleSignIn,
  onAppleSignIn,
  type,
  onBack,
}: CreateAccountProps) {
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
        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        if (!error && user) {
          onGoogleSignIn(user);
        }
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("user cancelled the login flow");
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("operation (e.g. sign in) is in progress already");
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("play services not available or outdated");
        // play services not available or outdated
      } else {
        console.log("some other error happened");
        // some other error happened
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
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
        if (!error && user) {
          // User is signed in.
          onAppleSignIn(user);
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

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://garrudnyai.github.io/ProteinAI/");
  };

  const handleTerms = () => {
    Linking.openURL(
      "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your{"\n"}Account</Text>

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
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={16}
          style={[styles.authButton, { height: 54 }]}
          onPress={handleAppleSignIn}
        />
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{" "}
          <Text style={styles.termsLink} onPress={handleTerms}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={styles.termsLink} onPress={handlePrivacyPolicy}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCE9BC",
    paddingTop: 80,
  },
  title: {
    fontSize: 50,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginBottom: 80,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    gap: 20,
    marginBottom: 24,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(42, 42, 42, 0.1)",
  },
  authButtonText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    fontWeight: "600",
  },
  orText: {
    fontSize: 20,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    marginVertical: 8,
  },
  termsContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  termsText: {
    fontSize: 14,
    fontFamily: "Platypi",
    color: "#2A2A2A",
    textAlign: "center",
    opacity: 0.6,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: "#2A2A2A",
    opacity: 0.8,
  },
});
