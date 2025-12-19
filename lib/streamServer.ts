import { StreamChat } from "stream-chat";

export const serverClient = StreamChat.getInstance(
  process.env.EXPO_PUBLIC_STREAM_CHAT_KEY!,
  process.env.STREAM_SECRET
);
