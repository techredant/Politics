// screens/SplashScreen.tsx
import React, { useEffect } from "react";
import { View, Image } from "react-native";

const SplashScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("@/assets/icon.jpg")}
        style={{ width: 80, height: 80 }}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;
