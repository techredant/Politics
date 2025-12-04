import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import StatusItem from "./StatusItem";

interface Status {
  _id: string;
  userId: string;
  userName: string;
  media: string[];
  createdAt: string;
}

type StatusInputNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "StatusInput"
>;

interface StatusListProps {
  currentLevel: { type: string; value: string };
}

const StatusList: React.FC<StatusListProps> = ({ currentLevel }) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [seenStatuses, setSeenStatuses] = useState<string[]>([]);
  const navigation = useNavigation<StatusInputNavProp>();

  const fetchStatuses = async () => {
    try {
      let url = `https://politics-chi.vercel.app/api/statuses`;
      if (currentLevel.type !== "home") {
        url += `?levelType=${currentLevel.type}&levelValue=${currentLevel.value}`;
      }
      const res = await axios.get(url);
      setStatuses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [currentLevel]);

  useFocusEffect(
    useCallback(() => {
      fetchStatuses();
    }, [currentLevel])
  );

  // Group statuses by user
  const groupedStatuses: Record<string, Status[]> = statuses.reduce(
    (acc, status) => {
      if (!acc[status.userId]) acc[status.userId] = [];
      acc[status.userId].push(status);
      return acc;
    },
    {} as Record<string, Status[]>
  );

  Object.keys(groupedStatuses).forEach((userId) =>
    groupedStatuses[userId].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  // const formattedTitle =
  //   currentLevel.type === "home"
  //     ? "Home"
  //     : `${
  //         currentLevel.value.charAt(0).toUpperCase() +
  //         currentLevel.value.slice(1)
  //       } ${
  //         currentLevel.type.charAt(0).toUpperCase() + currentLevel.type.slice(1)
  //       }`;

  return (
    <View>
      {/* <Text style={styles.statusHeader}>{formattedTitle} Stories</Text> */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 10 }}
      >
        {/* Add New Status */}
        <TouchableOpacity
          style={styles.statusWrapper}
          onPress={() => navigation.navigate("StatusInput")}
        >
          <View style={styles.addStatusCircle}>
            <Ionicons name="add" size={28} color="blue" />
          </View>
          <Text style={styles.statusLabel}></Text>
        </TouchableOpacity>

        {/* Existing statuses */}
        {Object.keys(groupedStatuses).map((userId) => (
          <StatusItem
            key={userId}
            userStatuses={groupedStatuses[userId]}
            seenStatuses={seenStatuses}
            navigation={navigation}
            setSeenStatuses={setSeenStatuses}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const STATUS_RADIUS = 25;

const styles = StyleSheet.create({
  statusHeader: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  statusWrapper: {
    // marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    width: STATUS_RADIUS * 2 + 8,
  },
  addStatusCircle: {
    width: STATUS_RADIUS * 2,
    height: STATUS_RADIUS * 2,
    borderRadius: STATUS_RADIUS,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",

  },
  statusLabel: {
    marginTop: 6,
    fontSize: 12,
    maxWidth: STATUS_RADIUS * 2 + 12,
    textAlign: "center",
    color: "#333",
    fontWeight: "800",
  },
});

export default StatusList;
