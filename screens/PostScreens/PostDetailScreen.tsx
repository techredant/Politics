import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  AntDesign,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import moment from "moment";
import Video from "react-native-video";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";
import { useLevel } from "@/context/LevelContext";
import type { RootStackParamList } from "../../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

// const BASE_URL = "https://politics-chi.vercel.app/api";
const { width, height } = Dimensions.get("window");

type PostDetailRouteProp = RouteProp<RootStackParamList, "PostDetail">;

const PostDetailScreen = () => {
  const route = useRoute<PostDetailRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const { user } = useUser();
  const currentUser = { _id: user?.id };
  const { userDetails } = useLevel();

  const [post, setPost] = useState(route.params.post);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<{ [key: number]: Video | null }>({});

  // Handle like
  const handleLike = async () => {
    try {
      setPost((prev) => {
        const likes = prev.likes || [];
        const alreadyLiked = likes.includes(currentUser._id);

        return {
          ...prev,
          likes: alreadyLiked
            ? likes.filter((id) => id !== currentUser._id)
            : [...likes, currentUser._id],
        };
      });

      await axios.post(`https://politics-chi.vercel.app/posts/${post._id}/like`, {
        userId: currentUser._id,
      });
    } catch (err) {
      console.error("Error liking post:", err);
      setPost(post); // rollback
    }
  };

  const handleRetweet = (id: string) => {
    console.log("Retweeted", id);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const isVideo = item.endsWith(".mp4");
    return isVideo ? (
      <Video
        ref={(ref) => (videoRefs.current[index] = ref)}
        source={{ uri: item }}
        style={styles.singleMedia}
        resizeMode="cover"
        repeat
        paused={currentIndex !== index}
        controls
      />
    ) : (
      <Image
        source={{ uri: item }}
        style={styles.singleMedia}
        resizeMode="cover"
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <Image
            source={{ uri: userDetails?.image || user?.imageUrl }}
            style={styles.userImg}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.firstName}
            </Text>
            {user?.lastName && (
              <Text style={styles.nickname}>@{user?.lastName}</Text>
            )}
          </View>
          <Text style={styles.time}>{moment(post.createdAt).fromNow()}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={isDark ? "#fff" : "#000"} />
        </TouchableOpacity>
      </View>

      {/* Media FlatList */}
      <FlatList
        data={post.media}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsHorizontalScrollIndicator={false}
      />

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.action} onPress={handleLike}>
          <AntDesign
            name={post.likes?.includes(currentUser._id) ? "heart" : "hearto"}
            size={20}
            color={post.likes?.includes(currentUser._id) ? "red" : theme.text}
          />
          <Text style={[styles.actionText, { color: theme.text }]}>
            {post.likes?.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => navigation.navigate("CommentsScreen", { post })}
        >
          <Feather name="message-circle" size={20} color={theme.text} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            {post.commentsCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={() => handleRetweet(post._id)}
        >
          <FontAwesome5
            name="retweet"
            size={20}
            color={post.originalPostId ? "green" : theme.text}
          />
          <Text style={[styles.actionText, { color: theme.text }]}>
            {post.retweets?.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <MaterialCommunityIcons
            name="comment-quote-outline"
            size={20}
            color={theme.text}
          />
          <Text style={[styles.actionText, { color: theme.text }]}>
            {post.rcast}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action}>
          <Feather name="share" size={20} color={theme.text} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            {post.shares}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {post.caption && (
        <Text style={[styles.caption, { color: theme.text }]}>
          {post.caption}
        </Text>
      )}
    </SafeAreaView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  userImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: "#ddd",
  },
  userName: { fontSize: 16, fontWeight: "600" },
  nickname: { fontSize: 13, color: "gray" },
  time: { fontSize: 12, color: "gray", marginLeft: "auto" },

  caption: {
    fontSize: 16,
    paddingHorizontal: 15,
    marginTop: 10,
    lineHeight: 22,
  },

  singleMedia: { width, height: 380, borderRadius: 10 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderColor: "#eee",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
});
