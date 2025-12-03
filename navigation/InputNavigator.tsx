import { View, Text } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InputScreen from "@/screens/PostScreens/InputScreen";

const InputNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Input" component={InputScreen} />
    </Stack.Navigator>
  );
};

export default InputNavigator;
