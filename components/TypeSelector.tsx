import React from "react";
import { Picker } from "@react-native-picker/picker";
import { View } from "react-native";

interface Option {
  name: string;
  value: string | number;
}

const TypeSelector = (props: {
  selectedValue: string | number;
  options: Option[];
  onValueChange: (value: string | number, itemLabel: number | string) => void;
}) => {
  return (
    <View className="bg-white border border-gray-300 rounded-lg p-2 mb-4">
      <Picker
        selectedValue={props.selectedValue}
        onValueChange={(itemValue, itemIndex) => {
          const selectedOption = props.options[itemIndex]; // Get the selected option
          props.onValueChange(itemValue, selectedOption.name); // Pass value and label
        }}
      >
        {props.options.map((option, index) => (
          <Picker.Item key={index} label={option.name} value={option.value} />
        ))}
      </Picker>
    </View>
  );
};

export default TypeSelector;
