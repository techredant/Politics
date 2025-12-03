import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import ChatScreen from "@/screens/ChatScreens/ChatScreen";
import NamesScreen from "@/screens/AuthScreens/NamesScreen";

const Stack = createNativeStackNavigator();

const ProfileNavigator = () => {
  //  const { user } = useUser();

  //  useEffect(() => {
  //    if (user?.id) {
  //      connectStreamUser(user.id);
  //    }
  //  }, [user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
