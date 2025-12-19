// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   ActivityIndicator,
//   SafeAreaView,
//   Text,
//   StyleSheet,
// } from "react-native";
// import { StreamChat } from "stream-chat";
// import {
//   Chat,
//   Channel,
//   MessageList,
//   MessageInput,
// } from "stream-chat-expo";
// import { useUser } from "@clerk/clerk-expo";

// const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_CHAT_KEY!;
// const BACKEND_URL = "https://politics-chi.vercel.app";

// const chatClient = StreamChat.getInstance(STREAM_KEY);

// const AIChatScreen = () => {
//   const { user } = useUser();
//   const [isReady, setIsReady] = useState(false);
//   const [channel, setChannel] = useState<any>(null);
//   const listenerAttached = useRef(false);

//   // ---------------- CONNECT TO STREAM ----------------
//   useEffect(() => {
//     if (!user?.id) return;

//     const connect = async () => {
//       try {
//         // 1️⃣ Get Stream token
//         const res = await fetch(`${BACKEND_URL}/api/stream/token`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId: user.id }),
//         });

//         const data = await res.json();
//         if (!data.token) throw new Error("No Stream token");

//         // 2️⃣ Connect user
//         await chatClient.connectUser(
//           {
//             id: user.id,
//             name: user.fullName || "User",
//             image: user.imageUrl || "https://placekitten.com/200/200",
//           },
//           data.token
//         );

//         // 3️⃣ Create or get AI channel
//         const aiChannel = chatClient.channel(
//           "messaging",
//           `ai-chat-${user.id}`,
//           {
//             name: "AI Assistant 🤖",
//             members: [user.id, "ai-bot"],
//           }
//         );

//         await aiChannel.watch();
//         setChannel(aiChannel);
//         setIsReady(true);
//       } catch (err) {
//         console.error("Stream init error:", err);
//       }
//     };

//     connect();

//     return () => {
//       chatClient.disconnectUser();
//     };
//   }, [user?.id]);

//   // ---------------- AI MESSAGE LISTENER ----------------
//   useEffect(() => {
//     if (!channel || listenerAttached.current) return;

//     const onNewMessage = async (event: any) => {
//       const message = event.message;

//       // Ignore AI messages
//       if (!message?.text || message.user?.id === "ai-bot") return;

//       try {
//         await fetch(`${BACKEND_URL}/api/ai/reply`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             channelId: channel.id,
//             text: message.text,
//           }),
//         });
//       } catch (err) {
//         console.error("AI reply request failed:", err);
//       }
//     };

//     channel.on("message.new", onNewMessage);
//     listenerAttached.current = true;

//     return () => {
//       channel.off("message.new", onNewMessage);
//       listenerAttached.current = false;
//     };
//   }, [channel]);

//   // ---------------- LOADING ----------------
//   if (!isReady || !channel) {
//     return (
//       <SafeAreaView style={styles.center}>
//         <ActivityIndicator size="large" color="#666" />   
//         <Text style={{ marginTop: 10 }}>Connecting to AI chat…</Text>
//       </SafeAreaView>
//     );
//   }

//   // ---------------- UI ----------------
//   return (
//       <Chat client={chatClient}>
//         <Channel channel={channel}>
//           <MessageList />
//           <MessageInput placeholder="Ask the AI anything…" />
//         </Channel>
//       </Chat>
//   );
// };

// export default AIChatScreen;

// // ---------------- STYLES ----------------
// const styles = StyleSheet.create({
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });


import { View, Text } from 'react-native'
import React from 'react'

const AIChatScreen = () => {
  return (
    <View>
      <Text>AIChatScreen</Text>
    </View>
  )
}

export default AIChatScreen