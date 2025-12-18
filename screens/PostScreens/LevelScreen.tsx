import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { FloatingAction } from "react-native-floating-action";
import { Feather, Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLevel } from "@/context/LevelContext";
import { useUser } from "@clerk/clerk-expo";
import PostScreen from "./PostScreen";
import { RootStackParamList } from "@/types/navigation";
import { useTheme } from "@/context/ThemeContext";
import { LoaderKitView } from "react-native-loader-kit";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "GoLive">;

const LevelScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentLevel, setCurrentLevel, userDetails, refreshUserDetails } =
    useLevel();
  const { user, isLoaded } = useUser();
  const [userReady, setUserReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (isLoaded && user?.id && user?.firstName) {
      setUserReady(true);
      refreshUserDetails();
    }
  }, [isLoaded, user]);

  const actions = [
    {
      text: "Home",
      icon: <Ionicons name="earth-outline" size={20} color="#fff" />,
      name: "home",
      position: 5,
      color: "#1F2937",
    },
    {
      text: "County",
      icon: <Feather name="map" size={20} color="#fff" />,
      name: "county",
      position: 4,
      color: "#1F2937",
    },
    {
      text: "Constituency",
      icon: <FontAwesome5 name="flag" size={20} color="#fff" />,
      name: "constituency",
      position: 3,
      color: "#1F2937",
    },
    {
      text: "Ward",
      icon: <FontAwesome5 name="map-pin" size={20} color="#fff" />,
      name: "ward",
      position: 2,
      color: "#1F2937",
    },
    {
      text: "Go Live",
      icon: <Ionicons name="videocam-outline" size={20} color="#fff" className="animate-pulse"/>,
      name: "GoLive",
      position: 1,
      color: "#1F2937",
    },
    {
      text: "Chat With AI",
      icon: <Feather name="message-circle" size={20} color="#fff" />,
      name: "AIChat",
      position: 0,
      color: "#1F2937",
    },
  ];

  const handleActionPress = async (name?: string) => {
    if (!name) return;

    if (name === "GoLive") {
      navigation.navigate("VideoCallScreen", { roomName: user?.id! });
      return;
    }

    if (name === "AIChat") {
      navigation.navigate("AIChatScreen"); // 👈 make sure this route exists
      return;
    }

    setLoading(true);

    setTimeout(() => {
      switch (name) {
        case "home":
          setCurrentLevel({ type: "home", value: "home" });
          break;
        case "county":
          setCurrentLevel({
            type: "county",
            value: userDetails?.county || null,
          });
          break;
        case "constituency":
          setCurrentLevel({
            type: "constituency",
            value: userDetails?.constituency || null,
          });
          break;
        case "ward":
          setCurrentLevel({
            type: "ward",
            value: userDetails?.ward || null,
          });
          break;
      }
      setLoading(false);
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoaderKitView
            style={{ width: 60, height: 60 }}
            name="BallScaleRippleMultiple"
            color={theme.text}
          />
        </View>
      ) : (
        <PostScreen currentLevel={currentLevel} />
      )}

      <FloatingAction
        actions={actions}
        onPressItem={handleActionPress}
        color="#1F2937"
        overlayColor="rgba(0,0,0,0.7)"
        floatingIcon={<Feather name="more-vertical" size={24} color="#fff" />}
        distanceToEdge={{ vertical: 100, horizontal: 10 }}
      />
    </View>
  );
};

export default LevelScreen;
