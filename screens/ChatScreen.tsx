// import React, { useState, useEffect } from "react";
// import { View } from "react-native";
// import {
//   Chat,
//   Channel,
//   MessageList,
//   MessageInput,
// } from "stream-chat-react-native";
// import { StreamChat } from "stream-chat";
// import AnimatedIconButton from "@/components/AnimatedIconButton";
// import { MaterialIcons } from "@expo/vector-icons";
// import { useUser } from "@clerk/clerk-expo";

// const chatClient = StreamChat.getInstance(process.env.STREAM_CHAT_KEY!);

// type ChatScreenProps = {
//   channelId: string;
//   onClose?: () => void;
// };

// const ChatScreen: React.FC<ChatScreenProps> = ({ channelId, onClose }) => {
//   const { user, isLoaded } = useUser();
//   const [channel, setChannel] = useState<any>(null);

//   useEffect(() => {
//     if (!isLoaded || !user) return;

//     const connectUser = async () => {
//       try {
//         await chatClient.connectUser(
//           {
//             id: user.id,
//             name: user.firstName,
//             image: user.imageUrl,
//           },
//           process.env.STREAM_USER_TOKEN!
//         );

//         const c = chatClient.channel("messaging", channelId);
//         await c.watch();
//         setChannel(c);
//       } catch (err) {
//         console.error("Stream Chat error:", err);
//       }
//     };

//     connectUser();

//     return () => {
//       chatClient.disconnectUser();
//     };
//   }, [isLoaded, user, channelId]);

//   return (
//     <View style={{ flex: 1 }}>
//       {channel && (
//         <>
//           <Chat client={chatClient}>
//             <Channel channel={channel}>
//               <MessageList />
//               <MessageInput />
//             </Channel>
//           </Chat>
//           <AnimatedIconButton
//             icon={<MaterialIcons name="close" size={24} color="#fff" />}
//             onPress={onClose!}
//             buttonStyle={{
//               position: "absolute",
//               top: 40,
//               right: 20,
//               backgroundColor: "rgba(0,0,0,0.6)",
//             }}
//           />
//         </>
//       )}
//     </View>
//   );
// };

// export default ChatScreen;

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
