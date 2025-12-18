import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  StatusBar,
  TextInput,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
} from "stream-chat-expo";

import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import LoaderKitView from "react-native-loader-kit";

const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_CHAT_KEY!;
const BACKEND_URL = "https://politics-chi.vercel.app/api/stream/token";
const USERS_URL = "https://politics-chi.vercel.app/api/users";

const chatClient = StreamChat.getInstance(STREAM_KEY);

interface Member {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  image?: string;
}

const ChatScreen = () => {
  const { user } = useUser();
  const { theme, isDark } = useTheme();

  const [isReady, setIsReady] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // ---------------- Setup Stream ----------------
  useEffect(() => {
    const setupStream = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (!data.token) throw new Error("No token");

        await chatClient.connectUser(
          {
            id: user.id,
            name: user.firstName || "Demo User",
            image: user?.imageUrl || "https://placekitten.com/200/200",
          },
          data.token
        );

        setIsReady(true);
      } catch (err) {
        console.error("Stream init error:", err);
      }
    };

    setupStream();
    return () => chatClient.disconnectUser();
  }, [user?.id]);

  // ---------------- Fetch members ----------------
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const res = await axios.get(USERS_URL);
        // console.log("Members fetched:", res.data); // debug
        setMembers(res.data || []);
      } catch (err) {
        console.error("Fetch members error:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (user?.id) fetchMembers();
  }, [user?.id]);

  // ---------------- Open direct channel ----------------
  const openDirectChannel = async (memberId: string) => {
    try {
      const newChannel = chatClient.channel("messaging", {
        members: [user?.id || "demo-user", memberId],
      });
      await newChannel.watch();
      setChannel(newChannel);
    } catch (err) {
      console.error("Open direct channel error:", err);
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <View>
          <LoaderKitView
            style={{ width: 50, height: 50 }}
            name={"BallPulseSync"}
            animationSpeedMultiplier={1.0}
            color={theme.text}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---------------- Filter members ----------------
  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <Chat client={chatClient} style={{ backgroundColor: theme.background }}>
        {!channel ? (
          <View style={{ flex: 1 }}>
            {/* Search Members */}
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search users or channels"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                style={[
                  styles.searchInput,
                  { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                ]}
              />
              {loadingMembers ? (
                <ActivityIndicator size="small" color={theme.text} style={{ marginTop: 8 }} />
              ) : (
                <FlatList
                  data={filteredMembers}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => openDirectChannel(item.clerkId)}
                      style={{ paddingVertical: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 5, gap: 10 }}
                    >
                      <Image source={{ uri: item?.image }}
                        height={30} width={30} alt="" style={{ borderRadius: 50 }} />
                      <Text style={{ color: theme.text, fontSize: 16 }}>
                        {item.firstName} {item.lastName}
                      </Text>
                    </Pressable>
                  )}
                  style={{ maxHeight: 200 }}
                />
              )}
            </View>

            {/* Channel List */}
            <ChannelList
              filters={{
                type: "messaging",
                members: { $in: [user?.id || "demo-user"] },
                ...(search ? { name: { $autocomplete: search } } : {}),
              }}
              onSelect={setChannel}
            />
          </View>
        ) : (
            <Channel channel={channel} onBackPress={() => setChannel(null)} audioRecordingEnabled>
              <View
                style={[
                  styles.channelContainer,
                  { backgroundColor: theme.background, paddingHorizontal: 10 },
                ]}
              >
                <View
                  style={[styles.chatHeader, { borderBottomColor: theme.border }]}
                >
                  {/* <Image source={{ uri: item?.image }}
                    height={30} width={30} alt="" style={{ borderRadius: 50 }} /> */}
                  <Text numberOfLines={1} style={[styles.channelName, { color: theme.text }]}>
                    {Object.values(channel.state.members)
                      .filter((m: any) => m.user.id !== user?.id) // exclude current user
                      .map((m: any) => m.user.name) // get name of other member
                      .join(", ") || "Chat"}
                  </Text>

                  <Pressable
                    onPress={() => setChannel(null)}
                    hitSlop={10}
                    style={{ paddingRight: 20 }}
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </Pressable>
                </View>

                <MessageList />
                <MessageInput />
              </View>
            </Channel>

        )}
      </Chat>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  channelContainer: { flex: 1 },
  channelName: { fontSize: 18, fontWeight: "600", padding: 12, width: "100%", paddingLeft: 40 },
  searchContainer: { padding: 10, paddingHorizontal: 20 },
  searchInput: { height: 40, borderRadius: 50, paddingHorizontal: 12, borderWidth: 1, fontSize: 14 },
  chatHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, justifyContent: "space-between" },
});
