
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import {
  TouchableOpacity,
  Image,
  Text,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const STATUS_SIZE = 40; // Diameter of user image
const STROKE_WIDTH = 8; // Ring thickness
const GAP_DEG = 2; // Gap between arcs in degrees

interface Status {
  _id: string;
  userId: string;
  userName: string;
  media: string[];
  createdAt: string;
}

interface StatusItemProps {
  userStatuses: Status[];
  seenStatuses: string[];
  setSeenStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  navigation: any;
}

const StatusItem: React.FC<StatusItemProps> = ({
  userStatuses,
  seenStatuses,
  setSeenStatuses,
  navigation,
}) => {
  const handlePress = () => {
    navigation.navigate("StatusView", { userStatuses });
    const newSeen = userStatuses.map((s) => s._id);
    setSeenStatuses((prev) => [...new Set([...prev, ...newSeen])]);
  };

  const RADIUS = STATUS_SIZE / 2;
  const circumference = 2 * Math.PI * RADIUS;
  const segments = userStatuses.length;
  const gap = (GAP_DEG / 360) * circumference;
  const dashLength = circumference / segments - gap;
  const { theme } = useTheme();

  return (
    <Pressable onPress={handlePress} style={styles.statusWrapper}>
      <View style={styles.circleWrapper}>
        <Svg
          width={STATUS_SIZE + STROKE_WIDTH * 2}
          height={STATUS_SIZE + STROKE_WIDTH * 2}
        >
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00c6ff" />
              <Stop offset="50%" stopColor="#0072ff" /> 
              <Stop offset="100%" stopColor="#004e92" />
            </LinearGradient>
          </Defs>

          {userStatuses.map((status, i) => (
            <Circle
              key={status._id}
              cx={RADIUS + STROKE_WIDTH}
              cy={RADIUS + STROKE_WIDTH}
              r={RADIUS}
              stroke={
                seenStatuses.includes(status._id) ? "#d3d3d3" : "url(#grad)"
              }
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={`${dashLength} ${gap}`}
              rotation={(i * 360) / segments}
              originX={RADIUS + STROKE_WIDTH}
              originY={RADIUS + STROKE_WIDTH}
            />
          ))}
        </Svg>

        {/* Centered User Image */}
        <Image
          source={{
            uri: userStatuses[0].media[0] || "https://via.placeholder.com/60",
          }}
          style={styles.userImage}
        />
      </View>

      <Text
        style={[styles.statusLabel, { color: theme.text }]}
        numberOfLines={1}
      >
        {userStatuses[0].userName || "Anonymous"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  statusWrapper: {
    alignItems: "center",
    marginHorizontal: 6,
    width: STATUS_SIZE + STROKE_WIDTH * 2,
  },
  circleWrapper: {
    width: STATUS_SIZE + STROKE_WIDTH * 2,
    height: STATUS_SIZE + STROKE_WIDTH * 2,
    justifyContent: "center",
    alignItems: "center",
  },
  userImage: {
    width: STATUS_SIZE,
    height: STATUS_SIZE,
    borderRadius: STATUS_SIZE / 2,
    backgroundColor: "#eee",
    position: "absolute",
    top: STROKE_WIDTH,
    left: STROKE_WIDTH,
  },
  statusLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: STATUS_SIZE + STROKE_WIDTH * 2,
  },
});

export default StatusItem;
