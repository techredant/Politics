import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import StatusList from "../StatusScreens/StatusList";
import { useLevel } from "@/context/LevelContext";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";

export default function HeaderComponent() {
  const { currentLevel } = useLevel();
  const { theme } = useTheme();
  const { signOut } = useAuth();

  function capitalize(str: string | undefined): string {
    return typeof str === "string"
      ? str.charAt(0).toUpperCase() + str.slice(1)
      : "";
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, shadowColor: theme.text },
      ]}
    >
      <View style={styles.headerRow}>
        <Text />
        <View style={styles.headerTextContainer}>
          {/* Special case: Home */}
          {currentLevel?.type === "home" ? (
            <Text style={[styles.valueText, { color: theme.text }]}>Home</Text>
          ) : currentLevel?.value && currentLevel?.type ? (
            <>
              <Text style={[styles.valueText, { color: theme.text }]}>
                {capitalize(currentLevel.value)}
              </Text>
              <Text style={[styles.typeText, { color: theme.text }]}>
                {capitalize(currentLevel.type)}
              </Text>
            </>
          ) : (
            <Text style={[styles.typeText, { color: theme.text }]}>
              Update in your Profile
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => signOut()}>
          <Image
            source={require("@/assets/icon.jpg") as ImageSourcePropType}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.statusListContainer}>
        <StatusList currentLevel={currentLevel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 10,
    paddingTop: 20
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.7,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  statusListContainer: {
    minHeight: 100,
    shadowRadius: 4,
  },
});
