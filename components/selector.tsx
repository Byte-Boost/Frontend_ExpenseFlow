import React from "react";
import { Picker } from "@react-native-picker/picker";

const TypeSelector = (props: {
  selectedValue: string;
  options: string[];
  onValueChange: (value: string) => void;
}) => {
  return (
    <Picker
      selectedValue={props.selectedValue}
      onValueChange={(itemValue) => props.onValueChange(itemValue)}
    >
      {props.options.map((option, index) => (
        <Picker.Item key={index} label={option} value={option} />
      ))}
    </Picker>
  );
};

export default TypeSelector;
