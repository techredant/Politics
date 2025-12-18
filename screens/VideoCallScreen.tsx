// // ChatScreen.tsx
// import { useTheme } from "@/context/ThemeContext";
// import { useUser } from "@clerk/clerk-expo";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   View,
//   StyleSheet,
//   Text,
//   StatusBar,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { StreamChat } from "stream-chat";
// import {
//   Chat,
//   Channel,
//   ChannelList,
//   MessageList,
//   MessageInput,
// } from "stream-chat-expo";

// const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_CHAT_KEY!;
// const BACKEND_URL = "https://politics-chi.vercel.app/api/stream/token"; // 👈 your backend URL

// const chatClient = StreamChat.getInstance(STREAM_KEY);

// const ChatScreen = () => {
//   const [isReady, setIsReady] = useState(false);
//   const [channel, setChannel] = useState<any>(null);
//   const { user } = useUser();
//   const { theme, isDark } = useTheme();

//   useEffect(() => {
//     const setup = async () => {
//       try {
//         // ✅ Request token from backend
//         const response = await fetch(BACKEND_URL, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId: "demo-user" }),
//         });

//         const data = await response.json();
//         if (!data.token) throw new Error("No token returned from backend");

//         // ✅ Connect user to Stream
//         await chatClient.connectUser(
//           {
//             id: "demo-user",
//             name: user?.fullName || "Demo User",
//             image: "https://placekitten.com/200/200",
//           },
//           data.token
//         );

//         setIsReady(true);
//       } catch (err) {
//         console.error("Stream init error:", err);
//       }
//     };

//     setup();
//     return () => chatClient.disconnectUser();
//   }, []);

//   if (!isReady) {
//     return (
//       <SafeAreaView
//         style={[styles.center, { backgroundColor: theme.background }]}
//       >
//         <ActivityIndicator size="large" color={theme.text || "#888"} />
//         <Text style={[styles.loadingText, { color: theme.text }]}>
//           Connecting to chat...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: theme.background }]}
//     >
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle={isDark ? "light-content" : "dark-content"}
//       />
//       <Chat client={chatClient} style={{ backgroundColor: theme.background }}>
//         {!channel ? (
//           <ChannelList
//             filters={{ type: "messaging" }}
//             onSelect={(selectedChannel) => setChannel(selectedChannel)}
//             PreviewTitle={({ channel }) => (
//               <Text style={{ color: theme.text }}>
//                 {channel.data.name || channel.id}
//               </Text>
//             )}
//           />
//         ) : (
//           <Channel channel={channel} onBackPress={() => setChannel(null)}>
//             <View
//               style={[
//                 styles.channelContainer,
//                 { backgroundColor: theme.background },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.channelName,
//                   { color: theme.text, borderBottomColor: theme.border },
//                 ]}
//               >
//                 {channel.data.name || channel.id}
//               </Text>
//               <MessageList />
//               <MessageInput />
//             </View>
//           </Channel>
//         )}
//       </Chat>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   channelContainer: {
//     flex: 1,
//   },
//   channelName: {
//     fontSize: 18,
//     fontWeight: "600",
//     padding: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
// });

import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const VideoCallScreen = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="videocam-outline" size={64} color="#999" className="animate-bounce"/>

      <Text style={styles.title}>Livestream Coming Soon</Text>

      <Text style={styles.subtitle}>
        We’re working hard to bring live video streaming to you.
        Stay tuned for updates!
      </Text>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
});
