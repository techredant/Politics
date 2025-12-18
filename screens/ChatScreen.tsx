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
