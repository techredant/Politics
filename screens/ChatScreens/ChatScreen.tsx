import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { StreamChat } from "stream-chat";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-expo";
import axios from "axios";

const chatClient = StreamChat.getInstance(
  process.env.EXPO_PUBLIC_STREAM_CHAT_KEY!
);

type ChatScreenProps = {
  clerkId: string; // ✅ Clerk ID from your auth
  firstName: string;
  image?: string;
  channelId: string;
};

const ChatScreen: React.FC<ChatScreenProps> = ({
  clerkId,
  firstName,
  image,
  channelId,
}) => {
  const [channel, setChannel] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initChat = async () => {
      try {
        // ✅ Get a Stream chat token from your backend
        const response = await axios.post(
          `https://politics-chi.vercel.app/api/users/create-or-get-user`,
          {
            clerkId,
            firstName,
            image,
            email: `${clerkId}@placeholder.com`, // or real email
          }
        );

        const { chatToken } = response.data;

        // ✅ Connect user with token from backend
        await chatClient.connectUser(
          {
            id: clerkId,
            name: firstName,
            image,
          },
          chatToken
        );

        // ✅ Get or create a channel
        const c = chatClient.channel("messaging", channelId, {
          name: "Private Chat",
          members: [clerkId],
        });

        await c.watch();
        setChannel(c);
        setIsReady(true);
      } catch (err) {
        console.error("Stream init error:", err);
      }
    };

    initChat();

    return () => {
      chatClient.disconnectUser();
    };
  }, [clerkId, channelId]);

  if (!isReady || !channel) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  return (
    <Chat client={chatClient}>
      <Channel channel={channel}>
        <MessageList />
        <MessageInput />
      </Channel>
    </Chat>
  );
};

export default ChatScreen;
