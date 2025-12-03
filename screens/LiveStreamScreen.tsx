// import { View, Text, StyleSheet, Animated, Easing } from "react-native";
// import React, { useEffect, useRef } from "react";

// const LiveStreamScreen = () => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.parallel([
//           Animated.timing(fadeAnim, {
//             toValue: 1,
//             duration: 800,
//             useNativeDriver: true,
//           }),
//           Animated.spring(scaleAnim, {
//             toValue: 1,
//             friction: 3,
//             useNativeDriver: true,
//           }),
//         ]),
//         Animated.timing(fadeAnim, {
//           toValue: 0.6,
//           duration: 800,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, [fadeAnim, scaleAnim]);

//   return (
//     <View style={styles.container}>
//       <Animated.Text
//         style={[
//           styles.text,
//           {
//             opacity: fadeAnim,
//             transform: [{ scale: scaleAnim }],
//           },
//         ]}
//       >
//         🚀 Live Streaming Coming Soon!
//       </Animated.Text>
//     </View>
//   );
// };

// export default LiveStreamScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000", // dark background looks nice
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   text: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#fff",
//     textAlign: "center",
//   },
// });

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { StreamChat } from "stream-chat";
import { Channel, Chat, MessageInput, MessageList } from "stream-chat-expo";

const chatClient = StreamChat.getInstance(process.env.STREAM_CHAT_KEY!);

type ChatScreenProps = {
  channelId: string;
  onClose?: () => void;
};

const ChatScreen: React.FC<ChatScreenProps> = ({ channelId, onClose }) => {
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const initChannel = async () => {
      const c = chatClient.channel("messaging", channelId);
      await c.watch();
      setChannel(c);
    };
    initChannel();
  }, [channelId]);

  if (!channel) return null;

  return (
    <View style={{ flex: 1 }}>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <MessageList />
          <MessageInput />
        </Channel>
      </Chat>
    </View>
  );
};

export default ChatScreen;

