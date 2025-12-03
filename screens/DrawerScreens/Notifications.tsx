import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { TouchableOpacity, ScrollView, StyleSheet, Switch } from "react-native";
import { View, Text } from "react-native";

const Notifications = () => {
  const { theme } = useTheme(); // 👈 get theme from context
  const [mentions, setMentions] = useState(true);
  const [followers, setFollowers] = useState(true);
  const [messages, setMessages] = useState(true);
  const [updates, setUpdates] = useState(false);
  const navigation = useNavigation();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]} // 👈 apply bg
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="flex-row items-center">
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="ml-auto p-2"
        >
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: theme.subtext }]}>
        Manage how BroadCast keeps you updated
      </Text>

      {/* Mentions */}
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Mentions & Comments
        </Text>
        <Switch value={mentions} onValueChange={setMentions} />
      </View>

      {/* Followers */}
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          New Followers
        </Text>
        <Switch value={followers} onValueChange={setFollowers} />
      </View>

      {/* Direct Messages */}
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Direct Messages
        </Text>
        <Switch value={messages} onValueChange={setMessages} />
      </View>

      {/* App Updates */}
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          BroadCast Updates
        </Text>
        <Switch value={updates} onValueChange={setUpdates} />
      </View>

      {/* Info */}
      <Text style={[styles.footer, { color: theme.subtext }]}>
        You can turn off notifications anytime in your device settings.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    fontSize: 13,
    marginTop: 30,
    lineHeight: 20,
  },
});

export default Notifications;
