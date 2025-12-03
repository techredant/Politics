// context/ChatContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { StreamChat, UserResponse } from "stream-chat";
import axios from "axios";

const BASE_URL = `http://${process.env.API_URL}`;


interface ChatContextType {
  client: StreamChat | null;
  user: UserResponse | null;
  users: UserResponse[]; // ✅ list of users fetched from API
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  apiKey: string; // Stream Chat API key
  userToken: string; // JWT token for this user
  userId: string; // only pass ID, we’ll fetch user info
  BASE_URL: string; // your backend API endpoint
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  apiKey,
  userToken,
  userId,
  BASE_URL,
}) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      try {
        // 1️⃣ Fetch logged-in user info
        const { data: loggedInUser } = await axios.get(
          `${BASE_URL}/api/users/${userId}`
        );

        // 2️⃣ Init Stream Chat client
        const chat = StreamChat.getInstance(apiKey);
        await chat.connectUser(loggedInUser, userToken);

        setClient(chat);
        setUser(loggedInUser);

        // 3️⃣ Fetch all users for contact list / search
        const { data: allUsers } = await axios.get(`${BASE_URL}/api/users`);
        setUsers(allUsers);
      } catch (err) {
        console.error("Error initializing Stream Chat:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      client?.disconnectUser();
    };
  }, [apiKey, userToken, userId]);

  return (
    <ChatContext.Provider value={{ client, user, users, loading }}>
      {children}
    </ChatContext.Provider>
  );
};

// ✅ Custom hook
export const useChat = (): ChatContextType => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};
