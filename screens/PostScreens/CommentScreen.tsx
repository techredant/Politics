// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   Image,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Modal,
//   ScrollView,
//   StatusBar,
//   Dimensions,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
// import axios from "axios";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useUser } from "@clerk/clerk-expo";
// import { useLevel } from "@/context/LevelContext";
// import { useTheme } from "@/context/ThemeContext";
// import moment from "moment";

// const API_URL = `http://192.168.100.28:3000/api/comments`;

// export default function CommentsScreen() {
//   const route = useRoute<any>();
//   const navigation = useNavigation();
//   const { post } = route.params;

//   const [comments, setComments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [commentText, setCommentText] = useState("");
//   const [replyModalVisible, setReplyModalVisible] = useState(false);
//   const [replyText, setReplyText] = useState("");
//   const [replyingTo, setReplyingTo] = useState<any>(null);
//   const { user } = useUser();
//   const [activeIndex, setActiveIndex] = useState(0);
//   const { userDetails } = useLevel();
//   const flatListRef = useRef<FlatList>(null);
//   const { theme, isDark } = useTheme();

//   useEffect(() => {
//     fetchComments();
//   }, []);

//   const fetchComments = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`http://192.168.100.28:3000/${post._id}`);
//       setComments(res.data);
//     } catch (err) {
//       console.error("Error fetching comments:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddComment = async () => {
//     if (!commentText.trim()) return;
//     try {
//       await axios.post(API_URL, {
//         postId: post._id,
//         userId: user?.id,
//         userName: user?.lastName,
//         text: commentText,
//       });
//       setCommentText("");
//       // optimistic UI → push new comment to state immediately
//       fetchComments();
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd({ animated: true });
//       }, 200);
//     } catch (err) {
//       console.error("Error posting comment:", err);
//     }
//   };
  
//   const handleDeleteComment = async (commentId: string) => {
//     try {
//       await axios.delete(`http://192.168.100.28:3000/${commentId}`);
//       setComments((prev) => prev.filter((c) => c._id !== commentId));
//     } catch (err) {
//       console.error("Error deleting comment:", err);
//     }
//   };

//   const handleLikeComment = async (commentId: string) => {
//     if (!user?.id) return;

//     // Optimistic update
//     setComments((prev) =>
//       prev.map((c) =>
//         c._id === commentId
//           ? {
//               ...c,
//               likes: c.likes.includes(user.id)
//                 ? c.likes.filter((id: string) => id !== user.id)
//                 : [...c.likes, user.id],
//             }
//           : c
//       )
//     );

//     try {
//       await axios.post(`http://192.168.100.28:3000/${commentId}/like`, { userId: user.id });
//     } catch (err) {
//       console.error("Error liking comment:", err);
//       fetchComments();
//     }
//   };

//  const handleLikeReply = async (commentId: string, replyId: string) => {
//    if (!user?.id) return;

//    // Optimistic update
//    setComments((prev) =>
//      prev.map((c) => {
//        if (c._id === commentId) {
//          const replies = c.replies.map((reply: any) =>
//            reply._id === replyId
//              ? {
//                  ...reply,
//                  likes: reply.likes.includes(user.id)
//                    ? reply.likes.filter((id: string) => id !== user.id)
//                    : [...reply.likes, user.id],
//                }
//              : reply
//          );
//          return { ...c, replies };
//        }
//        return c;
//      })
//    );

//    try {
//      await axios.post(`http://192.168.100.28:3000/${commentId}/replies/${replyId}/like`, {
//        userId: user.id,
//      });
//    } catch (err) {
//      console.error("Error liking reply:", err);
//      fetchComments(); // rollback on error
//    }
//  };


//   const handleAddReply = async () => {
//     if (!replyText.trim() || !replyingTo) return;
//     try {
//       await axios.post(`http://192.168.100.28:3000/${replyingTo._id}/reply`, {
//         userId: user?.id,
//         userName: user?.lastName,
//         text: replyText,
//       });
//       setReplyText("");
//       setReplyingTo(null);
//       setReplyModalVisible(false);
//       fetchComments();
//     } catch (err) {
//       console.error("Error adding reply:", err);
//     }
//   };

//   const renderReplies = (replies: any[], parentId: string) =>
//     replies.map((reply, index) => (
//       <View key={index} style={{ marginLeft: 20, marginTop: 8, padding: 6 }}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <Image
//             source={{
//               uri:
//                 userDetails?.image && userDetails.image.trim() !== ""
//                   ? userDetails.image
//                   : user?.imageUrl || "",
//             }}
//             style={{ height: 30, width: 30, borderRadius: 50, marginRight: 8 }}
//           />
//           <Text
//             style={{ fontWeight: "bold", fontSize: 14, color: theme.subtext }}
//           >
//             {reply.userName}
//           </Text>
//         </View>

//         <Text style={{ marginTop: 4, fontSize: 14, color: theme.subtext }}>
//           {reply.text}
//         </Text>

//         <View style={styles.rightActions}>
//           <Text style={styles.timeText}>
//             {moment(reply.createdAt).fromNow()}
//           </Text>
//           <TouchableOpacity
//             style={styles.likeBtn}
//             onPress={() => handleLikeReply(parentId, reply._id)}
//           >
//             <AntDesign
//               name="heart"
//               size={14}
//               color={reply.likes.includes(user?.id) ? "red" : "gray"}
//             />
//             <Text style={styles.likeCount}>{reply.likes.length}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     ));

//   const renderItem = ({ item }: any) => (
//     <View style={styles.commentBox}>
//       {/* Top Row */}
//       <View style={styles.commentHeader}>
//         <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
//           <Image
//             source={{
//               uri:
//                 userDetails?.image && userDetails.image.trim() !== ""
//                   ? userDetails.image
//                   : user?.imageUrl || "",
//             }}
//             style={{ height: 30, width: 30, borderRadius: 20 }}
//           />
//           <Text style={{ fontWeight: "bold", color: theme.text }}>
//             {item.userName}
//           </Text>
//         </View>
//         <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
//           <Ionicons name="time-outline" size={14} color="gray" />
//           <Text style={styles.timeText}>
//             {moment(item.createdAt).fromNow()}
//           </Text>

//           {item.userId === user?.id && (
//             <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
//               <Ionicons name="trash-outline" size={18} color="red" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Comment Text */}
//       <Text style={[styles.commentText, { color: theme.subtext }]}>
//         {item.text}
//       </Text>

//       {/* Actions */}
//       <View style={styles.rightActions}>
//         <TouchableOpacity
//           style={styles.likeBtn}
//           onPress={() => handleLikeComment(item._id)}
//         >
//           <AntDesign
//             name="heart"
//             size={16}
//             color={item.likes.includes(user?.id) ? "red" : "gray"}
//           />
//           <Text style={styles.likeCount}>{item.likes.length}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => {
//             setReplyingTo(item);
//             setReplyModalVisible(true);
//           }}
//         >
//           <Text style={styles.replyBtn}>Reply</Text>
//         </TouchableOpacity>
//       </View>

//       {item.replies && renderReplies(item.replies, item._id)}
//     </View>
//   );

//   return (
//     <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle={isDark ? "light-content" : "dark-content"}
//       />
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={24} color={theme.text} />
//           </TouchableOpacity>
//           <Text style={[styles.headerTitle, { color: theme.text }]}>
//             Comments ({comments.length})
//           </Text>
//           <View style={{ width: 24 }} />
//         </View>

//         {/* Post preview */}
//         <View style={{ padding: 6, borderBottomColor: "#eee" }}>
//           <Text style={[styles.postCaption,{color: theme.text}]}>{post.caption}</Text>
//           <Text style={styles.postUser}>@{post.user?.nickName}</Text>
//         </View>

//         {/* Comments list */}
//         {loading ? (
//           <ActivityIndicator
//             size="large"
//             color="gray"
//             style={{ marginTop: 20 }}
//           />
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={comments}
//             keyExtractor={(item) => item._id}
//             renderItem={renderItem}
//             style={{ flex: 1 }}
//             contentContainerStyle={{ paddingBottom: 20 }}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No comments yet</Text>
//             }
//           />
//         )}

//         {/* Add comment */}
//         <View style={styles.inputRow}>
//           <View style={[styles.inputWrapper,{borderColor: theme.border}]}>
//             <TextInput
//               style={[styles.inputText, { color: theme.text }]}
//               placeholder="Add a comment..."
//               value={commentText}
//               onChangeText={setCommentText}
//               placeholderTextColor={theme.subtext}
//             />
//             <TouchableOpacity onPress={handleAddComment}>
//               <Feather name="send" size={20} color={theme.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>

//       {/* Reply Modal */}
//       <Modal
//         visible={replyModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setReplyModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
//             <Text style={[styles.modalTitle, { color: theme.subtext }]}>
//               Replying to {replyingTo?.userName}
//             </Text>
//             <TextInput
//               style={[styles.input, { color: theme.text }]}
//               placeholder="Write a reply..."
//               value={replyText}
//               onChangeText={setReplyText}
//               placeholderTextColor={theme.subtext}
//               numberOfLines={10}
//             />
//             <View style={styles.modalActions}>
//               <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
//                 <Text style={{ color: "red" }}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleAddReply}>
//                 <Text style={{ color: "blue" }}>Send</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     justifyContent: "space-between",
//   },
//   headerTitle: { fontSize: 16, fontWeight: "bold" },
//   postCaption: { fontSize: 14, marginBottom: 4 },
//   postUser: { fontSize: 12, color: "gray" },
//   commentBox: { padding: 10 },
//   commentHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   commentText: { marginVertical: 2 },
//   rightActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     gap: 16,
//     marginTop: 6,
//   },
//   timeText: { fontSize: 12, color: "gray" },
//   likeBtn: { flexDirection: "row", alignItems: "center" },
//   likeCount: { fontSize: 12, marginLeft: 4, color: "gray" },
//   replyBtn: { fontSize: 13, color: "blue" },
//   emptyText: { textAlign: "center", marginTop: 20, color: "gray" },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 8,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: "#eee",
//   },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   inputText: { flex: 1, paddingVertical: 6 },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     width: "90%",
//     minHeight: 250,
//     borderRadius: 12,
//     padding: 20,
//   },
//   modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
//   input: {
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     minHeight: 120,
//     textAlignVertical: "top",
//     marginBottom: 16,
//   },
//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
// });

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useLevel } from "@/context/LevelContext";
import { useTheme } from "@/context/ThemeContext";
import moment from "moment";

const API_URL = `http://192.168.100.4:3000/api/comments`;

export default function CommentsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { post } = route.params;

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const { user } = useUser();
  const { userDetails } = useLevel();
  const { theme, isDark } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  // ✅ Fetch comments when screen loads
  useEffect(() => {
    fetchComments();
    incrementViews(); // ✅ count post view when comments are opened
  }, []);

  // ✅ Count views when comments screen opens
  const incrementViews = async () => {
    try {
      await axios.put(`http://192.168.100.4:3000/api/posts/${post._id}/views`);
    } catch (err) {
      console.error("Error incrementing views:", err);
    }
  };

  // ✅ Fetch all comments for the post
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/${post._id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(API_URL, {
        postId: post._id,
        userId: user?.id,
        userName: user?.username || user?.lastName || "Unknown",
        text: commentText.trim(),
      });
      setCommentText("");
      await incrementViews(); // ✅ count comment interaction
      fetchComments();
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        200
      );
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  // ✅ Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`${API_URL}/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // ✅ Like a comment
  const handleLikeComment = async (commentId: string) => {
    if (!user?.id) return;
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? {
              ...c,
              likes: c.likes.includes(user.id)
                ? c.likes.filter((id: string) => id !== user.id)
                : [...c.likes, user.id],
            }
          : c
      )
    );
    try {
      await axios.post(`${API_URL}/${commentId}/like`, { userId: user.id });
      await incrementViews(); // ✅ count like interaction
    } catch (err) {
      console.error("Error liking comment:", err);
      fetchComments();
    }
  };

  // ✅ Like a reply
  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!user?.id) return;
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === commentId) {
          const replies = c.replies.map((reply: any) =>
            reply._id === replyId
              ? {
                  ...reply,
                  likes: reply.likes.includes(user.id)
                    ? reply.likes.filter((id: string) => id !== user.id)
                    : [...reply.likes, user.id],
                }
              : reply
          );
          return { ...c, replies };
        }
        return c;
      })
    );
    try {
      await axios.post(`${API_URL}/${commentId}/replies/${replyId}/like`, {
        userId: user.id,
      });
      await incrementViews(); // ✅ count like interaction
    } catch (err) {
      console.error("Error liking reply:", err);
      fetchComments();
    }
  };

  // ✅ Add reply
  const handleAddReply = async () => {
    if (!replyText.trim() || !replyingTo) return;
    try {
      await axios.post(`${API_URL}/${replyingTo._id}/reply`, {
        userId: user?.id,
        userName: user?.username || user?.lastName || "Unknown",
        text: replyText.trim(),
      });
      setReplyText("");
      setReplyingTo(null);
      setReplyModalVisible(false);
      await incrementViews(); // ✅ count reply interaction
      fetchComments();
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  // ✅ Render replies
  const renderReplies = (replies: any[], parentId: string) =>
    replies.map((reply, index) => (
      <View key={index} style={{ marginLeft: 20, marginTop: 8, padding: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{
              uri: reply.userImage || userDetails?.image || user?.imageUrl,
            }}
            style={{ height: 30, width: 30, borderRadius: 50, marginRight: 8 }}
          />
          <Text
            style={{ fontWeight: "bold", fontSize: 14, color: theme.subtext }}
          >
            {reply.userName}
          </Text>
        </View>

        <Text style={{ marginTop: 4, fontSize: 14, color: theme.subtext }}>
          {reply.text}
        </Text>

        <View style={styles.rightActions}>
          <Text style={styles.timeText}>
            {moment(reply.createdAt).fromNow()}
          </Text>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => handleLikeReply(parentId, reply._id)}
          >
            <AntDesign
              name="heart"
              size={14}
              color={reply.likes.includes(user?.id) ? "red" : "gray"}
            />
            <Text style={styles.likeCount}>{reply.likes.length}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));

  // ✅ Render each comment
  const renderItem = ({ item }: any) => (
    <View style={styles.commentBox}>
      <View style={styles.commentHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image
            source={{
              uri: item.userImage || userDetails?.image || user?.imageUrl,
            }}
            style={{ height: 30, width: 30, borderRadius: 20 }}
          />
          <Text style={{ fontWeight: "bold", color: theme.text }}>
            {item.userName}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={14} color="gray" />
          <Text style={styles.timeText}>
            {moment(item.createdAt).fromNow()}
          </Text>
          {item.userId === user?.id && (
            <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.commentText, { color: theme.subtext }]}>
        {item.text}
      </Text>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={() => handleLikeComment(item._id)}
        >
          <AntDesign
            name="heart"
            size={16}
            color={item.likes.includes(user?.id) ? "red" : "gray"}
          />
          <Text style={styles.likeCount}>{item.likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setReplyingTo(item);
            setReplyModalVisible(true);
          }}
        >
          <Text style={styles.replyBtn}>Reply</Text>
        </TouchableOpacity>
      </View>

      {item.replies && renderReplies(item.replies, item._id)}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Comments ({comments.length})
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ padding: 6, borderBottomColor: "#eee" }}>
          <Text style={[styles.postCaption, { color: theme.text }]}>
            {post.caption}
          </Text>
          <Text style={styles.postUser}>@{post.user?.nickName}</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="gray"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No comments yet</Text>
            }
          />
        )}

        <View style={styles.inputRow}>
          <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.inputText, { color: theme.text }]}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              placeholderTextColor={theme.subtext}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Feather name="send" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.subtext }]}>
              Replying to {replyingTo?.userName}
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Write a reply..."
              value={replyText}
              onChangeText={setReplyText}
              placeholderTextColor={theme.subtext}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddReply}>
                <Text style={{ color: "blue" }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  postCaption: { fontSize: 14, marginBottom: 4 },
  postUser: { fontSize: 12, color: "gray" },
  commentBox: { padding: 10 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentText: { marginVertical: 2 },
  rightActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
  },
  timeText: { fontSize: 12, color: "gray" },
  likeBtn: { flexDirection: "row", alignItems: "center" },
  likeCount: { fontSize: 12, marginLeft: 4, color: "gray" },
  replyBtn: { fontSize: 13, color: "blue" },
  emptyText: { textAlign: "center", marginTop: 20, color: "gray" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inputText: { flex: 1, paddingVertical: 6 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    minHeight: 250,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
});