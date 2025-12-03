import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Video from "react-native-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

interface MediaItem {
  _id: string;
  url: string;
  type: "image" | "video";
  nickname?: string;
  post: any;
}

const POST_MARGIN = 4;
const NUM_COLUMNS = 3;
const POST_WIDTH = (width - POST_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const MediaScreen = () => {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme, isDark } = useTheme();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://192.168.100.4:3000/api/posts`);
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  // Flatten posts → media items
  const flatMediaItems: MediaItem[] = useMemo(() => {
    return posts.flatMap((post) => {
      if (!post.media) return [];
      return post.media.map((url: string, index: number) => ({
        _id: post._id + "_" + index,
        url,
        type: url.endsWith(".mp4") ? "video" : "image",
        nickname: post.user?.nickName || post.user?.firstName || "Anonymous",
        post,
      }));
    });
  }, [posts]);

  const renderItem = ({ item }: { item: MediaItem }) => {
    return (
      <View style={{ margin: POST_MARGIN / 2 }}>
        {item.type === "image" ? (
          <Image
            source={{ uri: item.url }}
            style={{ width: POST_WIDTH, height: POST_WIDTH, borderRadius: 8 }}
          />
        ) : (
          <Video
            source={{ uri: item.url }}
            style={{ width: POST_WIDTH, height: POST_WIDTH, borderRadius: 8 }}
            resizeMode="cover"
            repeat
            muted
            paused={false}
          />
        )}

        {/* Transparent overlay to catch taps */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={() => navigation.navigate("PostDetail", { post: item.post })}
        />

        {/* Nickname footer */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingVertical: 2,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              textAlign: "center",
              color: "#fff",
              paddingVertical: 2,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.nickname}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  if (flatMediaItems.length === 0) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>No media found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <FlatList
        data={flatMediaItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ padding: POST_MARGIN / 2 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingVertical: 16, marginTop: 10 }}>
            <Text
              style={{
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 20,
                color: theme.text,
              }}
            >
              Media
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MediaScreen;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
