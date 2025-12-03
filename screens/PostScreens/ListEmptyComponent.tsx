import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { Image } from "react-native";

const ListEmptyComponent: React.FC = () => {
  const { theme } = useTheme(); // Assuming you have a theme context

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/icon.jpg")}
        style={styles.avatar}
      />
      <Text
        style={{
          marginTop: 12,
          fontSize: 18,
          textAlign: "center",
          fontWeight: "bold",
            color: theme.text, // Use theme color for text
        }}
      >
        No Posts Available
      </Text>
    </View>
  );
};

export default ListEmptyComponent;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
});
