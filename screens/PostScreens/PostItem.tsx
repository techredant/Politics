import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
  Share,
  ActivityIndicator,
} from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import PostOptionsModal from "./postOptions";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import Video from "react-native-video";
import { useLevel } from "@/context/LevelContext";
import { useTheme } from "@/context/ThemeContext";
import * as Linking from "expo-linking";
import moment from "moment";

interface PostItemProps {
  post: any;
  currentUserId?: string;
  currentUserNickname?: string;
  socket?: any;
  handleDeletePost?: (postId: string) => void;
  isVisible: boolean;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  isVisible,
  currentUserId,
  currentUserNickname,
  socket,
  handleDeletePost,
}) => {
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const { user } = useUser();
  const [currentPost, setCurrentPost] = useState(post);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [loadingRecasts, setLoadingRecasts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // default muted
  const { theme } = useTheme();
  const [linkData, setLinkData] = useState<{
    url: string;
    title?: string;
    description?: string;
    images?: string[];
  } | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userDetails } = useLevel();

  const isLiked = currentUserId
    ? currentPost.likes?.includes(currentUserId)
    : false;
  const isRecasted = currentUserId
    ? currentPost.recasts?.some((r: any) => r.userId === currentUserId)
    : false;

  const likeScale = useRef(new Animated.Value(1)).current;
  const recastScale = useRef(new Animated.Value(1)).current;

  /** Real-time socket updates */
  useEffect(() => {
    if (!socket) return;
    if (!currentPost?._id) return;

    const handleUpdate = (updatedPost: any) => {
      if (updatedPost._id === currentPost._id) {
        setCurrentPost(updatedPost);
      }
    };

    const handleDelete = (deletedPostId: any) => {
      if (deletedPostId === currentPost._id) {
        handleDeletePost?.(deletedPostId);
      }
    };

    socket.on("updatePost", handleUpdate);
    socket.on("deletePost", handleDelete);

    return () => {
      socket.off("updatePost", handleUpdate);
      socket.off("deletePost", handleDelete);
    };
  }, [socket, currentPost?._id]); // ✅ only depend on post ID

  /** Like post */
  const handleLike = async () => {
    if (!currentUserId) return;

    // Optimistic UI update
    const alreadyLiked = currentPost.likes?.includes(currentUserId);
    const updatedLikes = alreadyLiked
      ? currentPost.likes.filter((id: string) => id !== currentUserId)
      : [...currentPost.likes, currentUserId];

    setCurrentPost({ ...currentPost, likes: updatedLikes });

    // Animate like button for feedback
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    try {
      await axios.post(
        `http://192.168.100.4:3000/api/posts/${currentPost._id}/like`,
        { userId: currentUserId }
      );
      await incrementViews(); // ✅ Increase views
    } catch (err) {
      console.error(err);
      // Rollback if backend fails
      setCurrentPost(currentPost);
    }
  };

  /** Recast post */
  const handleRecast = async (quote = "") => {
    if (!currentUserId) return;
    setLoadingRecasts(true);
    try {
      await axios.post(
        `http://192.168.100.4:3000/api/posts/${currentPost._id}/recast`,
        {
          userId: currentUserId,
          nickname: user?.username || currentUserNickname || "anon",
          quoteText: quote,
        }
      );

      await incrementViews(); // ✅ Add this line

      setQuoteVisible(false);
      setQuoteText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecasts(false);
    }
  };

  const incrementViews = async () => {
    try {
      await axios.post(
        `http://192.168.100.4:3000/api/posts/${currentPost._id}/view`
      );
      setCurrentPost((prev: any) => ({ ...prev, views: prev.views + 1 }));
    } catch (err) {
      console.error("View increment failed:", err);
    }
  };

  /** Share post */
  const handleShare = async () => {
    try {
      const postLink = `http://192.168.100.4:3000/${currentPost._id}`;
      await Share.share({ message: `${currentPost.caption}\n${postLink}` });
      await incrementViews(); // ✅ Add this line
    } catch (err) {
      console.error(err);
    }
  };

  const pureRecasts = (currentPost.recasts || []).filter((r: any) => !r.quote);
  const quoteRecasts = (currentPost.recasts || []).filter((r: any) => r.quote);
  const recites = (currentPost.recasts || []).filter((r: any) => r.quote);

  useEffect(() => {
    let interval: any;
    if (!verified && verificationStarted && user) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(
            `http://192.168.100.4:3000/api/users/${user.id}`
          );
          if (res.data.isVerified) {
            setVerified(true);
            setVerificationStarted(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [verified, verificationStarted, user]);

  useEffect(() => {
    if (user) setVerificationStarted(true);
  }, [user]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("PostDetail", { post: currentPost })}
      style={{ backgroundColor: theme.background }}
    >
      <View
        style={{
          marginVertical: 2,
          backgroundColor: theme.card,
          borderRadius: 10,
          elevation: 2,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProfileScreen", {
                userId: currentPost.user?._id,
              })
            }
            style={styles.userInfo}
          >
            <Image
              source={
                currentPost.user?.image?.trim()
                  ? { uri: currentPost.user.image }
                  : currentPost.user?.clerkId === user?.id && user?.imageUrl
                  ? { uri: user.imageUrl }
                  : require("@/assets/icon.jpg") // 👈 fallback placeholder
              }
              style={styles.avatar}
            />

            <View style={{ marginLeft: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {currentPost.user?.firstName ?? "Unknown"}{" "}
                  {currentPost.user?.lastName ?? ""}
                </Text>
                {verified && (
                  <Image
                    source={require("@/assets/verif.png")}
                    style={{ width: 18, height: 18, marginLeft: 6 }}
                  />
                )}
              </View>
              <Text style={styles.nickName}>
                @{currentPost.user?.nickName ?? "anon"}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "bold",
                  fontStyle: "italic",
                  color: theme.subtext,
                }}
              >
                {currentPost.levelValue === "home"
                  ? ""
                  : `#${currentPost.levelValue} ${currentPost.levelType}`}
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              // iOS shadow
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              // Android shadow
              elevation: 4,
              backgroundColor: theme.background, // required for Android shadows
              borderRadius: 50,
              padding: 4, // optional for spacing
            }}
          >
            <Ionicons name="time-outline" size={14} color="gray" />
            <Text
              style={{
                color: theme.subtext,
                fontWeight: "semibold",
                fontSize: 10,
                fontStyle: "italic",
              }}
            >
              {moment(currentPost.createdAt).fromNow()}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setOptionsVisible(true)}>
            <Feather name="more-vertical" size={20} color="gray" />
          </TouchableOpacity>

          {optionsVisible && (
            <PostOptionsModal
              post={currentPost}
              currentUserId={currentUserId!}
              onDelete={(postId) => handleDeletePost?.(postId)}
              onClose={() => setOptionsVisible(false)}
            />
          )}
        </View>

        {/* Quote Recasts */}
        {quoteRecasts.length > 0 &&
          quoteRecasts.map((r: any, i: number) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                marginVertical: 2,
                padding: 10,
                borderBottomWidth: 1,
                borderColor: theme.border,
              }}
            >
              {/* Avatar */}
              <Image
                source={{ uri: user?.imageUrl }}
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 50,
                  marginRight: 8,
                }}
              />

              {/* Right side: name/time + quote */}
              <View style={{ flex: 1 }}>
                {/* First row: name + time */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginRight: 6,
                      color: theme.text,
                    }}
                  >
                    {r.nickname}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      // iOS shadow
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      // Android shadow
                      elevation: 4,
                      backgroundColor: theme.background, // required for Android shadows
                      borderRadius: 50,
                      padding: 4, // optional for spacing
                    }}
                  >
                    <Ionicons name="time-outline" size={14} color="gray" />
                    <Text
                      style={{
                        color: theme.subtext,
                        fontWeight: "semibold",
                        fontSize: 10,
                        fontStyle: "italic",
                      }}
                    >
                      {moment(r.createdAt).fromNow()}
                    </Text>
                  </View>
                </View>

                {/* Second row: quote */}
                <Text
                  style={{ fontWeight: "500", color: "gray", marginTop: 2 }}
                >
                  {r.quote}
                </Text>
              </View>
            </View>
          ))}

        {/* Caption */}
        <Text style={[styles.caption, { color: theme.subtext }]}>
          {currentPost.caption}
        </Text>

        {/* Media */}
        {currentPost.media && currentPost.media.length > 0 && (
          <>
            {currentPost.media.length === 1 ? (
              currentPost.media[0].endsWith(".mp4") ? (
                <View>
                  <Video
                    source={{ uri: currentPost.media[0] }}
                    style={styles.oneImage}
                    resizeMode="cover"
                    repeat
                    controls
                    paused={!isVisible}
                    muted={isMuted}
                  />
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderRadius: 20,
                      padding: 6,
                    }}
                    onPress={() => setIsMuted((prev) => !prev)}
                  >
                    <Ionicons
                      name={isMuted ? "volume-mute" : "volume-high"}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <Image
                  source={{ uri: currentPost.media[0] }}
                  style={styles.oneImage}
                  resizeMode="cover"
                />
              )
            ) : (
              <View style={styles.mediaGrid}>
                {currentPost.media
                  .slice(0, 4)
                  .map((item: string, idx: number) => {
                    const isVideo = item.endsWith(".mp4");
                    const remaining = currentPost.media.length - 4;
                    const showOverlay = idx === 3 && remaining > 0; // 👈 show on 4th item

                    return (
                      <View key={idx} style={styles.fourImages}>
                        {isVideo ? (
                          <Video
                            source={{ uri: item }}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 6,
                            }}
                            resizeMode="cover"
                            paused={!isVisible}
                            repeat
                            muted={isMuted}
                          />
                        ) : (
                          <Image
                            source={{ uri: item }}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 6,
                            }}
                            resizeMode="cover"
                          />
                        )}

                        {/* 🔢 Overlay if more than 4 */}
                        {showOverlay && (
                          <View
                            style={{
                              ...StyleSheet.absoluteFillObject,
                              backgroundColor: "rgba(0,0,0,0.5)",
                              borderRadius: 6,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 28,
                                fontWeight: "bold",
                              }}
                            >
                              +{remaining}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
              </View>
            )}
          </>
        )}

        {currentPost.linkPreview && (
          <TouchableOpacity
            onPress={() => Linking.openURL(currentPost.linkPreview.url)}
            style={[styles.linkPreview, { borderColor: theme.border }]}
          >
            {currentPost.linkPreview.images?.[0] ? (
              <Image
                source={{ uri: currentPost.linkPreview.images[0] }}
                style={styles.linkImg}
              />
            ) : (
              <View style={styles.linkFallback}>
                <Text>No preview available</Text>
              </View>
            )}

            <View style={{ padding: 10 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 4,
                  color: theme.text,
                }}
              >
                {currentPost.linkPreview.title}
              </Text>
              {currentPost.linkPreview.description && (
                <Text style={{ fontSize: 12, color: "gray" }}>
                  {currentPost.linkPreview.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Actions */}
        <View style={[styles.actions, { borderColor: theme.border }]}>
          {/* Like */}
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <AntDesign
                name={isLiked ? "heart" : "hearto"}
                size={20}
                color={isLiked ? "red" : "gray"}
              />
            </Animated.View>
            <Text style={styles.count}>
              {currentPost.likes?.length > 0 ? currentPost.likes.length : " "}
            </Text>
          </TouchableOpacity>

          {/* Comments */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              await incrementViews(); // ✅ increment view
              navigation.navigate("CommentsScreen", { post: currentPost });
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="gray" />
            <Text style={styles.count}>
              {currentPost.commentsCount > 0 ? currentPost.commentsCount : " "}
            </Text>
          </TouchableOpacity>

          {/* Recast */}
          <TouchableOpacity
            onPress={() => handleRecast()}
            style={styles.actionButton}
          >
            <Animated.View style={{ transform: [{ scale: recastScale }] }}>
              <MaterialCommunityIcons
                name="repeat-variant"
                size={20}
                color={isRecasted ? "green" : "gray"}
              />
            </Animated.View>
            <Text style={styles.count}>
              {pureRecasts.length > 0 ? pureRecasts.length : " "}
            </Text>
          </TouchableOpacity>

          {/* Recite */}
          <TouchableOpacity
            onPress={async () => {
              await incrementViews(); // ✅
              setQuoteVisible(true);
            }}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="comment-quote-outline"
              size={20}
              color="gray"
            />
            <Text style={styles.count}>
              {recites.length > 0 ? recites.length : " "}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButton}>
            <Ionicons name="eye-outline" size={20} color="gray" />
            <Text style={styles.count}>
              {currentPost.views > 0 ? currentPost.views : " "}
            </Text>
          </View>

          {/* Share */}
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={20} color="gray" />
            <Text style={styles.count}> </Text>
          </TouchableOpacity>
        </View>

        {/* {pureRecasts.length > 0 && (
          <Text style={[styles.recastedText]}>
            Recasted by @{pureRecasts[pureRecasts.length - 1].nickname}
          </Text>
        )} */}

        {pureRecasts.length > 0 && (
          <Text style={styles.recastedText}>
            Recasted by{" "}
            {pureRecasts.map((r: any, idx: number) => (
              <Text key={idx} style={{ fontWeight: "bold" }}>
                @{r.nickname}
                {idx < pureRecasts.length - 1 ? ", " : ""}
              </Text>
            ))}
          </Text>
        )}

        {/* Quote modal */}
        <Modal visible={quoteVisible} transparent animationType="fade">
          <View
            style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          >
            <View style={[styles.quoteModal, { backgroundColor: theme.card }]}>
              <Text style={[styles.quoteTitle, { color: theme.text }]}>
                Quote Recast
              </Text>
              <TextInput
                value={quoteText}
                onChangeText={setQuoteText}
                placeholder="Add a comment..."
                placeholderTextColor={theme.subtext}
                multiline
                style={[
                  styles.quoteInput,
                  { color: theme.text, borderColor: theme.subtext },
                ]}
              />
              <View style={styles.quoteActions}>
                <TouchableOpacity onPress={() => setQuoteVisible(false)}>
                  <Text style={[styles.cancel, { color: "red" }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRecast(quoteText)}>
                  <Text style={[styles.send, { color: "blue" }]}>send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableOpacity>
  );
};

export default PostItem;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontWeight: "bold", fontSize: 12 },
  nickName: { color: "gray", fontSize: 10 },
  caption: {
    fontSize: 14,
    marginVertical: 8,
    fontWeight: "600",
    paddingHorizontal: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 50,
    borderColor: "whitesmoke",
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 10,
  },
  count: {
    marginLeft: 2,
    fontSize: 13,
    color: "gray",
    minWidth: 12, // keeps space even if empty
    textAlign: "center",
  },
  recastedText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
    fontStyle: "italic",
    paddingHorizontal: 10,
  },
  oneImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginVertical: 8,
    justifyContent: "space-between",
  },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 8 },
  fourImages: {
    flexBasis: "49%", // take half width but leave small spacing
    flexGrow: 1,
    height: 200,
    marginBottom: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  overlayText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  quoteModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  quoteTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  quoteInput: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  quoteActions: { flexDirection: "row", justifyContent: "center", gap: 10 },
  cancel: {
    color: "red",
    fontWeight: "bold",
    padding: 10,
  },
  send: {
    color: "blue",
    fontWeight: "bold",
    padding: 10,
  },
  linkPreview: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  linkImg: { width: "100%", height: 300 },
  linkFallback: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  linkLoading: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
});
