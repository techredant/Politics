import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Avatar } from "react-native-paper";
import { useLevel } from "@/context/LevelContext";
import { useUser } from "@clerk/clerk-expo";

import AppNavigator from "./AppNavigator";
import SettingsScreen from "@/screens/DrawerScreens/SettingsScreen";
import TrendScreen from "@/screens/DrawerScreens/TrendScreen";
import MediaScreen from "@/screens/DrawerScreens/MediaScreen";
import MembersScreen from "@/screens/DrawerScreens/MembersScreen";
import { StreamChat } from "stream-chat";
import { useTheme } from "@/context/ThemeContext";
import ChatScreen from "@/screens/DrawerScreens/ChatScreen";

const client = StreamChat.getInstance(process.env.STREAM_API_KEY);

interface IconProps {
  size: number;
  color: string;
}

const Drawer = createDrawerNavigator();

// ✅ Custom Drawer Content
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { user } = useUser();
  const { userDetails, isLoadingUser } = useLevel();
  const { theme } = useTheme();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: theme.card }}
    >
      <Pressable
        onPress={() => props.navigation.navigate("ProfileScreen")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <Avatar.Image
          size={40}
          source={{ uri: userDetails?.image || user?.imageUrl || undefined }}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          {isLoadingUser ? (
            <>
              <ActivityIndicator size="small" color={theme.text} />
              <Text style={{ fontSize: 14, color: theme.text }}>
                Loading...
              </Text>
            </>
          ) : (
            <>
              <Text
                style={{ fontWeight: "bold", fontSize: 16, color: theme.text }}
                numberOfLines={1}
              >
                {userDetails?.firstName
                  ? `${userDetails.firstName} ${userDetails.lastName}`
                  : "Anonymous"}
              </Text>
              <Text style={{ fontSize: 14, color: "gray" }} numberOfLines={1}>
                @{userDetails?.nickName || "guest"}
              </Text>
            </>
          )}
        </View>
      </Pressable>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

// ✅ Drawer Screens Array
export const drawerScreens = [
  {
    name: "Trends",
    component: TrendScreen,
    options: {
      title: "Trends",
      drawerIcon: ({ size, color }: IconProps) => (
        <Ionicons name="trending-up-outline" size={size} color={color} />
      ),
    },
  },
  {
    name: "Members",
    component: MembersScreen,
    options: {
      title: "Members",
      drawerIcon: ({ size, color }: IconProps) => (
        <Feather name="users" size={size} color={color} />
      ),
    },
  },
  {
    name: "Chat",
    component: ChatScreen,
    options: {
      title: "Chat",
      drawerIcon: ({ size, color }: IconProps) => (
        <Feather name="message-circle" size={size} color={color} />
      ),
    },
  },
  {
    name: "Media",
    component: MediaScreen,
    options: {
      title: "Media",
      drawerIcon: ({ size, color }: IconProps) => (
        <Ionicons name="images-outline" size={size} color={color} />
      ),
    },
  },
  {
    name: "Settings",
    component: SettingsScreen,
    options: {
      title: "Settings",
      drawerIcon: ({ size, color }: IconProps) => (
        <Ionicons name="settings-outline" size={size} color={color} />
      ),
    },
  },
];

const DrawerNavigator = () => {
  const { currentLevel, isLoadingUser } = useLevel();
  const [cachedLevel, setCachedLevel] = React.useState<string | null>(null);
  const { theme } = useTheme();
  React.useEffect(() => {
    if (currentLevel?.value) {
      setCachedLevel(currentLevel.value);
    }
  }, [currentLevel]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerTransparent: true,
        headerTitle: "",
        gestureEnabled: true,
        swipeEdgeWidth: 50,
        overlayColor: "rgba(0,0,0,0.2)",
        animationTypeForReplace: "push",
        drawerStyle: {
          backgroundColor: theme.card,
        },
        drawerContentStyle: {
          backgroundColor: theme.card,
        },
        drawerLabelStyle: {
          color: theme.text,
          fontSize: 15,
        },
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: theme.text, 
        drawerActiveBackgroundColor: theme.border, 
        drawerInactiveBackgroundColor: theme.card,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{
              marginLeft: 16,
              borderRadius: 50,
              padding: 4,
              backgroundColor: "gray",
              zIndex: 999,
            }}
          >
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
        ),
      })}
    >
      {/* Main App Navigator */}
      <Drawer.Screen
        name="Main"
        component={AppNavigator}
        options={{
          title: !isLoadingUser
            ? currentLevel?.value &&
              typeof currentLevel.value === "string" &&
              currentLevel.value.trim() !== ""
              ? currentLevel.value.charAt(0).toUpperCase() +
                currentLevel.value.slice(1)
              : "Home"
            : "Loading...",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="planet-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Other drawer screens */}
      {drawerScreens.map((screen) => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
