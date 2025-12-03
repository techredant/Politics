// UsersScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const UsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch users from your backend
    fetch("http://192.168.100.28:3000/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => navigation.navigate("ChatScreen", { user: item })}
        >
          <Text style={{ fontWeight: "bold" }}>{item.firstName}</Text>
          <Text style={{ color: "gray" }}>@{item.nickName}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
