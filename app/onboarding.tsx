import { OnboardingLayout } from "../components/onboarding-layout";
import { Exercise } from "../components/exercise";
import { useState } from "react";
import { SelectGender } from "@/components/select-gender";
import { Weight } from "@/components/weight";
import { Perfect } from "@/components/perfect";
import { DailyProteinGoal } from "@/components/daily-protein-goal";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

interface OnboardingData {
  gender: "male" | "female" | "other" | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  targetWeight: number | null;
  exerciseFrequency: "0-2" | "3-4" | "5+" | null;
  goal: "lose" | "gain" | "maintain" | null;
  goalLose: number | null;
}

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const totalSteps = 5;
  const [data, setData] = useState<OnboardingData>({
    gender: null,
    age: null,
    height: null,
    weight: null,
    targetWeight: null,
    exerciseFrequency: null,
    goal: null,
    goalLose: null,
  });

  const handleExerciseSelect = (selected: "0-2" | "3-4" | "5+") => {
    setData((prev) => ({ ...prev, exerciseFrequency: selected }));
  };

  const handleGenderSelect = (selected: "male" | "female" | "other") => {
    setData((prev) => ({ ...prev, gender: selected }));
  };

  const handleWeightSelect = (selected: number) => {
    setData((prev) => ({ ...prev, weight: selected }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/");
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
        return !data.weight;
      case 2:
        return !data.exerciseFrequency;
      case 3:
        return false;
      case 4:
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
        return <Perfect onNext={handleNext} />;
      case 4:
        return <DailyProteinGoal proteinGoal={100} onFinish={handleNext} />;
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
      lastStep={currentStep === totalSteps - 1}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
