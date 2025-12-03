// components/AnimatedIconButton.tsx
import React, { JSX, useRef } from "react";
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
} from "react-native";

type AnimatedIconButtonProps = {
  icon: JSX.Element;
  onPress: () => void;
  buttonStyle?: ViewStyle;
  size?: number;
  color?: string;
};

const AnimatedIconButton: React.FC<AnimatedIconButtonProps> = ({
  icon,
  onPress,
  buttonStyle,
  size = 28,
  color = "#fff",
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.button,
          buttonStyle,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {React.cloneElement(icon, { size, color })}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default AnimatedIconButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 30,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
