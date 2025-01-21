import { SelectOption } from "./select-option";

interface GoalProps {
  onSelect: (goal: "lose" | "gain" | "maintain") => void;
}

export const Goal = ({ onSelect }: GoalProps) => {
  const options = [
    { value: "lose", label: "Lose Weight" },
    { value: "maintain", label: "Maintain Muscle" },
    { value: "gain", label: "Gain Muscle" },
  ];

  return (
    <SelectOption
      title="Goal"
      subtitle="Goals are 🔑 for calculating daily protein."
      options={options}
      onSelect={(value) => onSelect(value as "lose" | "gain" | "maintain")}
    />
  );
};
