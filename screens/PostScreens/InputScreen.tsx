import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useLevel } from "@/context/LevelContext";
import Video from "react-native-video";
import * as Linking from "expo-linking";
import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "@/config";

const InputScreen = () => {
  const [cast, setCast] = useState("");
  const [media, setMedia] = useState<
    { uri: string; type: "image" | "video" }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const [accountType, setAccountType] = useState<string | null>(null);
  const [linkData, setLinkData] = useState<{
    url: string;
    title?: string;
    description?: string;
    images?: string[];
  } | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const { user } = useUser();
  const { currentLevel } = useLevel();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  // Load account type from Clerk metadata
  useEffect(() => {
    if (user) {
      const type =
        typeof user.unsafeMetadata?.accountType === "string"
          ? user.unsafeMetadata.accountType
          : "Personal Account";
      setAccountType(type);
    }
  }, [user]);

  // Detect link in text and fetch preview
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = cast.match(urlRegex);

    if (urls?.length) {
      const url = urls[0];
      setLinkLoading(true);

      fetch(url)
        .then((res) => res.text())
        .then((html) => {
          const titleMatch = html.match(/<title>(.*?)<\/title>/i);
          const descMatch = html.match(
            /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i
          );
          const ogImageMatch = html.match(
            /<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i
          );

          setLinkData({
            url,
            title: titleMatch?.[1] || "No title",
            description: descMatch?.[1] || "",
            images: ogImageMatch ? [ogImageMatch[1]] : [],
          });
        })
        .catch(() => {
          setLinkData({
            url,
            title: "Preview not available",
            description: "",
            images: [],
          });
        })
        .finally(() => setLinkLoading(false));
    } else {
      setLinkData(null);
    }
  }, [cast]);

  // Pick from gallery
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "livePhotos", "videos"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const assets = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type as "image" | "video",
      }));
      setMedia((prev) => [...prev, ...assets]);
      setPostError("");
    }
  };

  // Camera capture
  const takePhotoOrVideo = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ["images", "videos"],
      quality: 1,
    });

    if (!result.canceled) {
      setMedia((prev) => [
        ...prev,
        {
          uri: result.assets[0].uri,
          type: result.assets[0].type as "image" | "video",
        },
      ]);
      setPostError("");
    }
  };

  // Remove media
  const removeMedia = (uri: string) => {
    setMedia((prev) => prev.filter((item) => item.uri !== uri));
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (uri: string, type: "image" | "video") => {
    const data = new FormData();
    data.append("file", {
      uri,
      type: type === "video" ? "video/mp4" : "image/jpeg",
      name: type === "video" ? "upload.mp4" : "upload.jpg",
    } as any);
    data.append("upload_preset", "MediaCast");
    data.append("cloud_name", "ds25oyyqo");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/ds25oyyqo/${type}/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();
      return result.secure_url;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return null;
    }
  };

  const handlePost = async (
    postType: "normal" | "recasted" | "recited" = "normal",
    originalPostId?: string
  ) => {
    setPostError("");

    if (!user) return setPostError("You must be signed in to post.");
    // if (!cast && media.length === 0 && postType === "normal")
    //   return setPostError("Please add a caption or media before posting.");

    setLoading(true);

    try {
      // Upload media
      const uploadedUrls: string[] = [];
      for (let item of media) {
        const url = await uploadToCloudinary(item.uri, item.type);
        if (url) uploadedUrls.push(url);
      }

      const levelType =
        accountType === "Personal Account" && currentLevel?.type
          ? currentLevel.type
          : "organization";

      const levelValue =
        accountType === "Personal Account" && currentLevel?.value
          ? currentLevel.value
          : (user.publicMetadata?.companyName as string) || "Org";

      // Post payload
      const safeLinkData = linkData
        ? {
            url: linkData.url,
            title: linkData.title || "",
            description: linkData.description || "",
            images: linkData.images?.slice() || [],
          }
        : null;

      const payload = {
        userId: user.id,
        caption: cast,
        media: uploadedUrls,
        levelType,
        levelValue,
        linkPreview: safeLinkData,
        type: postType,
        originalPostId: originalPostId || null,
      };

      const res = await axios.post(
        `http://${API_URL}/api/posts`,
        payload
      );

      // console.log("✅ Post saved:", res.data);

      // Reset state
      setCast("");
      setMedia([]);
      setLinkData(null);
      navigation.goBack();
    } catch (err: any) {
      console.error("❌ Post Error:", err.response?.data || err.message);
      setPostError("Something went wrong while posting. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  const formattedTitle: string =
    currentLevel?.type === "home"
      ? "Home"
      : currentLevel?.value && currentLevel?.type
      ? `${capitalize(currentLevel.value)} ${capitalize(currentLevel.type)}`
      : "Update in your Profile";

  function capitalize(str: string | undefined): string {
    return typeof str === "string"
      ? str.charAt(0).toUpperCase() + str.slice(1)
      : "";
  }
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent" // prevent the warning
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.subtext} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {accountType === "Personal Account"
            ? formattedTitle
              ? formattedTitle
              : currentLevel?.value && currentLevel?.type
              ? `${capitalize(currentLevel.value)} ${capitalize(
                  currentLevel.type
                )}`
              : "Update in your Profile"
            : (user?.publicMetadata?.companyName as string) || "Organization"}
        </Text>

        <TouchableOpacity
          disabled={!cast && media.length === 0}
          onPress={() => handlePost()}
          style={[
            styles.postButton,
            { opacity: cast || media.length > 0 ? 1 : 0.6 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Media Previews */}
      {media.length > 0 &&
        (media.length === 1 ? (
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            {media[0].type === "image" ? (
              <Image
                source={{ uri: media[0].uri }}
                style={{ width: "100%", height: 300, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : (
              <Video
                source={{ uri: media[0].uri }}
                style={{ width: "100%", height: 300, borderRadius: 12 }}
                resizeMode="cover"
                controls
              />
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeMedia(media[0].uri)}
            >
              <Ionicons name="close-circle" size={28} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ height: 300, marginBottom: 10 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 6,
              }}
            >
              {media.map((item, index) => (
                <View
                  key={index}
                  style={{
                    position: "relative",
                    width: 250,
                    height: 300,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {item.type === "image" ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Video
                      source={{ uri: item.uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                      controls
                      paused
                    />
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMedia(item.uri)}
                  >
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}

      {postError ? <Text style={{ color: "red" }}>{postError}</Text> : null}

      {/* Caption */}
      <TextInput
        placeholder={
          accountType === "Personal Account"
            ? "What's on your mind..."
            : "Share your news, post, or media..."
        }
        placeholderTextColor={theme.subtext}
        style={[
          styles.captionInput,
          { borderColor: theme.border, color: theme.text },
        ]}
        multiline
        value={cast}
        onChangeText={setCast}
      />

      {/* Link preview */}
      {linkData && (
        <TouchableOpacity
          onPress={() => Linking.openURL(linkData.url)}
          style={[styles.linkPreview, { borderColor: theme.border }]}
        >
          {linkLoading ? (
            <View style={styles.linkLoading}>
              <ActivityIndicator size="small" color="gray" />
            </View>
          ) : linkData.images?.[0] ? (
            <Image
              source={{ uri: linkData.images[0] }}
              style={styles.linkImg}
            />
          ) : (
            <View style={styles.linkFallback}>
              <Text>No preview available</Text>
            </View>
          )}

          <View style={{ padding: 10 }}>
            <Text
              style={{ fontWeight: "bold", marginBottom: 4, color: theme.text }}
            >
              {linkData.title}
            </Text>
            {linkData.description && (
              <Text style={{ fontSize: 12, color: theme.subtext }}>
                {linkData.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={takePhotoOrVideo}>
          <Ionicons name="camera" size={24} color={theme.text} />
          <Text style={{ color: theme.text }}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={pickMedia}>
          <Ionicons name="image" size={24} color={theme.text} />
          <Text style={{ color: theme.text }}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InputScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 30,
  },
  headerTitle: { fontWeight: "bold", fontSize: 18 },
  postButton: {
    backgroundColor: "blue",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  postButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  previewWrapper: { position: "relative", marginRight: 10 },
  postImg: { width: 300, height: 300, borderRadius: 12 },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 12,
  },
  captionInput: {
    minHeight: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    marginVertical: 20,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  linkPreview: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  linkImg: { width: "100%", height: 160 },
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
