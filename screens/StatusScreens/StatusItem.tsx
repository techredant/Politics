import { useTheme } from "@/context/ThemeContext";
import React, { useEffect, useRef } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const STATUS_SIZE = 56;   // Bigger image
const STROKE_WIDTH = 4;  // Thinner ring
const GAP_DEG = 6;       // More spacing between segments

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

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const StatusItem: React.FC<StatusItemProps> = ({
  userStatuses,
  seenStatuses,
  setSeenStatuses,
  navigation,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    navigation.navigate("StatusView", { userStatuses });
    const newSeen = userStatuses.map((s) => s._id);
    setSeenStatuses((prev) => [...new Set([...prev, ...newSeen])]);
  };

  /* ---------------- RING MATH ---------------- */
  const RADIUS = STATUS_SIZE / 2 - 2; // ring closer to image
  const circumference = 2 * Math.PI * RADIUS;
  const segments = userStatuses.length;
  const gap = (GAP_DEG / 360) * circumference;
  const dashLength = circumference / segments - gap;

  /* ---------------- ANIMATION ---------------- */
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* ---------------- SEEN FADE ---------------- */
  const isAllSeen = userStatuses.every((s) =>
    seenStatuses.includes(s._id)
  );

  const ringOpacity = useRef(
    new Animated.Value(isAllSeen ? 0.35 : 1)
  ).current;

  useEffect(() => {
    Animated.timing(ringOpacity, {
      toValue: isAllSeen ? 0.35 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [isAllSeen]);

  useEffect(() => {
    if (isAllSeen) return;

    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    loop.start();
    return () => loop.stop();
  }, [isAllSeen]);


  /* ---------------- UI ---------------- */
  return (
    <Pressable onPress={handlePress} style={styles.statusWrapper}>
      <View style={styles.circleWrapper}>
        <AnimatedSvg
          width={STATUS_SIZE + STROKE_WIDTH * 2}
          height={STATUS_SIZE + STROKE_WIDTH * 2}
          style={{ transform: [{ rotate }] }}
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
                seenStatuses.includes(status._id)
                  ? "rgba(180,180,180,0.8)"
                  : "url(#grad)"
              }
              strokeWidth={STROKE_WIDTH}
              strokeOpacity={ringOpacity}
              fill="transparent"
              strokeDasharray={`${dashLength} ${gap}`}
              rotation={(i * 360) / segments}
              originX={RADIUS + STROKE_WIDTH}
              originY={RADIUS + STROKE_WIDTH}
              strokeLinecap="round"
            />
          ))}
        </AnimatedSvg>

        {/* PROFILE IMAGE */}
        <Image
          source={{
            uri: userStatuses[0]?.media?.[0] ??
              "https://via.placeholder.com/100",
          }}
          style={styles.userImage}
        />
      </View>

      <Text
        style={[styles.statusLabel, { color: theme.text }]}
        numberOfLines={1}
      >
        {userStatuses[0]?.userName ?? "Anonymous"}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  statusWrapper: {
    alignItems: "center",
    marginHorizontal: 10,
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
    position: "absolute",
    backgroundColor: "#eee",
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
