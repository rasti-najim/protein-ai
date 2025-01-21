import { SelectOption } from "./select-option";

interface ExerciseProps {
  onSelect: (frequency: "0-2" | "3-4" | "5+") => void;
}

export const Exercise = ({ onSelect }: ExerciseProps) => {
  const options = [
    { value: "0-2", label: "0-2" },
    { value: "3-4", label: "3-4" },
    { value: "5+", label: "5+" },
  ];

  return (
    <SelectOption
      title="Exercise"
      subtitle="How many times a week do you workout?"
      options={options}
      onSelect={(value) => onSelect(value as "0-2" | "3-4" | "5+")}
    />
  );
};
