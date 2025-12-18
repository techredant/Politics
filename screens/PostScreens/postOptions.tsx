
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Share,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  Feather,
  AntDesign,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
interface PostOptionsProps {
  post: { _id: string; userId: string };
  currentUserId: string;
  onDelete?: (postId: string) => void;
  onUnfollow?: (userId: string) => void;
  onReport?: (postId: string) => void;
  onClose?: () => void;
}

const PostOptionsModal: React.FC<PostOptionsProps> = ({
  post,
  currentUserId,
  onDelete,
  onUnfollow,
  onReport,
  onClose,
}) => {
  const { theme } = useTheme();
  const isOwner = currentUserId === post.userId;
  const postLink = `https://politics-chi.vercel.app/api/posts/${post._id}`;

  const options = [
    {
      label: "Report",
      icon: <MaterialIcons name="report" size={20} color="gold" />,
    },
    isOwner
      ? {
          label: "Delete",
          icon: <AntDesign name="delete" size={20} color="red" />,
        }
      : {
          label: "Unfollow",
          icon: <Feather name="user-x" size={20} color={theme.text} />,
        },
    {
      label: "Share Link",
      icon: <Ionicons name="share-social-outline" size={20} color={theme.text} />,
    },
    {
      label: "Copy Link",
      icon: <Feather name="copy" size={20} color={theme.text} />,
    },
  ];

  const handleOption = async (option: string) => {
    onClose?.();
    switch (option) {
      case "Delete":
        onDelete?.(post._id);
        break;
      case "Unfollow":
        onUnfollow?.(post.userId);
        break;
      case "Report":
        onReport?.(post._id);
        break;
      case "Share Link":
        try {
          await Share.share({ message: postLink });
        } catch (err) {
          console.error(err);
        }
        break;
      case "Copy Link":
        await Clipboard.setStringAsync(postLink);
        break;
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[styles.optionButton, { borderBottomColor: theme.border }]}
            onPress={() => handleOption(opt.label)} // ✅ call the proper handler
          >
            <View style={styles.optionContent}>
              {opt.icon}
              <Text
                style={[
                  styles.optionText,
                  { color: theme.text },
                  opt.label === "Delete"
                    ? { color: "red" }
                    : opt.label === "Report"
                    ? { color: "gold" }
                    : {},
                ]}
              >
                {opt.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.optionButton,
            { marginTop: 8, borderColor: theme.border },
          ]}
          onPress={onClose}
        >
          <Text
            style={[
              styles.optionText,
              { fontWeight: "bold", color: theme.text },
            ]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default PostOptionsModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalContainer: {
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // borderWidth: 1,
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  optionContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionText: { fontSize: 16, textAlign: "center" },
});
