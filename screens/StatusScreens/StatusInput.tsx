import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";

type Media = { uri: string; type: "image" | "video" };
const screenWidth = Dimensions.get("window").width;

const StatusInput = () => {
  const [status, setStatus] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type as "image" | "video",
      }));
      setMedia((prev) => [...prev, ...newMedia]);
    }
  };

  const takeMedia = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
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
    }
  };

  const removeMedia = (uri: string) => {
    setMedia((prev) => prev.filter((m) => m.uri !== uri));
  };

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

  const handlePost = async () => {
    if (!status.trim() && media.length === 0) {
      alert("Please add a status or media!");
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const m of media) {
      const url = await uploadToCloudinary(m.uri, m.type);
      if (url) uploadedUrls.push(url);
    }

    try {
      await axios.post(`https://politics-chi.vercel.app/api/statuses`, {
        userId: user?.id,
        userName:
          user?.firstName ||
          user?.username ||
          user?.publicMetadata?.nickname ||
          "Anonymous",
        caption: status,
        media: uploadedUrls,
      });

      setStatus("");
      setMedia([]);
      navigation.goBack();
    } catch (err) {
      console.error("Error posting status:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Add Status
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholder="What's on your mind?"
        placeholderTextColor={theme.subtext}
        value={status}
        onChangeText={setStatus}
        multiline
      />

      {/* Media Preview */}
      {media.length > 0 && (
        <View style={[styles.mediaContainer, { height: 300 }]}>
          {media.length === 1 ? (
            <View
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              {media[0].type === "image" ? (
                <Image
                  source={{ uri: media[0].uri }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                    backgroundColor: "#000",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="play-circle" size={80} color="#fff" />
                </View>
              )}

              {/* ❌ Remove button (even for one item) */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  padding: 4,
                }}
                onPress={() => removeMedia(media[0].uri)}
              >
                <Ionicons name="close-circle" size={26} color="red" />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                alignItems: "center",
                paddingHorizontal: 6,
                gap: 10,
              }}
            >
              {media.map((m, index) => (
                <View
                  key={index}
                  style={{
                    width: 250,
                    height: 300,
                    borderRadius: 12,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {m.type === "image" ? (
                    <Image
                      source={{ uri: m.uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#000",
                      }}
                    >
                      <Ionicons name="play-circle" size={60} color="#fff" />
                    </View>
                  )}

                  {/* ❌ Remove button for each item */}
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: 20,
                      padding: 4,
                    }}
                    onPress={() => removeMedia(m.uri)}
                  >
                    <Ionicons name="close-circle" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={pickMedia}>
          <Ionicons name="image-outline" size={22} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.text }]}>
            Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={takeMedia}>
          <Ionicons name="camera-outline" size={22} color={theme.primary} />
          <Text style={[styles.actionText, { color: theme.text }]}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.postBtn,
            {
              backgroundColor: theme.primary,
              opacity: status || media.length > 0 ? 1 : 0.6,
            },
          ]}
          onPress={handlePost}
          disabled={uploading || (!status && media.length === 0)}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.postText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 16,
  },
  mediaContainer: { marginTop: 16 },
  singleMedia: {
    width: screenWidth - 32,
    height: 250,
    borderRadius: 12,
  },
  singleVideo: {
    width: screenWidth - 32,
    height: 250,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaWrapper: { marginRight: 10 },
  mediaPreview: { width: 120, height: 120, borderRadius: 12 },
  videoPreview: {
    width: 120,
    height: 120,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 50,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: { fontSize: 14 },
  postBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  postText: { color: "#fff", fontWeight: "600" },
});

export default StatusInput;
