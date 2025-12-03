import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { useLevel } from "@/context/LevelContext";
import axios from "axios";
import { VideoView, useVideoPlayer } from "expo-video";
import VerifyButton from "@/components/VerifyButton";
import { useStripe } from "@stripe/stripe-react-native";
import { useUser } from "@clerk/clerk-expo";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userDetails, currentLevel, refreshUserDetails } = useLevel();
  const { user } = useUser();
  const [tab, setTab] = useState<"Posts" | "Followers" | "Following">("Posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { theme, isDark, toggleTheme } = useTheme();

  const route = useRoute<RouteProp<RootStackParamList, "ProfileScreen">>();
  const profileUserId = route.params?.userId;

  const handleCheckout = async () => {
    try {
      const response = await fetch(
        `http://192.168.100.4:3000/api/stripe/create-payment-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 500, // e.g. 500 KES
            currency: "kes", // ✅ KES for Kenya
          }),
        }
      );

      const { clientSecret, error } = await response.json();
      if (error || !clientSecret) {
        Alert.alert("Error", error || "No client secret returned");
        return;
      }

      const init = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Broadcast App",
        defaultBillingDetails: {
          name: "Customer",
          email: "customer@example.com",
        },
      });

      if (init.error) {
        Alert.alert("Error", init.error.message);
        return;
      }

      const payment = await presentPaymentSheet();

      if (payment.error) {
        Alert.alert("Payment failed", payment.error.message);
      } else {
        Alert.alert("Success", "Thanks for buying me coffee ☕ with M-Pesa!");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      Alert.alert("Checkout error", err.message);
    }
  };

  const [followers] = useState([
    {
      id: "1",
      name: "Alice",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      id: "2",
      name: "Bob",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      id: "3",
      name: "Charlie",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  ]);
  const [followingIds, setFollowingIds] = useState<string[]>(["2"]);

  // ---------------------- Fetch posts ----------------------
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!userDetails?.clerkId || !hasMore) return;

    setLoadingPosts(true);
    try {
      let url = `http://192.168.100.4:3000/api/posts?userId=${userDetails.clerkId}&page=${page}&limit=10`;
      if (currentLevel.type !== "home") {
        url += `&levelType=${currentLevel.type}&levelValue=${currentLevel.value}`;
      }

      const res = await axios.get(url);
      if (res.data.length < 10) setHasMore(false); // no more posts
      setPosts((prev) => [...prev, ...res.data]); // append new posts
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [userDetails?.clerkId, currentLevel, page, hasMore]);

  // Fetch posts when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  // Refresh userDetails once on mount
  useEffect(() => {
    refreshUserDetails();
  }, []);

  // ---------------------- Flatten media for rendering ----------------------
  const flatMediaItems = useMemo(() => {
    return posts.flatMap((post) => {
      if (!post.media) return [];
      return post.media.map((url: string) => ({
        _id: post._id + "_" + url,
        url,
        type: url.endsWith(".mp4") ? "video" : "image",
      }));
    });
  }, [posts]);

  const mediaCount = flatMediaItems.length;

  const POST_MARGIN = 4;
  const NUM_COLUMNS = 3;
  const POST_WIDTH = (width - POST_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

  const PostItem = ({
    item,
  }: {
    item: { _id: string; type: string; url: string };
  }) => {
    const mediaStyle = {
      width: POST_WIDTH,
      height: POST_WIDTH, // square
      borderRadius: 8,
    };

    if (item.type === "image") {
      return (
        <View style={{ margin: POST_MARGIN / 2 }}>
          <Image source={{ uri: item.url }} style={mediaStyle} />
        </View>
      );
    }

    const player = useVideoPlayer(item.url, (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    });

    return (
      <View style={{ margin: POST_MARGIN / 2 }}>
        <VideoView
          style={mediaStyle}
          player={player}
          // allowsFullscreen
          // allowsPictureInPicture
        />
      </View>
    );
  };

  const toggleFollow = (userId: string) => {
    setFollowingIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const renderFollower = ({ item }: { item: (typeof followers)[0] }) => {
    const isFollowing = followingIds.includes(item.id);
    return (
      <View style={styles.followerCard}>
        <Image source={{ uri: item.avatar }} style={styles.followerAvatar} />
        <Text style={styles.followerName}>{item.name}</Text>
        <TouchableOpacity
          style={[
            styles.followButton,
            {
              backgroundColor: isFollowing ? "#fff" : "#4caf50",
              borderWidth: isFollowing ? 1 : 0,
            },
          ]}
          onPress={() => toggleFollow(item.id)}
        >
          <Text
            style={{
              color: isFollowing ? "#4caf50" : "#fff",
              fontWeight: "bold",
            }}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text></Text>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather
            name={isDark ? "sun" : "moon"}
            size={20}
            color={theme.text}
            style={{ marginRight: 8 }}
          />
          {/* <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text }}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </Text> */}
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate("ChatScreen")}
        ></TouchableOpacity> */}
      </View>

      {/* User Info */}
      <View style={{ paddingHorizontal: 16 }}>
        <View className="flex-row items-center mb-4 px-4">
          <Image
            source={{
              uri:
                userDetails?.image && userDetails.image.trim() !== ""
                  ? userDetails?.image
                  : user?.imageUrl || "",
            }}
            className="w-20 h-20 rounded-full border border-gray-300"
          />

          <View className="flex-1 ml-3">
            <Text
              className="text-lg font-bold text-gray-900"
              style={{ color: theme.text }}
            >
              {userDetails?.firstName}
            </Text>
            <Text className="text-sm text-gray-500">
              @{userDetails?.nickName}
            </Text>
          </View>

          <VerifyButton />
        </View>

        <View className="flex-row justify-center space-x-3 gap-5">
          {/* Edit Profile */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center border border-gray-300 rounded-lg px-4 py-2 bg-white"
            activeOpacity={0.7}
            onPress={() => navigation.navigate("NamesScreen")}
          >
            <Text className="text-base">✏️</Text>
            <Text className="ml-2 text-sm font-medium text-gray-700">
              Edit Profile
            </Text>
          </TouchableOpacity>

          {/* Buy Me Coffee */}
          <TouchableOpacity
            className="flex-row items-center justify-center border border-yellow-400 rounded-lg px-4 py-2 bg-yellow-50"
            activeOpacity={0.7}
            onPress={handleCheckout}
            // style={{backgroundColor: theme.card}}
          >
            <Text className="text-base">☕</Text>
            <Text className="ml-2 text-sm font-medium text-yellow-800">
              Buy me Coffee
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => setTab("Posts")}
        >
          <Text style={[styles.statNumber, { color: theme.subtext }]}>
            {mediaCount}
          </Text>
          <Text style={styles.statLabel}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => setTab("Followers")}
        >
          <Text style={[styles.statNumber, { color: theme.subtext }]}>
            {followers.length}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => setTab("Following")}
        >
          <Text style={[styles.statNumber, { color: theme.subtext }]}>
            {followingIds.length}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Indicator */}
      <View style={styles.tabIndicatorRow}>
        {["Posts", "Followers", "Following"].map((t) => (
          <View
            key={t}
            style={[
              styles.tabIndicator,
              { backgroundColor: tab === t ? "blue" : "transparent" },
            ]}
          />
        ))}
      </View>

      {/* Tab Content */}
      {tab === "Posts" ? (
        loadingPosts ? (
          <ActivityIndicator
            size="large"
            color="blue"
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={flatMediaItems}
            renderItem={({ item }) => <PostItem item={item} />}
            keyExtractor={(item) => item._id}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{ padding: POST_MARGIN }}
            initialNumToRender={6} // only render first 6 items
            maxToRenderPerBatch={6}
            windowSize={5}
            contentContainerClassName="pb-40"
          />
        )
      ) : tab === "Followers" ? (
        <FlatList
          data={followers}
          renderItem={renderFollower}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      ) : (
        <FlatList
          data={followers.filter((f) => followingIds.includes(f.id))}
          renderItem={renderFollower}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#222" },
  statLabel: { fontSize: 13, color: "#666", fontWeight: "600" },
  tabIndicatorRow: { flexDirection: "row", justifyContent: "space-around" },
  tabIndicator: {
    width: 100,
    height: 3,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  postCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
  },
  followerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  followerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  followerName: { fontSize: 16, color: "#222", flex: 1 },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
