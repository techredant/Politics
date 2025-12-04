import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, SafeAreaView } from "react-native";
import { StreamChat } from "stream-chat";
import { Chat, Channel, MessageList, MessageInput } from "stream-chat-expo";
import { useUser } from "@clerk/clerk-expo";

const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_CHAT_KEY!;
const BACKEND_URL = "https://politics-chi.vercel.app"; // your server IP

const chatClient = StreamChat.getInstance(STREAM_KEY);

const AIChatScreen = () => {
  const { user } = useUser();
  const [channel, setChannel] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setupChat = async () => {
      try {
        // 1️⃣ Get a Stream token from your backend
        const tokenResponse = await fetch(`${BACKEND_URL}/api/stream/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id }),
        });
        const { token } = await tokenResponse.json();

        // 2️⃣ Connect user to Stream
        await chatClient.connectUser(
          {
            id: user?.id,
            name: user?.fullName || "User",
            image: user?.imageUrl || "https://placekitten.com/200/200",
          },
          token
        );

        // 3️⃣ Create or join an AI channel
        const aiChannel = chatClient.channel(
          "messaging",
          `ai-chat-${user?.id}`,
          {
            name: "AI Assistant 🤖",
            members: [user?.id, "ai-bot"],
          }
        );

        await aiChannel.watch();
        setChannel(aiChannel);
        setIsReady(true);

        // 4️⃣ Listen for new user messages → trigger AI reply
        aiChannel.on("message.new", async (event) => {
          const msg = event.message;
          if (msg.user.id === "ai-bot") return; // ignore AI's own messages

          await fetch(`${BACKEND_URL}/api/ai/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              channelId: `ai-chat-${user?.id}`,
              userId: user?.id,
              text: msg.text,
            }),
          });
        });
      } catch (err) {
        console.error("AI Chat setup error:", err);
      }
    };

    setupChat();
    return () => chatClient.disconnectUser();
  }, []);

  if (!isReady || !channel) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#555" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <MessageList />
          <MessageInput />
        </Channel>
      </Chat>
    </SafeAreaView>
  );
};

export default AIChatScreen;
