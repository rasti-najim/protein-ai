import { SelectOption } from "./select-option";

interface SelectGenderProps {
  onSelect: (gender: "male" | "female" | "other") => void;
}

export const SelectGender = ({ onSelect }: SelectGenderProps) => {
  const options = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <SelectOption
      title="Gender"
      options={options}
      onSelect={(value) => onSelect(value as "male" | "female" | "other")}
    />
  );
};
