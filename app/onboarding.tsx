import { OnboardingLayout } from "../components/onboarding-layout";
import { Exercise } from "../components/exercise";
import { useState } from "react";
import { SelectGender } from "@/components/select-gender";
import { Weight } from "@/components/weight";
import { Perfect } from "@/components/perfect";
import { DailyProteinGoal } from "@/components/daily-protein-goal";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import CreateAccount from "../components/create-account";
import { OnboardingLoading } from "@/components/onboarding-loading";
import { Goal } from "@/components/goal";

export interface OnboardingData {
  gender: "male" | "female" | "other" | null;
  age: number | null;
  height: number | null;
  targetWeight: number | null;
  targetWeightUnit: "lbs" | "kg" | null;
  exerciseFrequency: "0-2" | "3-4" | "5+" | null;
  goal: "lose" | "gain" | "maintain" | null;
  dailyProteinGoal: number | null;
  email: string | null;
  hasAccount: boolean;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const totalSteps = 8;
  const [data, setData] = useState<OnboardingData>({
    gender: null,
    age: null,
    height: null,
    targetWeight: null,
    targetWeightUnit: null,
    exerciseFrequency: null,
    goal: null,
    dailyProteinGoal: null,
    email: null,
    hasAccount: false,
  });

  const handleExerciseSelect = (selected: "0-2" | "3-4" | "5+") => {
    setData((prev) => ({ ...prev, exerciseFrequency: selected }));
  };

  const handleGenderSelect = (selected: "male" | "female" | "other") => {
    setData((prev) => ({ ...prev, gender: selected }));
  };

  const handleWeightSelect = (selected: number, unit: "lbs" | "kg") => {
    setData((prev) => ({
      ...prev,
      targetWeight: selected,
      targetWeightUnit: unit,
    }));
  };

  const handleGoalSelect = (selected: "lose" | "gain" | "maintain") => {
    setData((prev) => ({ ...prev, goal: selected }));
  };

  const handleProteinGoalSelect = (proteinGoal: number) => {
    setData((prev) => ({ ...prev, dailyProteinGoal: proteinGoal }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      setCurrentStep(currentStep + 1);
    } else {
      console.log("saving onboarding data: ", data);
      router.push("/home");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !data.gender;
      case 1:
        return !data.targetWeight || !data.targetWeightUnit;
      case 2:
        return !data.exerciseFrequency;
      case 3:
        return !data.goal;
      case 4:
        return false;
      case 5:
        return false;
      case 6:
        return false;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SelectGender onSelect={handleGenderSelect} />;
      case 1:
        return <Weight onSelect={handleWeightSelect} />;
      case 2:
        return <Exercise onSelect={handleExerciseSelect} />;
      case 3:
        return <Goal onSelect={handleGoalSelect} />;
      case 4:
        return <Perfect />;
      case 5:
        return (
          <DailyProteinGoal
            targetWeight={data.targetWeight ?? 0}
            targetWeightUnit={data.targetWeightUnit ?? "lbs"}
            exerciseFrequency={data.exerciseFrequency ?? "0-2"}
            goal={data.goal ?? "maintain"}
            onSelect={handleProteinGoalSelect}
          />
        );
      case 6:
        return (
          <CreateAccount
            title="Create Account"
            onBack={handleBack}
            type="signup"
            onGoogleSignIn={async (user) => {
              console.log("Google Sign In");
              setData((prev) => ({
                ...prev,
                email: user.email ?? null,
                hasAccount: true,
              }));
              await handleNext();
            }}
            onAppleSignIn={async (user) => {
              console.log("Apple Sign In");
              setData((prev) => ({
                ...prev,
                email: user.email ?? null,
                hasAccount: true,
              }));
              await handleNext();
            }}
          />
        );
      case 7:
        return <OnboardingLoading onboardingData={data} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      isNextDisabled={isNextDisabled()}
      hideBottomBar={currentStep === totalSteps - 2}
      showLayout={currentStep !== totalSteps - 1}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
