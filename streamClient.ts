// streamClient.ts
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = "YOUR_STREAM_API_KEY";

export const chatClient = StreamChat.getInstance(STREAM_API_KEY);

export const initStreamUser = async (
  userId: string,
  token: string,
  name: string,
  image?: string
) => {
  await chatClient.connectUser(
    {
      id: userId,
      name,
      image,
    },
    token
  );
};
